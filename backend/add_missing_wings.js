const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data/mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

console.log('🍗 Добавляем недостающие крылья...');

// Добавляем крылья 12 шт
db.run(`
  INSERT OR IGNORE INTO products (name, description, price, image_url, category, is_popular, is_available, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`, ['Крылья куриные 12 шт', 'Крылья куриные 12 шт', 590, null, 'wings', 1, 1], function(err) {
  if (err) {
    console.error('❌ Ошибка добавления 12 шт:', err.message);
  } else {
    console.log(`✅ Добавлены крылья 12 шт (ID: ${this.lastID})`);
  }
});

// Добавляем крылья 18 шт
db.run(`
  INSERT OR IGNORE INTO products (name, description, price, image_url, category, is_popular, is_available, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`, ['Крылья куриные 18 шт', 'Крылья куриные 18 шт + Coca-Cola 0.3л', 850, null, 'wings', 0, 1], function(err) {
  if (err) {
    console.error('❌ Ошибка добавления 18 шт:', err.message);
  } else {
    console.log(`✅ Добавлены крылья 18 шт (ID: ${this.lastID})`);
  }
  
  // Проверяем результат
  setTimeout(() => {
    db.all('SELECT id, name, price, description FROM products WHERE category = "wings" ORDER BY name', (err, rows) => {
      if (err) {
        console.error('❌ Ошибка проверки:', err.message);
      } else {
        console.log('\n✅ Все крылья:');
        rows.forEach(row => {
          console.log(`ID: ${row.id} | ${row.name} | ${row.price} сом | ${row.description || ''}`);
        });
      }
      
      db.close();
    });
  }, 100);
});
