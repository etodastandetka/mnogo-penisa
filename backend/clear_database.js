const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🗑️  Очистка базы данных...');

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'mnogo_rolly.db');

// Проверяем существование базы данных
if (!fs.existsSync(dbPath)) {
  console.log('❌ База данных не найдена:', dbPath);
  process.exit(1);
}

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

// Функция для выполнения SQL запросов
const runQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.run(query, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Функция для получения данных
const getQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

async function clearDatabase() {
  try {
    console.log('📊 Получаем статистику перед очисткой...');
    
    // Получаем количество записей в каждой таблице
    const tables = ['products', 'orders', 'order_items', 'users', 'bank_settings'];
    
    for (const table of tables) {
      try {
        const count = await getQuery(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📋 ${table}: ${count[0]?.count || 0} записей`);
      } catch (error) {
        console.log(`📋 ${table}: таблица не существует или пуста`);
      }
    }
    
    console.log('\n🧹 Начинаем очистку...');
    
    // Очищаем таблицы в правильном порядке (из-за внешних ключей)
    const clearQueries = [
      'DELETE FROM order_items',
      'DELETE FROM orders', 
      'DELETE FROM products',
      'DELETE FROM users WHERE role != "admin"', // Оставляем админов
      'DELETE FROM bank_settings'
    ];
    
    for (const query of clearQueries) {
      try {
        await runQuery(query);
        console.log(`✅ Выполнено: ${query}`);
      } catch (error) {
        console.log(`⚠️  Ошибка при выполнении "${query}":`, error.message);
      }
    }
    
    // Сбрасываем автоинкремент
    const resetQueries = [
      'DELETE FROM sqlite_sequence WHERE name="products"',
      'DELETE FROM sqlite_sequence WHERE name="orders"',
      'DELETE FROM sqlite_sequence WHERE name="order_items"',
      'DELETE FROM sqlite_sequence WHERE name="users"',
      'DELETE FROM sqlite_sequence WHERE name="bank_settings"'
    ];
    
    for (const query of resetQueries) {
      try {
        await runQuery(query);
        console.log(`✅ Сброшен автоинкремент: ${query}`);
      } catch (error) {
        // Игнорируем ошибки, если таблица не существует
      }
    }
    
    console.log('\n📊 Статистика после очистки...');
    
    for (const table of tables) {
      try {
        const count = await getQuery(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📋 ${table}: ${count[0]?.count || 0} записей`);
      } catch (error) {
        console.log(`📋 ${table}: таблица не существует или пуста`);
      }
    }
    
    console.log('\n🎉 База данных успешно очищена!');
    console.log('💡 Теперь можете добавить новые товары через админ-панель.');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
  } finally {
    db.close();
  }
}

// Запускаем очистку
clearDatabase();
