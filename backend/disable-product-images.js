const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚫 Отключаем отображение фото товаров...');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Вариант 1: Очистить все image_url (убрать фото)
db.run('UPDATE products SET image_url = NULL', (err) => {
  if (err) {
    console.error('❌ Ошибка очистки фото:', err);
    return;
  }
  
  console.log('✅ Все фото товаров очищены');
  
  // Проверяем результат
  db.all('SELECT id, name, image_url FROM products ORDER BY id', (err, products) => {
    if (err) {
      console.error('❌ Ошибка проверки:', err);
      return;
    }
    
    console.log(`\n📊 Результат: ${products.length} товаров`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product.id}) - ${product.image_url ? 'Есть фото' : 'Нет фото'}`);
    });
    
    db.close();
  });
});


