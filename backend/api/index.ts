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
import { sendNewOrderNotification, sendStatusUpdateNotification, testTelegramBot, getBotInfo } from '../src/telegramBot';

// Типы для базы данных
interface StatsResult {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage(); // Используем память для Vercel

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
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// База данных (для Vercel используем in-memory или внешнюю БД)
let db: sqlite3.Database;

// Инициализация базы данных
const initDatabase = () => {
  // Для Vercel лучше использовать внешнюю БД или in-memory
  // Здесь используем in-memory для демонстрации
  db = new sqlite3.Database(':memory:');
  
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

    // Таблица продуктов
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
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

    // Создание админа по умолчанию
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`, 
      ['admin@mnogo-rolly.ru', adminPassword, 'Администратор', 'admin']);

    // Добавление тестовых продуктов
    const products = [
      ['Филадельфия ролл', 'Классический ролл с лососем и сливочным сыром', 450, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Роллы', 1, 1],
      ['Калифорния ролл', 'Ролл с крабом и авокадо', 380, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Роллы', 1, 1],
      ['Унаги ролл', 'Ролл с угрем и огурцом', 520, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Роллы', 0, 1],
      ['Мини сет', 'Набор из 4 роллов', 1200, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Сеты', 1, 1],
      ['Суп мисо', 'Традиционный японский суп', 180, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Супы', 0, 1],
      ['Сашими лосось', 'Свежий лосось', 320, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', 'Сашими', 0, 1]
    ];

    products.forEach(product => {
      db.run(`INSERT OR IGNORE INTO products (name, description, price, image_url, category, is_popular, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)`, product);
    });
  });
};

// Инициализируем базу данных при запуске
initDatabase();

// Middleware для аутентификации
const authenticateToken = (req: any, res: any, next: any) => {
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

// Middleware для проверки роли админа
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};

// API маршруты
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mnogo Rolly API работает' });
});

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: DatabaseUser) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Продукты
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products WHERE is_available = 1 ORDER BY created_at DESC', (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки продуктов' });
    }
    res.json(products);
  });
});

// Заказы
app.post('/api/orders', authenticateToken, (req, res) => {
  const { customer, items, total, paymentMethod, notes, userId } = req.body;
  const orderNumber = 'MR' + Date.now();

  db.run(
    `INSERT INTO orders (order_number, user_id, customer_name, customer_phone, customer_address, total_amount, payment_method, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderNumber, userId, customer.name, customer.phone, customer.address, total, paymentMethod, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Ошибка создания заказа' });
      }

      const orderId = this.lastID;

      // Добавляем элементы заказа
      items.forEach((item: any) => {
        db.run(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product.id, item.quantity, item.product.price]
        );
      });

      // Отправляем уведомление в Telegram
      sendNewOrderNotification({
        orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        totalAmount: total,
        items: items
      }).catch(console.error);

      res.json({ 
        message: 'Заказ создан успешно', 
        orderNumber,
        orderId 
      });
    }
  );
});

// Получение заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

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
      return res.status(500).json({ message: 'Ошибка загрузки заказов' });
    }
    res.json(orders);
  });
});

// Статус заказа по номеру
app.get('/api/orders/status/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;

  db.get(`
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.order_number = ?
    GROUP BY o.id
  `, [orderNumber], (err, order) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка поиска заказа' });
    }
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json(order);
  });
});

// Загрузка чека об оплате
app.post('/api/orders/payment-proof', upload.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }

  const { orderId, orderNumber } = req.body;
  const fileName = `receipt-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
  
  // В Vercel файлы сохраняются во временную папку
  const filePath = `/tmp/${fileName}`;
  
  fs.writeFileSync(filePath, req.file.buffer);

  db.run(
    'UPDATE orders SET payment_proof = ?, payment_proof_date = CURRENT_TIMESTAMP WHERE id = ? OR order_number = ?',
    [fileName, orderId, orderNumber],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сохранения чека' });
      }
      res.json({ message: 'Чек успешно загружен' });
    }
  );
});

// Админ API
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      COUNT(CASE WHEN status = 'pending' OR status = 'processing' THEN 1 END) as active_orders
    FROM orders
  `, (err, stats: StatsResult) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки статистики' });
    }
    res.json(stats);
  });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  
  let query = `
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
  `;
  
  const params: any[] = [];
  if (status && status !== 'all') {
    query += ' WHERE o.status = ?';
    params.push(status);
  }
  
  query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка загрузки заказов' });
    }
    res.json(orders);
  });
});

app.patch('/api/admin/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Ошибка обновления статуса' });
    }
    res.json({ message: 'Статус обновлен' });
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

app.post('/api/admin/telegram/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await testTelegramBot();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка тестирования бота' });
  }
});

// Экспортируем для Vercel
export default app;
