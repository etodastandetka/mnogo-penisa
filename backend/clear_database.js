const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Начинаем полную очистку базы данных...');
console.log('⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные!');

// Функция для очистки таблиц
const clearTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ${tableName}`, function(err) {
      if (err) {
        console.error(`❌ Ошибка очистки таблицы ${tableName}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Таблица ${tableName} очищена. Удалено ${this.changes} записей`);
        resolve(this.changes);
      }
    });
  });
};

// Функция для сброса автоинкремента
const resetAutoIncrement = (tableName) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM sqlite_sequence WHERE name = ?`, [tableName], function(err) {
      if (err) {
        console.error(`❌ Ошибка сброса автоинкремента для ${tableName}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Автоинкремент для ${tableName} сброшен`);
        resolve();
      }
    });
  });
};

// Основная функция очистки
const clearDatabase = async () => {
  try {
    console.log('\n📊 Начинаем очистку таблиц...\n');
    
    // Очищаем таблицы в правильном порядке (сначала зависимые)
    await clearTable('order_items');
    await clearTable('orders');
    await clearTable('products');
    await clearTable('users');
    
    console.log('\n🔄 Сбрасываем автоинкременты...\n');
    
    // Сбрасываем автоинкременты
    await resetAutoIncrement('order_items');
    await resetAutoIncrement('orders');
    await resetAutoIncrement('products');
    await resetAutoIncrement('users');
    
    console.log('\n✅ База данных полностью очищена!');
    console.log('📝 Все таблицы пусты и готовы к новым данным');
    
  } catch (error) {
    console.error('\n❌ Произошла ошибка при очистке:', error.message);
  } finally {
    db.close();
    console.log('\n🔒 Соединение с базой данных закрыто');
  }
};

// Запускаем очистку
clearDatabase();
