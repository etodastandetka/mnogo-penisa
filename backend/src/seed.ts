import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./data/mnogo_rolly.db', (err) => {
  if (err) {
    } else {
    }
});

async function seed() {
  // Создаем папку data если её нет
  const fs = require('fs');
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  // Создаем таблицы
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
        } else {
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
        } else {
        }
    });

    // Таблица заказов
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      customer_address TEXT,
      phone TEXT,
      notes TEXT,
      payment_method TEXT DEFAULT 'cash',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`, function(err) {
      if (err) {
        } else {
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
        } else {
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
      } else {
      }
  });

  // Тестовые продукты
  const products = [
    // Суши и роллы
    {
      name: 'Филадельфия ролл',
      description: 'Лосось, сливочный сыр, огурец',
      price: 450,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Калифорния ролл',
      description: 'Краб, авокадо, огурец',
      price: 380,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Дракон ролл',
      description: 'Угорь, огурец, соус унаги',
      price: 520,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Нигири с лососем',
      description: 'Рис, лосось, васаби',
      price: 120,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Нигири с тунцом',
      description: 'Рис, тунец, васаби',
      price: 130,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Спайси ролл',
      description: 'Лосось, спайси соус, огурец',
      price: 420,
      category: 'sushi_rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    // Сеты
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
    // Крылья
    {
      name: 'Крылья BBQ',
      description: 'Куриные крылья в соусе BBQ, 8 шт',
      price: 350,
      category: 'wings',
      image_url: 'https://images.unsplash.com/photo-1567620832904-9fc6debc209f?w=400&h=300&fit=crop'
    },
    {
      name: 'Крылья Buffalo',
      description: 'Куриные крылья в остром соусе Buffalo, 8 шт',
      price: 380,
      category: 'wings',
      image_url: 'https://images.unsplash.com/photo-1567620832904-9fc6debc209f?w=400&h=300&fit=crop'
    },
    {
      name: 'Крылья Honey Mustard',
      description: 'Куриные крылья в медово-горчичном соусе, 8 шт',
      price: 360,
      category: 'wings',
      image_url: 'https://images.unsplash.com/photo-1567620832904-9fc6debc209f?w=400&h=300&fit=crop'
    },
    // Пицца
    {
      name: 'Пицца Маргарита',
      description: 'Томатный соус, моцарелла, базилик',
      price: 450,
      category: 'pizza',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    {
      name: 'Пицца Пепперони',
      description: 'Томатный соус, моцарелла, пепперони',
      price: 520,
      category: 'pizza',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    {
      name: 'Пицца Четыре сыра',
      description: 'Моцарелла, пармезан, горгонзола, рикотта',
      price: 580,
      category: 'pizza',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    {
      name: 'Пицца Гавайская',
      description: 'Томатный соус, моцарелла, ветчина, ананас',
      price: 490,
      category: 'pizza',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    // Напитки
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
    },
    {
      name: 'Кока-Кола',
      description: 'Газированный напиток',
      price: 120,
      category: 'drinks',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    // Соусы
    {
      name: 'Соус васаби',
      description: 'Острый японский соус',
      price: 50,
      category: 'sauces',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    },
    {
      name: 'Соус имбирь',
      description: 'Маринованный имбирь',
      price: 40,
      category: 'sauces',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
    },
    {
      name: 'Соевый соус',
      description: 'Традиционный соевый соус',
      price: 30,
      category: 'sauces',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
    }
  ];

  // Добавляем продукты
  products.forEach((product, index) => {
    db.run(`
      INSERT OR IGNORE INTO products (name, description, price, category, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `, [product.name, product.description, product.price, product.category, product.image_url], function(err) {
      if (err) {
        } else {
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
      customer_address: 'ул. Пушкина, д. 10, кв. 5',
      phone: '+7 (999) 123-45-67'
    },
    {
      user_id: 1,
      total_amount: 1200,
      status: 'preparing',
      customer_address: 'ул. Ленина, д. 25, кв. 12',
      phone: '+7 (999) 234-56-78'
    },
    {
      user_id: 1,
      total_amount: 680,
      status: 'ready',
      customer_address: 'пр. Мира, д. 15, кв. 8',
      phone: '+7 (999) 345-67-89'
    },
    {
      user_id: 1,
      total_amount: 950,
      status: 'delivering',
      customer_address: 'ул. Гагарина, д. 7, кв. 3',
      phone: '+7 (999) 456-78-90'
    },
    {
      user_id: 1,
      total_amount: 1500,
      status: 'completed',
      customer_address: 'ул. Королева, д. 33, кв. 15',
      phone: '+7 (999) 567-89-01'
    }
  ];

  orders.forEach((order, index) => {
    db.run(`
      INSERT OR IGNORE INTO orders (user_id, total_amount, status, customer_address, phone) 
      VALUES (?, ?, ?, ?, ?)
    `, [order.user_id, order.total_amount, order.status, order.customer_address, order.phone], function(err) {
      if (err) {
        } else {
        const orderId = this.lastID;
        `);
        
        // Добавляем элементы заказа
        addOrderItems(orderId);
      }
      
      // Если это последний заказ, закрываем соединение
      if (index === orders.length - 1) {
        setTimeout(() => {
          db.close((err) => {
            if (err) {
              } else {
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
        console.error('Error inserting order item:', err);
      } else {
        console.log('Order item inserted successfully');
      }
    });
  });
}

seed().catch(console.error);
