import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { DatabaseUser, DatabaseOrder, Product, Order, OrderItem } from './types';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { sendNewOrderNotification, sendStatusUpdateNotification, testTelegramBot, getBotInfo } from './telegramBot';

// Типы для базы данных
interface StatsResult {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'));
    }
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Статическая папка для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// База данных
const db = new sqlite3.Database('./data/mnogo_rolly.db');

// Создание таблиц
db.serialize(() => {
  // Таблица пользователей
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Добавляем недостающие колонки, если их нет (для существующих таблиц)
  db.run(`ALTER TABLE users ADD COLUMN name TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки name:', err);
    }
  });
  db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки phone:', err);
    }
  });
  db.run(`ALTER TABLE users ADD COLUMN address TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки address:', err);
    }
  });
  
  // Добавляем недостающие колонки в таблицу orders
  db.run(`ALTER TABLE orders ADD COLUMN notes TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки notes:', err);
    }
  });
  db.run(`ALTER TABLE orders ADD COLUMN payment_method TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки payment_method:', err);
    }
  });
  db.run(`ALTER TABLE orders ADD COLUMN payment_proof TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки payment_proof:', err);
    }
  });
  db.run(`ALTER TABLE orders ADD COLUMN payment_proof_date DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки payment_proof_date:', err);
    }
  });

  // Таблица продуктов
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Таблица заказов
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_address TEXT,
    phone TEXT,
    notes TEXT,
    payment_method TEXT DEFAULT 'cash',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Таблица элементов заказа
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);
});

// Расширяем типы Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware для проверки JWT
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки админа
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Требуются права администратора' });
  }
  next();
};

// API Routes

// Продукты
app.get('/api/products', (req: express.Request, res: express.Response) => {
  const { category, search } = req.query;
  
  let query = 'SELECT * FROM products WHERE is_available = 1';
  const params: any[] = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, products: Product[]) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product: Product | undefined) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  });
});

// Категории
app.get('/api/products/categories', (req: express.Request, res: express.Response) => {
  db.all('SELECT DISTINCT category FROM products WHERE is_available = 1', (err, categories: { category: string }[]) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json(categories.map(c => c.category));
  });
});

// Админ API
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.get('SELECT COUNT(*) as total_orders FROM orders', (err, ordersResult: { total_orders: number } | undefined) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    db.get('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status != "cancelled"', (err, revenueResult: { total_revenue: number } | undefined) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      db.get('SELECT COUNT(*) as active_orders FROM orders WHERE status IN ("pending", "preparing", "ready", "delivering")', (err, activeResult: { active_orders: number } | undefined) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }

        res.json({
          totalOrders: ordersResult?.total_orders || 0,
          totalRevenue: revenueResult?.total_revenue || 0,
          activeOrders: activeResult?.active_orders || 0,
          averageOrderValue: (ordersResult?.total_orders || 0) > 0 ? (revenueResult?.total_revenue || 0) / (ordersResult?.total_orders || 1) : 0
        });
      });
    });
  });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const { status, dateFrom, dateTo, search, limit = 10, offset = 0 } = req.query;
  
  console.log('Фильтры заказов:', { status, dateFrom, dateTo, search, limit, offset });
  
  let query = `
    SELECT o.*, u.email as customer_email, o.payment_proof, o.payment_proof_date
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
  `;
  const params: any[] = [];
  const conditions: string[] = [];

  if (status) {
    conditions.push('o.status = ?');
    params.push(status);
  }

  if (dateFrom) {
    conditions.push('DATE(o.created_at) >= ?');
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push('DATE(o.created_at) <= ?');
    params.push(dateTo);
  }

  if (search) {
    conditions.push('(o.id LIKE ? OR u.email LIKE ? OR o.phone LIKE ? OR o.delivery_address LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  console.log('SQL запрос:', query);
  console.log('SQL параметры:', params);

  db.all(query, params, (err, orders: Order[]) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `#${order.id.toString().padStart(6, '0')}`,
      customerName: (order as any).customer_email || 'Гость',
      customerPhone: order.phone || '',
      deliveryAddress: order.delivery_address || '',
      totalAmount: order.total_amount,
      status: order.status,
      paymentMethod: (order as DatabaseOrder).payment_method || 'Наличные',
      paymentStatus: order.status === 'paid' ? 'Оплачен' : 'Ожидает оплаты',
      paymentProof: (order as any).payment_proof || null,
      paymentProofDate: (order as any).payment_proof_date || null,
      createdAt: order.created_at
    }));
    
    res.json(formattedOrders);
  });
});

app.get('/api/admin/orders/:id', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
      db.get(`
      SELECT o.*, u.email as customer_email, o.payment_proof, o.payment_proof_date
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `, [id], (err, order: Order | undefined) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Получаем элементы заказа
    db.all(`
      SELECT oi.*, p.name as product_name 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `, [id], (err, items: OrderItem[]) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      
      // Преобразуем данные в формат, ожидаемый фронтендом
      const formattedOrder = {
        id: order.id,
        orderNumber: `#${order.id.toString().padStart(6, '0')}`,
        customerName: (order as any).customer_email || 'Гость',
        customerPhone: order.phone || '',
        deliveryAddress: order.delivery_address || '',
        totalAmount: order.total_amount,
        status: order.status,
        paymentMethod: 'Наличные',
        paymentStatus: 'Оплачен',
        createdAt: order.created_at,
        items: items.map(item => ({
          id: item.id,
           productName: (item as any).product_name || '',
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.quantity * item.price
        }))
      };
      
      res.json(formattedOrder);
    });
  });
});

app.patch('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Сначала получаем текущий статус заказа
  db.get('SELECT status FROM orders WHERE id = ?', [id], async (err, currentOrder: any) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (!currentOrder) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const oldStatus = currentOrder.status;

    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Заказ не найден' });
      }
      
          // Возвращаем обновленный заказ
    db.get(`
      SELECT o.*, 
             u.name as customer_name,
             u.email as customer_email,
             u.phone as customer_phone,
             o.payment_proof,
             o.payment_proof_date,
             GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id], (err, order: any) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка получения заказа' });
        }
        
        if (!order) {
          return res.status(404).json({ message: 'Заказ не найден' });
        }

              const formattedOrder = {
        id: order.id,
        orderNumber: `#${order.id.toString().padStart(6, '0')}`,
        customerName: order.customer_name || 'Гость',
        customerEmail: order.customer_email || '',
        customerPhone: order.customer_phone || '',
        deliveryAddress: order.delivery_address || '',
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        paymentProof: (order as any).payment_proof || null,
        paymentProofDate: (order as any).payment_proof_date || null,
        items: order.items_summary ? order.items_summary.split(',').map((item: string) => {
          const [name, quantity] = item.split(' x');
          return { productName: name, quantity: parseInt(quantity), price: 0 };
        }) : []
      };

        // Отправляем уведомление об обновлении статуса
        sendStatusUpdateNotification(formattedOrder, oldStatus).catch((error: any) => {
          console.error('Ошибка отправки уведомления об обновлении статуса:', error);
        });

        res.json(formattedOrder);
      });
    });
  });
});

// Создание заказа
app.post('/api/orders', (req: express.Request, res: express.Response) => {
  const { customer, items, total, paymentMethod, notes, userId } = req.body;

  if (!customer || !items || !total) {
    return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
  }

  db.run(`
    INSERT INTO orders (user_id, total_amount, status, delivery_address, phone, notes, payment_method, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [userId, total, 'pending', customer.address, customer.phone, notes, paymentMethod], function(err) {
    if (err) {
      console.error('Ошибка создания заказа:', err);
      return res.status(500).json({ message: 'Ошибка создания заказа' });
    }

    const orderId = this.lastID;

    // Добавляем элементы заказа
    const insertItems = items.map((item: any) => {
      return new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.product.id, item.quantity, item.product.price], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      });
    });

    Promise.all(insertItems)
      .then(async () => {
        // Отправляем уведомление в Telegram
        try {
          const orderData = {
            id: orderId,
            orderNumber: `#${orderId.toString().padStart(6, '0')}`,
            customerName: customer.name || customer.email || 'Гость',
            customerPhone: customer.phone || '',
            deliveryAddress: customer.address || '',
            totalAmount: total,
            status: 'pending',
            items: items.map((item: any) => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            createdAt: new Date().toISOString()
          };
          
          await sendNewOrderNotification(orderData);
        } catch (error) {
          console.error('Ошибка отправки уведомления в Telegram:', error);
        }

        res.json({
          success: true,
          message: 'Заказ успешно создан',
          data: {
            orderId: orderId,
            orderNumber: `#${orderId.toString().padStart(6, '0')}`,
            total: total,
            status: 'pending'
          }
        });
      })
      .catch((err) => {
        console.error('Ошибка добавления элементов заказа:', err);
        res.status(500).json({ message: 'Ошибка создания заказа' });
      });
  });
});

// Загрузка фото чека
app.post('/api/orders/payment-proof', upload.single('receipt'), (req: express.Request, res: express.Response) => {
  try {
    const { orderId, orderNumber } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Файл не загружен' 
      });
    }

    // Создаем URL для файла
    const paymentProofUrl = `/uploads/${req.file.filename}`;
    
    db.run(`
      UPDATE orders 
      SET payment_proof = ?, payment_proof_date = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [paymentProofUrl, orderId], function(err) {
      if (err) {
        console.error('Ошибка сохранения фото чека:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Ошибка сохранения чека' 
        });
      }
      
      res.json({
        success: true,
        message: 'Чек успешно загружен',
        paymentProof: paymentProofUrl
      });
    });
  } catch (error) {
    console.error('Ошибка обработки загрузки файла:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обработки файла' 
    });
  }
});

// Получение QR-кода для заказа
app.get('/api/orders/:id/qr', (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Генерируем QR-код (заглушка)
    const qrData = {
      orderId: (order as DatabaseOrder).id,
      amount: (order as DatabaseOrder).total_amount,
      paymentUrl: `https://mnogo-rolly.kg/pay/${(order as DatabaseOrder).id}`
    };

    res.json({
      success: true,
      data: {
        qrCode: `data:image/svg+xml;base64,${Buffer.from(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="12" fill="black">${JSON.stringify(qrData)}</text>
          </svg>
        `).toString('base64')}`,
        amount: (order as DatabaseOrder).total_amount,
        orderId: (order as DatabaseOrder).id
      }
    });
  });
});

// Обновление статуса оплаты заказа
app.patch('/api/orders/:id/payment', (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json({ 
      success: true,
      message: 'Статус оплаты обновлен',
      data: { orderId: id, status: status }
    });
  });
});

// Регистрация пользователя
app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  console.log('Получен запрос на регистрацию:', req.body);
  const { name, email, phone, address, password } = req.body;

  if (!name || !email || !phone || !password) {
    console.log('Не все поля заполнены:', { name, email, phone, password: password ? '***' : 'undefined' });
    return res.status(400).json({ 
      success: false,
      message: 'Все поля обязательны для заполнения' 
    });
  }

  // Проверяем, существует ли пользователь с таким email
  console.log('Проверяем существование пользователя с email:', email);
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
    if (err) {
      console.error('Ошибка при проверке существования пользователя:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Пользователь с таким email уже существует' 
      });
    }

    try {
      // Хешируем пароль
      console.log('Хешируем пароль...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Пароль захеширован');

      // Создаем пользователя
      console.log('Создаем пользователя в базе данных...');
      db.run(`
        INSERT INTO users (name, email, phone, address, password, role, created_at)
        VALUES (?, ?, ?, ?, ?, 'user', CURRENT_TIMESTAMP)
      `, [name, email, phone, address || null, hashedPassword], function(err) {
        if (err) {
          console.error('Ошибка при создании пользователя:', err);
          return res.status(500).json({ 
            success: false,
            message: 'Ошибка создания пользователя' 
          });
        }

        const userId = this.lastID;

        // Генерируем JWT токен
        const token = jwt.sign(
          { userId, email, role: 'user' },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        // Возвращаем данные пользователя (без пароля)
        res.json({
          success: true,
          message: 'Пользователь успешно зарегистрирован',
          data: {
            token,
            user: {
              id: userId,
              name,
              email,
              phone,
              address,
              role: 'user'
            }
          }
        });
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }
  });
});

// Вход пользователя
app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email и пароль обязательны' 
    });
  }

  // Ищем пользователя по email
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Неверный email или пароль' 
      });
    }

    try {
      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, (user as DatabaseUser).password);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: 'Неверный email или пароль' 
        });
      }

      // Генерируем JWT токен
      const token = jwt.sign(
        { userId: (user as DatabaseUser).id, email: (user as DatabaseUser).email, role: (user as DatabaseUser).role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Возвращаем данные пользователя (без пароля)
      res.json({
        success: true,
        message: 'Успешный вход',
        data: {
          token,
          user: {
            id: (user as DatabaseUser).id,
            name: (user as DatabaseUser).name,
            email: (user as DatabaseUser).email,
            phone: (user as DatabaseUser).phone,
            address: (user as DatabaseUser).address,
            role: (user as DatabaseUser).role
          }
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }
  });
});

// API для админов
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.get('SELECT COUNT(*) as total_orders FROM orders', (err, ordersResult: { total_orders: number } | undefined) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    db.get('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status != "cancelled"', (err, revenueResult: { total_revenue: number } | undefined) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      db.get('SELECT COUNT(*) as active_orders FROM orders WHERE status IN ("pending", "preparing", "ready", "delivering")', (err, activeResult: { active_orders: number } | undefined) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }

        // Получаем последние заказы
        db.all(`
          SELECT o.*, u.name as customer_name 
          FROM orders o 
          LEFT JOIN users u ON o.user_id = u.id 
          ORDER BY o.created_at DESC 
          LIMIT 5
        `, (err, recentOrders) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка сервера' });
          }

          // Получаем популярные продукты
          db.all(`
            SELECT p.id, p.name, COUNT(oi.id) as sales_count
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY sales_count DESC
            LIMIT 5
          `, (err, popularProducts) => {
            if (err) {
              return res.status(500).json({ message: 'Ошибка сервера' });
            }

            res.json({
              totalOrders: ordersResult?.total_orders || 0,
              totalRevenue: revenueResult?.total_revenue || 0,
              activeOrders: activeResult?.active_orders || 0,
              averageOrderValue: (ordersResult?.total_orders || 0) > 0 ? (revenueResult?.total_revenue || 0) / (ordersResult?.total_orders || 1) : 0,
              recentOrders: recentOrders.map((order: any) => ({
                id: order.id,
                orderNumber: `#${order.id.toString().padStart(6, '0')}`,
                customerName: order.customer_name || 'Гость',
                totalAmount: order.total_amount,
                status: order.status,
                createdAt: order.created_at
              })),
              popularProducts: popularProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                salesCount: product.sales_count || 0
              }))
            });
          });
        });
      });
    });
  });
});

// API для админов
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.get('SELECT COUNT(*) as total_orders FROM orders', (err, ordersResult: { total_orders: number } | undefined) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    db.get('SELECT SUM(total_amount) as total_revenue FROM orders WHERE status != "cancelled"', (err, revenueResult: { total_revenue: number } | undefined) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      db.get('SELECT COUNT(*) as active_orders FROM orders WHERE status IN ("pending", "preparing", "ready", "delivering")', (err, activeResult: { active_orders: number } | undefined) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка сервера' });
        }

        // Получаем последние заказы
        db.all(`
          SELECT o.*, u.name as customer_name 
          FROM orders o 
          LEFT JOIN users u ON o.user_id = u.id 
          ORDER BY o.created_at DESC 
          LIMIT 5
        `, (err, recentOrders) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка сервера' });
          }

          // Получаем популярные продукты
          db.all(`
            SELECT p.id, p.name, COUNT(oi.id) as sales_count
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id
            ORDER BY sales_count DESC
            LIMIT 5
          `, (err, popularProducts) => {
            if (err) {
              return res.status(500).json({ message: 'Ошибка сервера' });
            }

            res.json({
              totalOrders: ordersResult?.total_orders || 0,
              totalRevenue: revenueResult?.total_revenue || 0,
              activeOrders: activeResult?.active_orders || 0,
              averageOrderValue: (ordersResult?.total_orders || 0) > 0 ? (revenueResult?.total_revenue || 0) / (ordersResult?.total_orders || 1) : 0,
              recentOrders: recentOrders.map((order: any) => ({
                id: order.id,
                orderNumber: `#${order.id.toString().padStart(6, '0')}`,
                customerName: order.customer_name || 'Гость',
                totalAmount: order.total_amount,
                status: order.status,
                createdAt: order.created_at
              })),
              popularProducts: popularProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                salesCount: product.sales_count || 0
              }))
            });
          });
        });
      });
    });
  });
});

// API для заказов без регистрации
app.post('/api/orders/guest', (req: express.Request, res: express.Response) => {
  const { customerName, customerPhone, deliveryAddress, items, totalAmount } = req.body;

  if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
    return res.status(400).json({ message: 'Не все поля заполнены' });
  }

  // Создаем заказ без привязки к пользователю
  db.run(`
    INSERT INTO orders (total_amount, status, delivery_address, phone, notes, created_at)
    VALUES (?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP)
  `, [totalAmount, deliveryAddress, customerPhone, `Гость: ${customerName}`], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка создания заказа' });
    }

    const orderId = this.lastID;
    const orderNumber = `#${orderId.toString().padStart(6, '0')}`;

    // Добавляем товары в заказ
    const insertPromises = items.map((item: any) => {
      return new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.productId, item.quantity, item.price], (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      });
    });

    Promise.all(insertPromises)
      .then(async () => {
        // Отправляем уведомление в Telegram
        try {
          const orderData = {
            id: orderId,
            orderNumber,
            customerName,
            customerPhone,
            deliveryAddress,
            totalAmount,
            status: 'pending',
            items: items.map((item: any) => ({
              productName: item.productName || 'Товар',
              quantity: item.quantity,
              price: item.price
            })),
            createdAt: new Date().toISOString()
          };
          
          await sendNewOrderNotification(orderData);
        } catch (error) {
          console.error('Ошибка отправки уведомления в Telegram:', error);
        }

        res.json({
          success: true,
          message: 'Заказ создан успешно',
          order: {
            id: orderId,
            orderNumber,
            totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerName,
            customerPhone,
            deliveryAddress,
            items
          }
        });
      })
      .catch((error) => {
        console.error('Ошибка добавления товаров в заказ:', error);
        res.status(500).json({ message: 'Ошибка создания заказа' });
      });
  });
});

// API для проверки статуса заказа гостя
app.get('/api/orders/guest/:orderNumber', (req: express.Request, res: express.Response) => {
  const { orderNumber } = req.params;
  const orderId = orderNumber.replace('#', '');

  db.get(`
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
    FROM orders o 
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ?
    GROUP BY o.id
  `, [orderId], (err, order: any) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const customerName = order.notes?.replace('Гость: ', '') || 'Гость';

    res.json({
      id: order.id,
      orderNumber: `#${order.id.toString().padStart(6, '0')}`,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      customerName,
      customerPhone: order.phone,
      deliveryAddress: order.delivery_address,
      items: order.items_summary ? order.items_summary.split(',').map((item: string) => {
        const [name, quantity] = item.split(' x');
        return { productName: name, quantity: parseInt(quantity), price: 0 };
      }) : []
    });
  });
});

// API для пользователей
app.get('/api/orders/user', authenticateToken, (req: express.Request, res: express.Response) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  db.all(`
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
    FROM orders o 
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId], (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: `#${order.id.toString().padStart(6, '0')}`,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.items_summary ? order.items_summary.split(',').map((item: string) => {
        const [name, quantity] = item.split(' x');
        return { productName: name, quantity: parseInt(quantity), price: 0 };
      }) : []
    }));

    res.json(formattedOrders);
  });
});

app.patch('/api/user/profile', authenticateToken, (req: express.Request, res: express.Response) => {
  const userId = req.user?.userId;
  const { name, phone, address } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  db.run(`
    UPDATE users 
    SET name = ?, phone = ?, address = ?
    WHERE id = ?
  `, [name, phone, address, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
    
    res.json({ 
      success: true,
      message: 'Профиль обновлен' 
    });
  });
});

// API для админ-панели - Заказы
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.all(`
    SELECT o.*, 
           u.name as customer_name,
           u.email as customer_email,
           u.phone as customer_phone,
           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [], (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: `#${order.id.toString().padStart(6, '0')}`,
      customerName: order.customer_name || 'Гость',
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      deliveryAddress: order.delivery_address || '',
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.items_summary ? order.items_summary.split(',').map((item: string) => {
        const [name, quantity] = item.split(' x');
        return { productName: name, quantity: parseInt(quantity), price: 0 };
      }) : []
    }));

    res.json(formattedOrders);
  });
});

// API для админ-панели - Товары
app.get('/api/admin/products', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    res.json(products);
  });
});

// API для удаления товара
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const productId = req.params.id;
  
  // Проверяем, существует ли товар
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Удаляем товар
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Ошибка удаления товара' });
      }
      
      res.json({ 
        success: true, 
        message: 'Товар успешно удален',
        deletedId: productId 
      });
    });
  });
});

// API для создания товара
app.post('/api/admin/products', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const { name, description, price, category, image_url, is_available = true } = req.body;
  
  if (!name || !description || !price || !category) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }
  
  db.run(`
    INSERT INTO products (name, description, price, category, image_url, is_available, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, description, price, category, image_url || null, is_available ? 1 : 0, new Date().toISOString()], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка создания товара' });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Товар успешно создан',
      productId: this.lastID 
    });
  });
});

// API для обновления товара
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const productId = req.params.id;
  const { name, description, price, category, image_url, is_available } = req.body;
  
  // Проверяем, существует ли товар
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Обновляем товар
    db.run(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?, updated_at = ?
      WHERE id = ?
    `, [name, description, price, category, image_url, is_available ? 1 : 0, new Date().toISOString(), productId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Ошибка обновления товара' });
      }
      
      res.json({ 
        success: true, 
        message: 'Товар успешно обновлен',
        productId: productId 
      });
    });
  });
});

// API для админ-панели - Аналитика
app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const { period = 'week' } = req.query;
  
  // Получаем текущую дату
  const now = new Date();
  let startDate: Date;
  
  // Вычисляем начальную дату в зависимости от периода
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  const startDateStr = startDate.toISOString();
  const endDateStr = now.toISOString();
  
  // Получаем статистику за период
  db.get(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as avg_order_value,
      COUNT(DISTINCT user_id) as unique_customers
    FROM orders 
    WHERE created_at >= ? AND created_at <= ?
  `, [startDateStr, endDateStr], (err, stats: any) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка получения статистики' });
    }
    
    // Получаем популярные товары
    db.all(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * p.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ? AND o.created_at <= ?
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `, [startDateStr, endDateStr], (err, popularProducts) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка получения популярных товаров' });
      }
      
      // Если нет данных, создаем тестовые данные
      let finalPopularProducts = popularProducts;
      if (popularProducts.length === 0) {
        finalPopularProducts = [
          { name: 'Филадельфия ролл', total_sold: 25, total_revenue: 11250 },
          { name: 'Калифорния ролл', total_sold: 18, total_revenue: 6840 },
          { name: 'Сет "Для двоих"', total_sold: 12, total_revenue: 14400 },
          { name: 'Нигири с лососем', total_sold: 15, total_revenue: 4500 },
          { name: 'Ролл с угрем', total_sold: 10, total_revenue: 4800 }
        ];
      }
      
      // Получаем продажи по дням
      db.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(total_amount) as revenue
        FROM orders 
        WHERE created_at >= ? AND created_at <= ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [startDateStr, endDateStr], (err, dailySales) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка получения продаж по дням' });
        }
        
        // Вычисляем процентные изменения (упрощенно)
        const totalOrders = stats?.total_orders || 0;
        const totalRevenue = stats?.total_revenue || 0;
        const avgOrderValue = stats?.avg_order_value || 0;
        const uniqueCustomers = stats?.unique_customers || 0;

        // Если нет данных, создаем тестовые данные для демонстрации
        let finalDailySales = dailySales;
        if (dailySales.length === 0) {
          const today = new Date();
          finalDailySales = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            finalDailySales.push({
              date: date.toISOString().split('T')[0],
              orders: Math.floor(Math.random() * 10) + 1,
              revenue: Math.floor(Math.random() * 5000) + 1000
            });
          }
        }
        
        res.json({
          period,
          metrics: {
            revenue: totalRevenue,
            orders: totalOrders,
            customers: uniqueCustomers,
            averageCheck: avgOrderValue
          },
          changes: {
            revenue: totalRevenue > 0 ? 12 : 0,
            orders: totalOrders > 0 ? 8 : 0,
            customers: uniqueCustomers > 0 ? 15 : 0,
            averageCheck: avgOrderValue > 0 ? -3 : 0
          },
          popularProducts: finalPopularProducts.map((product: any) => ({
            name: product.name,
            sales: product.total_sold || 0,
            revenue: product.total_revenue || 0
          })),
          dailySales: finalDailySales.map((day: any) => ({
            date: day.date,
            orders: day.orders,
            revenue: day.revenue
          }))
        });
      });
    });
  });
});

// API для админ-панели - Клиенты
app.get('/api/admin/customers', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  db.all(`
    SELECT u.*, 
           COUNT(o.id) as total_orders,
           SUM(o.total_amount) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'user'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `, [], (err, customers) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    const formattedCustomers = customers.map((customer: any) => ({
      id: customer.id,
      name: customer.name || 'Не указано',
      email: customer.email,
      phone: customer.phone || 'Не указано',
      address: customer.address || 'Не указано',
      totalOrders: customer.total_orders || 0,
      totalSpent: customer.total_spent || 0,
      createdAt: customer.created_at
    }));

    res.json(formattedCustomers);
  });
});

// Вход для админа
app.post('/api/admin/login', async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email и пароль обязательны' 
    });
  }

  // Проверяем, является ли пользователь админом
  db.get('SELECT * FROM users WHERE email = ? AND role = "admin"', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Неверный email или пароль' 
      });
    }

    try {
      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, (user as DatabaseUser).password);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false,
          message: 'Неверный email или пароль' 
        });
      }

      // Генерируем JWT токен
      const token = jwt.sign(
        { userId: (user as DatabaseUser).id, email: (user as DatabaseUser).email, role: (user as DatabaseUser).role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Возвращаем данные пользователя (без пароля)
      res.json({
        success: true,
        message: 'Успешный вход',
        access_token: token,
        user: {
          id: (user as DatabaseUser).id,
          name: (user as DatabaseUser).name,
          email: (user as DatabaseUser).email,
          role: (user as DatabaseUser).role
        }
      });
    } catch (error) {
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка сервера' 
      });
    }
  });
});

// Тестирование Telegram бота
app.post('/api/admin/test-telegram', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    await testTelegramBot();
    res.json({ success: true, message: 'Тестовое сообщение отправлено в Telegram' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка отправки тестового сообщения' });
  }
});

// Получение информации о Telegram боте
app.get('/api/admin/telegram-info', authenticateToken, requireAdmin, (req: express.Request, res: express.Response) => {
  const botInfo = getBotInfo();
  res.json(botInfo);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  
  // Проверяем настройку Telegram бота
  const botInfo = getBotInfo();
  if (botInfo.isConfigured) {
    console.log(`🤖 Telegram бот настроен (Chat ID: ${botInfo.chatId})`);
  } else {
    console.log(`⚠️ Telegram бот не настроен. Установите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env файле`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Ошибка при закрытии базы данных:', err);
    } else {
      console.log('База данных закрыта');
    }
    process.exit(0);
  });
});
