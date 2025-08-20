const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

console.log('🌐 Добавляем тестовый товар с внешним URL изображения...');

// Добавляем тестовый товар с внешним изображением
const testProduct = {
  name: 'ТЕСТ - Внешнее фото',
  description: 'Тестовый товар с внешним URL изображения (i.ibb.co)',
  price: 299,
  category: 'rolls',
  image_url: 'https://i.ibb.co/S7xTmB8J/2025-08-20-210328878.png',
  is_popular: 1,
  is_available: 1
};

db.run(`
  INSERT INTO products (name, description, price, category, image_url, is_popular, is_available)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`, [
  testProduct.name,
  testProduct.description,
  testProduct.price,
  testProduct.category,
  testProduct.image_url,
  testProduct.is_popular,
  testProduct.is_available
], function(err) {
  if (err) {
    console.error('❌ Ошибка добавления тестового товара:', err);
    return;
  }
  
  console.log(`✅ Тестовый товар добавлен с ID: ${this.lastID}`);
  console.log(`🌐 External Image URL: ${testProduct.image_url}`);
  
  // Проверяем что товар добавился
  db.get(`
    SELECT id, name, image_url FROM products WHERE id = ?
  `, [this.lastID], (err, row) => {
    if (err) {
      console.error('❌ Ошибка проверки:', err);
    } else {
      console.log('🔍 Проверка:', row);
    }
    
    db.close();
  });
});
