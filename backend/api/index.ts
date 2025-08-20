import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { DatabaseUser, DatabaseOrder, Product, Order, OrderItem } from '../src/types';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import { sendNewOrderNotification, sendStatusUpdateNotification, getBotInfo } from '../src/telegramBot';

// Типы для базы данных
interface StatsResult {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Дополнительные заголовки для мобильных устройств
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Обработка preflight запросов
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Статическая папка для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
    
    // Определяем тип контента по расширению файла
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
      res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.png':
      res.setHeader('Content-Type', 'image/png');
        break;
      case '.gif':
      res.setHeader('Content-Type', 'image/gif');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      default:
        // Для неизвестных типов файлов
        res.setHeader('Content-Type', 'application/octet-stream');
    }
    
    // Добавляем заголовки для правильной обработки изображений
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    console.log('📁 Обслуживаем файл:', filePath, 'Content-Type:', res.getHeader('Content-Type'));
  }
}));



// Статическая папка для изображений
app.use('/images', express.static(path.join(__dirname, '../public/images'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
    
    // Определяем тип контента по расширению файла
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.gif':
        res.setHeader('Content-Type', 'image/gif');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      default:
        res.setHeader('Content-Type', 'application/octet-stream');
    }
    
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    console.log('🖼️ Обслуживаем изображение:', filePath, 'Content-Type:', res.getHeader('Content-Type'));
  }
}));

// База данных (для Vercel используем in-memory или внешнюю БД)
let db: sqlite3.Database;

// Инициализация базы данных
const initDatabase = () => {
  try {
  // Создаем папку data если её нет
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
  }
  
  // Используем файловую базу данных
    console.log('Создание файловой базы данных');
  db = new sqlite3.Database('./data/mnogo_rolly.db');
    console.log('Файловая база данных создана успешно');
  } catch (error) {
    console.error('Критическая ошибка при инициализации базы данных:', error);
    throw error;
  }
  
  // Создание таблиц
  console.log('Начинаем создание таблиц...');
  
  db.serialize(() => {
    try {
    // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Таблица продуктов
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      mobile_image_url TEXT,
      category TEXT,
      is_popular BOOLEAN DEFAULT 0,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Таблица заказов
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      payment_proof TEXT,
      payment_proof_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Добавляем колонку updated_at если её нет (миграция)
    db.run(`ALTER TABLE orders ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('Column updated_at already exists or error:', err.message);
      }
    });

    // Добавляем колонку customer_address если её нет
    db.run(`ALTER TABLE orders ADD COLUMN customer_address TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('Column customer_address already exists or error:', err.message);
      } else {
        console.log('Column customer_address added successfully');
      }
    });

    // Добавляем колонку mobile_image_url если её нет
    db.run(`ALTER TABLE products ADD COLUMN mobile_image_url TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.log('Column mobile_image_url already exists or error:', err.message);
      } else {
        console.log('Column mobile_image_url added successfully');
      }
    });

    // Таблица банковских настроек
    db.run(`CREATE TABLE IF NOT EXISTS bank_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_name TEXT NOT NULL,
      bank_link TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Добавляем начальные настройки если таблица пустая
    db.get('SELECT COUNT(*) as count FROM bank_settings', (err: any, result: any) => {
      if (err) {
        return;
      }
      
      if (result.count === 0) {
        db.run(`INSERT INTO bank_settings (bank_name, bank_link) VALUES (?, ?)`, 
          ['MBank', 'https://app.mbank.kg/qr#00020101021132440012c2c.mbank.kg01020210129965000867861302125204999953034175908YBRAI%20S.630462d0']);
      }
    });

    // Таблица элементов заказа
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Таблица корзины
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Создание админа по умолчанию
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, is_admin) VALUES (?, ?, ?, ?, ?)`, 
      ['admin@mnogo-rolly.ru', adminPassword, 'Администратор', 'admin', 1]);
    
    // Создание дополнительного админа
    const denmakPassword = bcrypt.hashSync('denmak2405', 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, is_admin) VALUES (?, ?, ?, ?, ?)`, 
      ['admin@gmail.com', denmakPassword, 'Denmak', 'admin', 1]);
    
    // Тестовый пользователь удален

    // Тестовые продукты больше не создаются автоматически
    // Используйте админ-панель для добавления товаров
    } catch (error) {
      console.error('Ошибка при создании таблиц:', error);
      throw error;
    }
  });
};

// Инициализируем базу данных при запуске
try {
initDatabase();
  console.log('База данных инициализирована успешно');
} catch (error) {
  console.error('Ошибка инициализации базы данных:', error);
}

// Middleware для аутентификации
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
  if (err) {
    return res.status(403).json({ message: 'Недействительный токен' });
  }
  
  // Получаем актуальную информацию о пользователе из базы данных
  db.get('SELECT id, name, email, phone, address, is_admin FROM users WHERE id = ?', [user.id], (dbErr, dbUser: any) => {
    if (dbErr || !dbUser) {
      return res.status(403).json({ message: 'Пользователь не найден' });
    }
    
    // Обновляем информацию о пользователе
    req.user = {
      ...user,
      is_admin: dbUser.is_admin === 1
    };
    next();
  });
});
};

// Middleware для проверки роли админа
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};

// API маршруты
app.get('/api/health', (req, res) => {
  try {
    // Проверяем состояние базы данных
    if (!db) {
      return res.status(500).json({ 
        status: 'ERROR', 
        message: 'База данных не инициализирована',
        error: 'Database not initialized'
      });
    }
    
    // Проверяем подключение к базе данных
    db.get('SELECT 1 as check', (err, result) => {
      if (err) {
        console.error('Ошибка проверки базы данных:', err);
        return res.status(500).json({ 
          status: 'ERROR', 
          message: 'Ошибка подключения к базе данных',
          error: err.message
        });
      }
      
      res.json({ 
        status: 'OK', 
        message: 'Mnogo Rolly API работает',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Ошибка в health check:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Внутренняя ошибка сервера',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Получение информации о текущем пользователе
app.get('/api/user/me', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  db.get('SELECT id, name, email, phone, address, is_admin FROM users WHERE id = ?', [userId], (err, user: any) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка получения данных пользователя' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.is_admin === 1
    });
  });
});



// Продукты
app.get('/api/products', (req, res) => {

  console.log('📱 Origin:', req.headers.origin);
  console.log('📱 Referer:', req.headers.referer);
  
  db.all('SELECT * FROM products WHERE is_available = 1 ORDER BY created_at DESC', (err, products) => {
    if (err) {
      console.error('❌ Ошибка загрузки продуктов из БД:', err);
      return res.status(500).json({ message: 'Ошибка загрузки продуктов' });
    }
    

    
    // Обрабатываем изображения для каждого товара (упрощенная логика как в russkii-portal)
    const productsWithImages = products.map((product: any) => {
      
      let processedImageUrl = product.image_url;
      
      // Если есть относительный путь к изображению, делаем его полным
      if (product.image_url && product.image_url.startsWith('/uploads/')) {
        processedImageUrl = `https://147.45.141.113:3444${product.image_url}`;
      }
      
      // Если это внешний URL (Unsplash или другие), оставляем как есть
      if (product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))) {
        processedImageUrl = product.image_url;
      }
      
              // Если это base64 изображение, оставляем как есть
        if (product.image_url && product.image_url.startsWith('data:image/')) {
          processedImageUrl = product.image_url;
        }
      
      // Если нет изображения или это Unsplash, оставляем null
      if (!product.image_url || product.image_url === '' || product.image_url.includes('unsplash')) {
        processedImageUrl = null;
      }
      
        return {
          ...product,
        image_url: processedImageUrl,
        original_image_url: product.image_url // сохраняем оригинальный URL для отладки
      };
    });
    

    
    // Добавляем отладочную информацию в заголовки
    res.setHeader('X-Products-Count', productsWithImages.length);
    res.setHeader('X-Products-With-Images', productsWithImages.filter(p => p.original_image_url && p.original_image_url !== '').length);
    
    res.json(productsWithImages);
  });
});

// Заказы
app.post('/api/orders', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { customer, items, total, paymentMethod, notes } = req.body;

    if (!customer || !items || !total || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Не все обязательные поля заполнены'
      });
    }

    const orderNumber = 'MR-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    // Объединяем комментарии: customer.notes + общие notes
    const combinedNotes = [customer.notes, notes].filter(note => note && note.trim()).join(' | ');

    const sql = `
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_phone,
        customer_address, total_amount, status, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      orderNumber, userId, customer.name, customer.phone,
      customer.address || '', total, 'pending', paymentMethod, combinedNotes || ''
    ];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Ошибка создания заказа',
          error: err.message
        });
      }

      const orderId = this.lastID;
      let itemsAdded = 0;
      let totalItems = items.length;

      items.forEach((item: any, index: number) => {
        db.run(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.product.id, item.quantity, item.product.price], (err) => {
          if (err) {
            } else {
            itemsAdded++;
          }

          if (itemsAdded === totalItems) {
            // Отправляем уведомление в Telegram
            sendNewOrderNotification({
              id: orderId,
              orderNumber,
              customerName: customer.name,
              customerPhone: customer.phone,
              deliveryAddress: customer.address,
              totalAmount: total,
              status: 'pending',
              createdAt: new Date().toISOString(),
              items: items
            } as any).catch(console.error);

            res.json({
              success: true,
              message: 'Заказ успешно создан',
              data: {
                orderId,
                orderNumber
              }
            });
          }
        });
      });

      if (totalItems === 0) {
        res.json({
          success: true,
          message: 'Заказ успешно создан',
          data: {
            orderId,
            orderNumber
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение заказов пользователя (удален дублирующий эндпоинт)

// Гостевые заказы (без авторизации)
app.post('/api/orders/guest', (req: any, res) => {
  try {
    const { customer, items, total, paymentMethod, notes } = req.body;

    if (!customer || !items || !total || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Не все обязательные поля заполнены'
      });
    }

    const orderNumber = 'MR-GUEST-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    // Объединяем комментарии: customer.notes + общие notes
    const combinedNotes = [customer.notes, notes].filter(note => note && note.trim()).join(' | ');

    const sql = `
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_phone,
        customer_address, total_amount, status, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      orderNumber, null, customer.name, customer.phone,
      customer.address || '', total, 'pending', paymentMethod, combinedNotes || ''
    ];

    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Ошибка создания заказа',
          error: err.message
        });
      }

      const orderId = this.lastID;
      let itemsAdded = 0;
      let totalItems = items.length;

      items.forEach((item: any, index: number) => {
        db.run(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, item.product.id, item.quantity, item.product.price], (err) => {
          if (err) {
            console.error('Ошибка добавления товара в заказ:', err);
          } else {
            itemsAdded++;
          }

          if (itemsAdded === totalItems) {
            // Отправляем уведомление в Telegram
            sendNewOrderNotification({
              id: orderId,
              orderNumber,
              customerName: customer.name,
              customerPhone: customer.phone,
              deliveryAddress: customer.address,
              totalAmount: total,
              status: 'pending',
              createdAt: new Date().toISOString(),
              items: items
            } as any).catch(console.error);

            res.json({
              success: true,
              message: 'Заказ успешно создан',
              data: {
                orderId,
                orderNumber
              }
            });
          }
        });
      });

      if (totalItems === 0) {
        res.json({
          success: true,
          message: 'Заказ успешно создан',
          data: {
            orderId,
            orderNumber
          }
        });
      }
    });
  } catch (error) {
    console.error('Ошибка создания гостевого заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Получение гостевого заказа по номеру
app.get('/api/orders/guest/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;

  db.get(`
    SELECT o.*
    FROM orders o
    WHERE o.order_number = ? AND o.user_id IS NULL
  `, [orderNumber], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка поиска заказа', error: err.message });
    }
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    // Загружаем детали товаров для заказа
    console.log('Loading items for guest order:', (order as any).id);
    
    db.all('SELECT * FROM order_items WHERE order_id = ?', [(order as any).id], (err, items) => {
      if (err) {
        console.error('Error loading items for guest order:', (order as any).id, err);
        return res.json({
          ...(order as any),
          items: [],
          items_summary: 'Товары не найдены'
        });
      }
      
      console.log('Items for guest order:', (order as any).id, items);
      const orderWithItems = {
        ...(order as any),
        items: items || [],
        items_summary: items && items.length > 0 ? 
          items.map((item: any) => item.product_name + ' x' + item.quantity).join(', ') : 
          'Товары не найдены'
      };
      
      res.json(orderWithItems);
    });
  });
});

// Статус заказа по номеру
app.get('/api/orders/status/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;

  db.get(`
    SELECT o.*
    FROM orders o
    WHERE o.order_number = ?
  `, [orderNumber], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка поиска заказа', error: err.message });
    }
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    // Загружаем детали товаров для заказа
    console.log('Loading items for order:', (order as any).id);
    
    db.all('SELECT * FROM order_items WHERE order_id = ?', [(order as any).id], (err, items) => {
      if (err) {
        console.error('Error loading items for order:', (order as any).id, err);
        return res.json({
          ...(order as any),
          items: [],
          items_summary: 'Товары не найдены'
        });
      }
      
      console.log('Items for order:', (order as any).id, items);
      const orderWithItems = {
        ...(order as any),
        items: items || [],
        items_summary: items && items.length > 0 ? 
          items.map((item: any) => item.product_name + ' x' + item.quantity).join(', ') : 
          'Товары не найдены'
      };
      
      res.json(orderWithItems);
    });
  });
});

// Получение фото чека
app.get('/api/orders/payment-proof/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Файл не найден' });
  }
});

// Загрузка фото товара (как в russkii-portal)
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('🔥 UPLOAD: Получен запрос на загрузку изображения');
  console.log('🔥 UPLOAD: File:', req.file ? req.file.filename : 'не загружен');
  
  if (!req.file) {
    console.log("❌ UPLOAD: Изображение не загружено");
    return res.status(400).json({ message: "Изображение не загружено" });
  }
  
  try {
    // Создаем URL к загруженному файлу (как в russkii-portal)
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`✅ UPLOAD: Файл загружен: ${imageUrl}`);
    
    res.json({ 
      message: "Файл успешно загружен", 
      imageUrl: imageUrl,
      file: req.file
    });
  } catch (error) {
    console.error("❌ UPLOAD: Ошибка при загрузке файла:", error);
    res.status(500).json({ message: "Ошибка при загрузке файла" });
  }
});

// Загрузка нескольких изображений (как в russkii-portal)
app.post('/api/upload-images', upload.array('images', 10), (req, res) => {
  try {
    console.log("🔥 UPLOAD-IMAGES: Получен запрос на загрузку изображений");
    console.log("🔥 UPLOAD-IMAGES: Files count:", req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      console.log("❌ UPLOAD-IMAGES: Изображения не загружены");
      return res.status(400).json({ message: "Изображения не загружены" });
    }
    
    // Создаем URL к загруженным файлам
    const imageUrls: string[] = [];
    const files = req.files as Express.Multer.File[];
    
    files.forEach(file => {
      const imageUrl = `/uploads/${file.filename}`;
      imageUrls.push(imageUrl);
      console.log(`✅ UPLOAD-IMAGES: Файл загружен: ${imageUrl}`);
    });
    
    res.json({ 
      message: "Файлы успешно загружены", 
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error("❌ UPLOAD-IMAGES: Ошибка при загрузке файлов:", error);
    res.status(500).json({ message: "Ошибка при загрузке файлов" });
  }
});

// Загрузка чека об оплате
app.post('/api/orders/payment-proof', upload.single('file'), (req, res) => {
  console.log('Загрузка фото чека:', { 
    file: req.file ? req.file.originalname : 'нет файла',
    body: req.body 
  });
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Файл не загружен' });
  }

  const { orderId, orderNumber } = req.body;
  const fileName = 'receipt-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
  
  try {
    // Создаем папку uploads если её нет
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Сохраняем файл
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Создаем URL для файла
    const fileUrl = 'https://147.45.141.113:3444/uploads/' + fileName;
    
    console.log('Обновляем заказ в базе:', { orderId, orderNumber, fileUrl });
    
    // Обновляем заказ с URL чека
    console.log('Ищем заказ по ID:', { orderId, orderNumber });
    
    // Ищем заказ по ID или по номеру заказа
    let searchQuery = '';
    let searchParams: any[] = [];
    
    if (orderId && orderId !== 'temp') {
      searchQuery = 'SELECT id, order_number FROM orders WHERE id = ?';
      searchParams = [orderId];
    } else if (orderNumber) {
      searchQuery = 'SELECT id, order_number FROM orders WHERE order_number = ?';
      searchParams = [orderNumber];
    } else {
      console.log('Нет orderId или orderNumber для поиска заказа');
      return res.status(400).json({ success: false, error: 'Не указан ID или номер заказа' });
    }
    
    db.get(searchQuery, searchParams, (err, order) => {
      if (err) {
        console.error('Ошибка поиска заказа:', err);
        return res.status(500).json({ success: false, error: 'Ошибка поиска заказа' });
      }
      
      if (!order) {
        console.error('Заказ не найден:', { orderId, orderNumber });
        return res.status(404).json({ success: false, error: 'Заказ не найден' });
      }
      
      console.log('Найден заказ для обновления:', order);
      
      // Теперь обновляем заказ
    db.run(
        'UPDATE orders SET payment_proof = ?, payment_proof_date = CURRENT_TIMESTAMP WHERE id = ?',
        [fileUrl, (order as any).id],
      function(err) {
        if (err) {
            console.error('Ошибка обновления базы:', err);
          return res.status(500).json({ success: false, error: 'Ошибка сохранения чека в базе данных' });
        }
          
          console.log('Заказ обновлен успешно:', { changes: this.changes, fileUrl, orderId: (order as any).id });
        
        res.json({ 
          success: true, 
          message: 'Чек успешно загружен',
          fileUrl: fileUrl
        });
      }
    );
    });
  } catch (error) {
    console.error('Ошибка сохранения файла:', error);
    res.status(500).json({ success: false, error: 'Ошибка сохранения файла' });
  }
});

// Обновление чека по номеру заказа (для админов)
app.post('/api/admin/orders/:orderNumber/payment-proof', upload.single('file'), authenticateToken, requireAdmin, (req, res) => {
  const { orderNumber } = req.params;
  
  console.log('Админ обновляет чек для заказа:', { orderNumber, file: req.file?.originalname });
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Файл не загружен' });
  }

  const fileName = 'receipt-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
  
  try {
    // Создаем папку uploads если её нет
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Сохраняем файл
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Создаем URL для файла
    const fileUrl = 'https://147.45.141.113:3444/uploads/' + fileName;
    
    // Ищем заказ по номеру
    db.get('SELECT id, order_number FROM orders WHERE order_number = ?', [orderNumber], (err, order) => {
      if (err) {
        console.error('Ошибка поиска заказа:', err);
        return res.status(500).json({ success: false, error: 'Ошибка поиска заказа' });
      }
      
      if (!order) {
        console.error('Заказ не найден по номеру:', orderNumber);
        return res.status(404).json({ success: false, error: 'Заказ не найден' });
      }
      
      console.log('Найден заказ для обновления:', order);
      
      // Обновляем заказ
      db.run(
        'UPDATE orders SET payment_proof = ?, payment_proof_date = CURRENT_TIMESTAMP WHERE id = ?',
        [fileUrl, (order as any).id],
        function(err) {
          if (err) {
            console.error('Ошибка обновления базы:', err);
            return res.status(500).json({ success: false, error: 'Ошибка сохранения чека в базе данных' });
          }
          
          console.log('Заказ обновлен успешно:', { changes: this.changes, fileUrl, orderId: (order as any).id });
          
          res.json({ 
            success: true, 
            message: 'Чек успешно обновлен',
            fileUrl: fileUrl
          });
        }
      );
    });
  } catch (error) {
    console.error('Ошибка сохранения файла:', error);
    res.status(500).json({ success: false, error: 'Ошибка сохранения файла' });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  
  // Упрощенный запрос без GROUP_CONCAT для лучшей совместимости
  let query = 'SELECT * FROM orders';
  const params: any[] = [];
  
  if (status && status !== 'all') {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  console.log('Executing orders query:', query, params);

  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Database error in /api/admin/orders:', err);
      return res.status(500).json({ 
        message: 'Ошибка загрузки заказов', 
        error: err.message 
      });
    }
    
    console.log('Found orders:', orders.length);
    console.log('Orders details:', orders.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      payment_proof: o.payment_proof,
      payment_proof_date: o.payment_proof_date,
      status: o.status
    })));
    
    // Проверяем заказы с чеками
    const ordersWithProof = orders.filter((o: any) => o.payment_proof && o.payment_proof.trim() !== '');
    console.log('Заказы с чеками:', ordersWithProof.length);
    if (ordersWithProof.length > 0) {
      console.log('Детали заказов с чеками:', ordersWithProof.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        payment_proof: o.payment_proof
      })));
    }
    
    if (!orders || orders.length === 0) {
      return res.json([]);
    }
    
    // Используем Promise.all для более надежной обработки
    const ordersWithItemsPromises = orders.map((order: any) => {
      return new Promise((resolve) => {
        db.all(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id], (err, items) => {
          let items_summary = 'Товары не найдены';
          
          if (!err && items && items.length > 0) {
            items_summary = items.map((item: any) => 
              (item.product_name || 'Неизвестный товар') + ' x' + item.quantity
            ).join(', ');
          }
          
                  console.log('Заказ с items:', { 
                    id: order.id, 
                    order_number: order.order_number,
                    payment_proof: order.payment_proof,
                    payment_proof_date: order.payment_proof_date,
                    items_count: items ? items.length : 0 
                  });
                  
                  // Отладка payment_proof
                  if (order.payment_proof) {
                    console.log('✅ Заказ с чеком об оплате:', {
                      id: order.id,
                      order_number: order.order_number,
                      payment_proof_length: order.payment_proof.length,
                      payment_proof_start: order.payment_proof.substring(0, 50)
                    });
                  }
        
            resolve({
              id: order.id,
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerPhone: order.customer_phone,
              deliveryAddress: order.customer_address,
              totalAmount: order.total_amount,
              status: order.status,
              paymentMethod: order.payment_method,
              paymentStatus: order.payment_proof ? 'paid' : 'pending',
              createdAt: order.created_at,
              paymentProof: order.payment_proof,
              paymentProofDate: order.payment_proof_date,
              items: items ? items.map((item: any) => ({
                id: item.id,
                productName: item.product_name || 'Неизвестный товар',
                quantity: item.quantity,
                price: item.price,
                totalPrice: item.price * item.quantity
              })) : [],
              items_summary: items_summary
            });
        });
      });
    });
    
    Promise.all(ordersWithItemsPromises)
      .then((ordersWithItems) => {
        console.log('Sending response with', ordersWithItems.length, 'orders');
    res.json(ordersWithItems);
      })
      .catch((error) => {
        console.error('Error processing orders:', error);
        res.status(500).json({ message: 'Ошибка обработки заказов' });
      });
  });
});

app.patch('/api/admin/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log('Updating order status:', { id, status });

  if (!status) {
    return res.status(400).json({ message: 'Статус не указан' });
  }

  const validStatuses = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Недопустимый статус' });
  }

  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) {
      console.error('Database error updating order status:', err);
      return res.status(500).json({ message: 'Ошибка обновления статуса', error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    
    console.log('Order status updated successfully:', { id, status, changes: this.changes });
    res.json({ message: 'Статус обновлен', status });
  });
});

// Telegram Bot API
app.get('/api/admin/telegram/config', authenticateToken, requireAdmin, (req, res) => {
  const config = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    isConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  };
  res.json(config);
});



// API для управления товарами
app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки товаров' });
    }
    
    // Обрабатываем изображения для товаров
    const productsWithPlaceholders = products.map((product: any) => {
      let processedImageUrl = product.image_url;
      
      // Если есть относительный путь к изображению, делаем его полным
      if (product.image_url && product.image_url.startsWith('/uploads/')) {
        processedImageUrl = `https://147.45.141.113:3444${product.image_url}`;
      }
      
      // Если это внешний URL, оставляем как есть
      if (product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))) {
        processedImageUrl = product.image_url;
      }
      
      // Если нет изображения, это Unsplash или старые placeholder, оставляем null
      if (!product.image_url || product.image_url === '' || product.image_url.includes('/images/products/') || product.image_url.includes('unsplash')) {
        processedImageUrl = null;
      }
      
      return {
        ...product,
        image_url: processedImageUrl,
        original_image_url: product.image_url
      };
    });
    
    res.json(productsWithPlaceholders);
  });
});



// API для удаления всех товаров (только для админов)
app.delete('/api/admin/clear-all-products', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM products', (err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка удаления товаров' });
    }
    
    res.json({ message: 'Все товары успешно удалены' });
  });
});

// Создание нового товара
app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, category, isPopular, isAvailable, is_available, image_url, mobile_image_url } = req.body;
  
  
  
  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  // Используем переданное изображение (base64 или URL)
  const imageUrl = image_url || '';
  
  // Определяем статус доступности
  const isAvailableValue = isAvailable !== undefined ? isAvailable : is_available !== undefined ? is_available : true;
  const isPopularValue = isPopular !== undefined ? isPopular : false;

  db.run(`
    INSERT INTO products (name, description, price, image_url, mobile_image_url, category, is_popular, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, description, price, imageUrl, mobile_image_url || '', category, isPopularValue ? 1 : 0, isAvailableValue ? 1 : 0], function(err) {
    if (err) {
      console.error('Ошибка создания товара:', err);
      return res.status(500).json({ message: 'Ошибка создания товара' });
    }
    

    
    res.json({
      message: 'Товар создан успешно',
      productId: this.lastID,
      imageUrl
    });
  });
});

// Обновление товара
app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, isPopular, isAvailable, is_available, image_url, mobile_image_url } = req.body;
  
  console.log('🔄 UPDATE PRODUCT:', { id, name, mobile_image_url, image_url });
  

  
  if (!name || !price) {
    return res.status(400).json({ message: 'Название и цена обязательны' });
  }

  // Используем переданное изображение (base64 или URL)
  const imageUrl = image_url || '';
  
  // Определяем статус доступности
  const isAvailableValue = isAvailable !== undefined ? isAvailable : is_available !== undefined ? is_available : true;
  const isPopularValue = isPopular !== undefined ? isPopular : false;



  // Обновляем товар
    db.run(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, image_url = ?, mobile_image_url = ?, category = ?, is_popular = ?, is_available = ?
      WHERE id = ?
  `, [name, description, price, imageUrl, mobile_image_url || '', category, isPopularValue ? 1 : 0, isAvailableValue ? 1 : 0, id], function(err) {
      if (err) {
      console.error('Ошибка обновления товара:', err);
        return res.status(500).json({ message: 'Ошибка обновления товара' });
      }
    

      
      res.json({
        message: 'Товар обновлен успешно',
        imageUrl
      });
    });
});

// Удаление товара
app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка удаления товара' });
    }
    
    res.json({ message: 'Товар удален успешно' });
  });
});

// Загрузка изображения товара
app.post('/api/admin/upload-image', upload.single('image'), authenticateToken, requireAdmin, (req, res) => {
  try {
    console.log('🖼️ ADMIN UPLOAD: Получен запрос на загрузку изображения товара');
    console.log('🖼️ ADMIN UPLOAD: File:', req.file ? req.file.filename : 'Нет файла');
    
    if (!req.file) {
      console.log('❌ ADMIN UPLOAD: Изображение не загружено');
      return res.status(400).json({ 
        success: false,
        message: "Изображение не загружено" 
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`✅ ADMIN UPLOAD: Изображение загружено: ${imageUrl}`);
    
    res.json({ 
      success: true,
      message: "Изображение успешно загружено", 
      imageUrl: imageUrl,
      url: imageUrl,  // альтернативное поле
      path: imageUrl, // еще один вариант
      filename: req.file.filename
    });
  } catch (error) {
    console.error("❌ ADMIN UPLOAD: Ошибка при загрузке изображения:", error);
    res.status(500).json({ 
      success: false,
      message: "Ошибка при загрузке изображения" 
    });
  }
});

// API для управления корзиной
// Получение корзины пользователя
app.get('/api/cart', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  // Получаем товары в корзине пользователя
  db.all(`
    SELECT c.*, p.name, p.price, p.image_url, p.description
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки корзины' });
    }
    res.json(cartItems);
  });
});

// Добавление товара в корзину
app.post('/api/cart/add', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({ message: 'ID товара обязателен' });
  }
  
  // Проверяем, есть ли уже товар в корзине
  db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка проверки корзины' });
    }
    
          if (existingItem) {
        // Обновляем количество
        const newQuantity = (existingItem as any).quantity + quantity;
        db.run('UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, (existingItem as any).id], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Ошибка обновления корзины' });
        }
        res.json({ message: 'Количество товара обновлено', quantity: newQuantity });
      });
    } else {
      // Добавляем новый товар
      db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Ошибка добавления в корзину' });
        }
        res.json({ message: 'Товар добавлен в корзину', cartItemId: this.lastID });
      });
    }
  });
});

// Обновление количества товара в корзине
app.put('/api/cart/:id', authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;
  
  if (quantity <= 0) {
    return res.status(400).json({ message: 'Количество должно быть больше 0' });
  }
  
  db.run('UPDATE cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [quantity, id, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка обновления корзины' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Товар в корзине не найден' });
    }
    
    res.json({ message: 'Количество обновлено', quantity });
  });
});

// Удаление товара из корзины
app.delete('/api/cart/:id', authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка удаления из корзины' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Товар в корзине не найден' });
    }
    
    res.json({ message: 'Товар удален из корзины' });
  });
});

// Очистка корзины пользователя
app.delete('/api/cart', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  db.run('DELETE FROM cart WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка очистки корзины' });
    }
    
    res.json({ message: 'Корзина очищена' });
  });
});

// API для управления пользователями (только для админов)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req: any, res) => {
  db.all('SELECT id, name, email, phone, address, is_admin, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки пользователей' });
    }
    
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.is_admin === 1,
      createdAt: user.created_at
    }));
    
    res.json(formattedUsers);
  });
});

// Обновление прав админа для пользователя
app.put('/api/admin/users/:id/admin', authenticateToken, requireAdmin, (req: any, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  
  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ message: 'Поле isAdmin должно быть boolean' });
  }
  
  db.run('UPDATE users SET is_admin = ? WHERE id = ?', [isAdmin ? 1 : 0, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка обновления прав пользователя' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ 
      message: isAdmin ? 'Admin rights granted successfully' : 'Admin rights revoked successfully',
      isAdmin 
    });
  });
});

// API для регистрации пользователей
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Проверяем обязательные поля
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все обязательные поля должны быть заполнены' 
      });
    }

    // Проверяем, существует ли пользователь с таким email
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Ошибка проверки пользователя' 
        });
      }

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Пользователь с таким email уже существует' 
        });
      }

      // Хешируем пароль
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Создаем нового пользователя
      db.run(
        'INSERT INTO users (name, email, phone, password, address, role, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, hashedPassword, address || '', 'user', 0],
        function(err) {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Ошибка создания пользователя' 
            });
          }

          // Получаем созданного пользователя
          db.get('SELECT id, name, email, phone, address, is_admin FROM users WHERE id = ?', [this.lastID], (err, user: any) => {
            if (err || !user) {
              return res.status(500).json({ 
                success: false, 
                message: 'Ошибка получения данных пользователя' 
              });
            }

            // Создаем JWT токен
            const token = jwt.sign(
              { id: user.id, email: user.email },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            res.json({
              success: true,
              message: 'Пользователь успешно зарегистрирован',
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  address: user.address,
                  isAdmin: user.is_admin === 1
                },
                token
              }
            });
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// API для входа пользователей
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email и пароль обязательны' 
      });
    }

    // Ищем пользователя по email
    db.get('SELECT id, name, email, phone, address, password, is_admin FROM users WHERE email = ?', [email], (err, user: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Ошибка поиска пользователя' 
        });
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Неверный email или пароль' 
        });
      }

      // Проверяем пароль
      const isValidPassword = bcrypt.compareSync(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Неверный email или пароль' 
        });
      }

      // Создаем JWT токен
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const responseData = {
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isAdmin: user.is_admin === 1
          },
          token
        }
      };
      
      res.json(responseData);
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// API для обновления профиля пользователя
app.put('/api/users/profile', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    // Проверяем обязательные поля
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Имя и телефон обязательны' 
      });
    }

    // Обновляем профиль пользователя
    db.run(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone, address || '', userId],
      function(err) {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Ошибка обновления профиля' 
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Пользователь не найден' 
          });
        }

        res.json({
          success: true,
          message: 'Профиль успешно обновлен'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// API для получения заказов пользователя
app.get('/api/orders/user', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    // Сначала получаем заказы пользователя
    db.all(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.total_amount,
        o.status,
        o.payment_method,
        o.created_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId], (err, orders) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Ошибка получения заказов',
          error: err.message
        });
      }

      // Если заказов нет, возвращаем пустой массив
      if (!orders || orders.length === 0) {
        return res.json([]);
      }

      // Для каждого заказа получаем элементы
      const ordersWithItems = orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: order.customer_address,
        totalAmount: order.total_amount,
        status: order.status,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        items: [] // Пока оставляем пустым, можно добавить позже
      }));

      res.json(ordersWithItems);
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});



// Банковские настройки
app.get('/api/bank-settings', (req, res) => {
  db.get('SELECT * FROM bank_settings ORDER BY id DESC LIMIT 1', (err, settings: any) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ошибка сервера' 
      });
    }
    
    if (!settings) {
      return res.json({
        bank_name: 'MBank',
        bank_link: 'https://app.mbank.kg/qr#00020101021132500012c2c.mbank.kg01020210129965000867861202111302115204999953034175405100005908YBRAI%20S.63048fa2',
        mbank_hash: '00020101021132500012c2c.mbank.kg01020210129965000867861202111302115204999953034175405100005908YBRAI%20S.63048fa2'
      });
    }
    
    // Извлекаем hash из ссылки (все что после #)
    const mbank_hash = settings.bank_link.split('#')[1] || '';
    
    res.json({
      bank_name: settings.bank_name,
      bank_link: settings.bank_link,
      mbank_hash: mbank_hash
    });
  });
});

app.post('/api/bank-settings', (req, res) => {
  const { bank_name, bank_link } = req.body;
  
  if (!bank_name || !bank_link) {
    return res.status(400).json({
      success: false,
      message: 'Название банка и ссылка обязательны'
    });
  }
  
  db.run(`
    INSERT INTO bank_settings (bank_name, bank_link, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `, [bank_name, bank_link], function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Ошибка сохранения'
      });
    }
    
    res.json({
      success: true,
      message: 'Настройки сохранены',
      id: this.lastID
    });
  });
});



// Экспортируем для Vercel
export default app;

// Функция для создания HTTPS сервера
const createHttpsServer = () => {
  try {
    const certPath = path.join(__dirname, '../certs/certificate.pem');
    const keyPath = path.join(__dirname, '../certs/private-key.pem');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
      
      return https.createServer(options, app);
    } else {
      console.log('⚠️  SSL сертификаты не найдены. Запускаем HTTP сервер.');
      return null;
    }
  } catch (error) {
    console.log('⚠️  Ошибка загрузки SSL сертификатов:', (error as Error).message);
    console.log('🔄 Запускаем HTTP сервер.');
    return null;
  }
};

// Запускаем сервер если файл запущен напрямую
if (require.main === module) {
  const HTTPS_PORT = 3444; // Принудительно устанавливаем порт 3444
  
  // Запускаем только HTTPS сервер
  const httpsServer = createHttpsServer();
  
  if (httpsServer) {
    httpsServer.listen(Number(HTTPS_PORT), '0.0.0.0', () => {
      console.log('🔒 HTTPS Server started on port:', HTTPS_PORT);
      console.log('🌐 URL: https://147.45.141.113:' + HTTPS_PORT);
    });
  } else {
    console.log('❌ Не удалось запустить HTTPS сервер');
  }
}



// Endpoint для проверки изображений
app.get('/api/check-image/:filename(*)', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  console.log('🔍 Проверка изображения:', filename);
  console.log('📁 Полный путь:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл не найден');
    return res.status(404).json({ 
      error: 'Файл не найден',
      filename,
      fullPath: filePath
    });
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  console.log('📊 Информация о файле:', {
    size: stats.size,
    extension: ext,
    created: stats.birthtime,
    modified: stats.mtime
  });
  
  // Определяем MIME тип
  let mimeType = 'application/octet-stream';
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      mimeType = 'image/jpeg';
      break;
    case '.png':
      mimeType = 'image/png';
      break;
    case '.gif':
      mimeType = 'image/gif';
      break;
    case '.webp':
      mimeType = 'image/webp';
      break;
    case '.svg':
      mimeType = 'image/svg+xml';
      break;
  }
  
  res.json({
    exists: true,
    filename,
    fullPath: filePath,
    size: stats.size,
    mimeType,
    extension: ext,
    created: stats.birthtime,
    modified: stats.mtime,
                     url: `https://147.45.141.113:3444/uploads/${filename}`
  });
});

// Endpoint для загрузки base64 изображений (работает везде)
app.post('/api/upload-base64', (req, res) => {
  try {
    const { image, filename } = req.body;
    
    if (!image || !filename) {
      return res.status(400).json({ success: false, message: 'Отсутствует изображение или имя файла' });
    }
    
    // Сохраняем base64 в базу данных как есть
    const imageUrl = image; // base64 строка
    
                 console.log('✅ Изображение сохранено:', filename);
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Изображение успешно загружено'
    });
  } catch (error) {
    console.error('❌ Ошибка загрузки base64:', error);
    res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
  }
});

// Альтернативный endpoint для загрузки на CDN (если локальные файлы не работают)
app.post('/api/upload-cdn', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Файл не загружен' });
  }

  try {
    // Здесь можно интегрировать с внешним CDN (Cloudinary, AWS S3, etc.)
    // Пока возвращаем локальный путь, но с улучшенной обработкой
    const fileName = 'product-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
    
    // Сохраняем файл локально
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Возвращаем URL с кэш-бастингом
    const imageUrl = `/uploads/${fileName}?v=${Date.now()}`;
    
    console.log('✅ Файл загружен на CDN:', imageUrl);
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Изображение успешно загружено'
    });
  } catch (error) {
    console.error('❌ Ошибка загрузки на CDN:', error);
    res.status(500).json({ success: false, message: 'Ошибка загрузки файла' });
  }
});
