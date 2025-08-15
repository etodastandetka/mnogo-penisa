import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./data/mnogo_rolly.db', (err) => {
  if (err) {
    console.error('❌ Ошибка открытия базы данных:', err);
  } else {
    console.log('✅ База данных открыта');
  }
});

async function seed() {
  console.log('🌱 Заполнение базы данных тестовыми данными...');

  // Создаем папку data если её нет
  const fs = require('fs');
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  // Создаем таблицы
  console.log('📋 Создание таблиц...');
  
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
    )`, function(err) {
      if (err) {
        console.error('❌ Ошибка создания таблицы users:', err);
      } else {
        console.log('✅ Таблица users создана');
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
    )`, function(err) {
      if (err) {
        console.error('❌ Ошибка создания таблицы products:', err);
      } else {
        console.log('✅ Таблица products создана');
      }
    });

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
    )`, function(err) {
      if (err) {
        console.error('❌ Ошибка создания таблицы orders:', err);
      } else {
        console.log('✅ Таблица orders создана');
      }
    });

    // Таблица элементов заказа
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`, function(err) {
      if (err) {
        console.error('❌ Ошибка создания таблицы order_items:', err);
      } else {
        console.log('✅ Таблица order_items создана');
      }
    });
  });

  // Ждем немного, чтобы таблицы создались
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Хешируем пароль для админа
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Создаем админа
  db.run(`
    INSERT OR IGNORE INTO users (email, password, role) 
    VALUES (?, ?, 'admin')
  `, ['admin@mnogo-rolly.ru', adminPassword], function(err) {
    if (err) {
      console.error('❌ Ошибка создания админа:', err);
    } else {
      console.log('✅ Админ создан');
    }
  });

  // Тестовые продукты
  const products = [
    {
      name: 'Филадельфия ролл',
      description: 'Лосось, сливочный сыр, огурец',
      price: 450,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Калифорния ролл',
      description: 'Краб, авокадо, огурец',
      price: 380,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Дракон ролл',
      description: 'Угорь, огурец, соус унаги',
      price: 520,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Нигири с лососем',
      description: 'Рис, лосось, васаби',
      price: 120,
      category: 'sushi',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Нигири с тунцом',
      description: 'Рис, тунец, васаби',
      price: 130,
      category: 'sushi',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Сет "Семейный"',
      description: 'Филадельфия, Калифорния, Дракон, 6 нигири',
      price: 1200,
      category: 'sets',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Сет "Для двоих"',
      description: 'Филадельфия, Калифорния, 4 нигири',
      price: 800,
      category: 'sets',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Мисо суп',
      description: 'Традиционный японский суп',
      price: 150,
      category: 'soups',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Зеленый чай',
      description: 'Традиционный японский чай',
      price: 80,
      category: 'drinks',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Саке',
      description: 'Японское рисовое вино',
      price: 200,
      category: 'drinks',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    }
  ];

  // Добавляем продукты
  products.forEach((product, index) => {
    db.run(`
      INSERT OR IGNORE INTO products (name, description, price, category, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `, [product.name, product.description, product.price, product.category, product.image_url], function(err) {
      if (err) {
        console.error(`❌ Ошибка создания продукта ${product.name}:`, err);
      } else {
        console.log(`✅ Продукт "${product.name}" создан`);
      }
      
      // Если это последний продукт, создаем тестовые заказы
      if (index === products.length - 1) {
        createTestOrders();
      }
    });
  });
}

// Создание тестовых заказов
function createTestOrders() {
  const orders = [
    {
      user_id: 1,
      total_amount: 850,
      status: 'pending',
      delivery_address: 'ул. Пушкина, д. 10, кв. 5',
      phone: '+7 (999) 123-45-67'
    },
    {
      user_id: 1,
      total_amount: 1200,
      status: 'preparing',
      delivery_address: 'ул. Ленина, д. 25, кв. 12',
      phone: '+7 (999) 234-56-78'
    },
    {
      user_id: 1,
      total_amount: 680,
      status: 'ready',
      delivery_address: 'пр. Мира, д. 15, кв. 8',
      phone: '+7 (999) 345-67-89'
    },
    {
      user_id: 1,
      total_amount: 950,
      status: 'delivering',
      delivery_address: 'ул. Гагарина, д. 7, кв. 3',
      phone: '+7 (999) 456-78-90'
    },
    {
      user_id: 1,
      total_amount: 1500,
      status: 'completed',
      delivery_address: 'ул. Королева, д. 33, кв. 15',
      phone: '+7 (999) 567-89-01'
    }
  ];

  orders.forEach((order, index) => {
    db.run(`
      INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address, phone) 
      VALUES (?, ?, ?, ?, ?)
    `, [order.user_id, order.total_amount, order.status, order.delivery_address, order.phone], function(err) {
      if (err) {
        console.error(`❌ Ошибка создания заказа:`, err);
      } else {
        const orderId = this.lastID;
        console.log(`✅ Заказ #${orderId} создан (${order.status})`);
        
        // Добавляем элементы заказа
        addOrderItems(orderId);
      }
      
      // Если это последний заказ, закрываем соединение
      if (index === orders.length - 1) {
        setTimeout(() => {
          db.close((err) => {
            if (err) {
              console.error('❌ Ошибка при закрытии базы данных:', err);
            } else {
              console.log('✅ База данных заполнена и закрыта');
              console.log('');
              console.log('🔑 Тестовые данные:');
              console.log('   Email: admin@mnogo-rolly.ru');
              console.log('   Пароль: admin123');
            }
          });
        }, 2000);
      }
    });
  });
}

// Добавление элементов заказа
function addOrderItems(orderId: number) {
  const orderItems = [
    { product_id: 1, quantity: 2, price: 450 }, // Филадельфия ролл
    { product_id: 2, quantity: 1, price: 380 }, // Калифорния ролл
    { product_id: 6, quantity: 1, price: 1200 }, // Сет "Семейный"
    { product_id: 8, quantity: 2, price: 150 }, // Мисо суп
    { product_id: 9, quantity: 1, price: 80 }, // Зеленый чай
  ];

  orderItems.forEach((item, index) => {
    db.run(`
      INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price) 
      VALUES (?, ?, ?, ?)
    `, [orderId, item.product_id, item.quantity, item.price], function(err) {
      if (err) {
        console.error(`❌ Ошибка создания элемента заказа:`, err);
      } else {
        console.log(`✅ Элемент заказа #${orderId} создан`);
      }
    });
  });
}

seed().catch(console.error);
