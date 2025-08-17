const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'database.sqlite');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('🗑️  Скрипт очистки заказов запущен');
console.log('📁 База данных:', dbPath);

// Функция для очистки заказов
function clearOrders() {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Начинаем очистку заказов...');
    
    // Начинаем транзакцию
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      try {
        // 1. Удаляем все элементы заказов
        db.run('DELETE FROM order_items', (err) => {
          if (err) {
            console.error('❌ Ошибка удаления order_items:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ order_items очищены');
        });
        
        // 2. Удаляем все заказы
        db.run('DELETE FROM orders', (err) => {
          if (err) {
            console.error('❌ Ошибка удаления orders:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ orders очищены');
        });
        
        // 3. Сбрасываем автоинкремент для order_items
        db.run('DELETE FROM sqlite_sequence WHERE name = "order_items"', (err) => {
          if (err) {
            console.error('❌ Ошибка сброса автоинкремента order_items:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ Автоинкремент order_items сброшен');
        });
        
        // 4. Сбрасываем автоинкремент для orders
        db.run('DELETE FROM sqlite_sequence WHERE name = "orders"', (err) => {
          if (err) {
            console.error('❌ Ошибка сброса автоинкремента orders:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ Автоинкремент orders сброшен');
        });
        
        // 5. Фиксируем транзакцию
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('❌ Ошибка фиксации транзакции:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ Транзакция зафиксирована');
          resolve();
        });
        
      } catch (error) {
        console.error('❌ Ошибка в транзакции:', error.message);
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
}

// Функция для проверки результата
function checkResult() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Проверяем результат очистки...');
    
    // Проверяем количество заказов
    db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
      if (err) {
        console.error('❌ Ошибка проверки orders:', err.message);
        reject(err);
        return;
      }
      console.log(`📊 Заказов в базе: ${result.count}`);
      
      // Проверяем количество элементов заказов
      db.get('SELECT COUNT(*) as count FROM order_items', (err, result2) => {
        if (err) {
          console.error('❌ Ошибка проверки order_items:', err.message);
          reject(err);
          return;
        }
        console.log(`📊 Элементов заказов в базе: ${result2.count}`);
        
        if (result.count === 0 && result2.count === 0) {
          console.log('🎉 Очистка завершена успешно!');
        } else {
          console.log('⚠️  Очистка завершена с предупреждениями');
        }
        
        resolve();
      });
    });
  });
}

// Главная функция
async function main() {
  try {
    // Очищаем заказы
    await clearOrders();
    
    // Проверяем результат
    await checkResult();
    
    console.log('\n✅ Скрипт завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка выполнения скрипта:', error.message);
    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('❌ Ошибка закрытия базы данных:', err.message);
      } else {
        console.log('🔒 Соединение с базой данных закрыто');
      }
      process.exit(0);
    });
  }
}

// Запускаем скрипт
main();
