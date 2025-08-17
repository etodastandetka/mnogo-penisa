const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'database.sqlite');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath);

console.log('🗑️  Скрипт полной очистки базы данных запущен');
console.log('📁 База данных:', dbPath);
console.log('⚠️  ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные!');

// Функция для полной очистки базы данных
function clearAllData() {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Начинаем полную очистку базы данных...');
    
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
        
        // 3. Удаляем все товары
        db.run('DELETE FROM products', (err) => {
          if (err) {
            console.error('❌ Ошибка удаления products:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ products очищены');
        });
        
        // 4. Удаляем всех пользователей (кроме админа)
        db.run('DELETE FROM users WHERE is_admin = 0', (err) => {
          if (err) {
            console.error('❌ Ошибка удаления пользователей:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ Пользователи (не админы) удалены');
        });
        
        // 5. Сбрасываем автоинкремент для всех таблиц
        db.run('DELETE FROM sqlite_sequence', (err) => {
          if (err) {
            console.error('❌ Ошибка сброса автоинкрементов:', err.message);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          console.log('✅ Все автоинкременты сброшены');
        });
        
        // 6. Фиксируем транзакцию
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
        
        // Проверяем количество товаров
        db.get('SELECT COUNT(*) as count FROM products', (err, result3) => {
          if (err) {
            console.error('❌ Ошибка проверки products:', err.message);
            reject(err);
            return;
          }
          console.log(`📊 Товаров в базе: ${result3.count}`);
          
          // Проверяем количество пользователей
          db.get('SELECT COUNT(*) as count FROM users', (err, result4) => {
            if (err) {
              console.error('❌ Ошибка проверки users:', err.message);
              reject(err);
              return;
            }
            console.log(`📊 Пользователей в базе: ${result4.count}`);
            
            if (result.count === 0 && result2.count === 0 && result3.count === 0) {
              console.log('🎉 Полная очистка завершена успешно!');
            } else {
              console.log('⚠️  Очистка завершена с предупреждениями');
            }
            
            resolve();
          });
        });
      });
    });
  });
}

// Главная функция
async function main() {
  try {
    // Очищаем все данные
    await clearAllData();
    
    // Проверяем результат
    await checkResult();
    
    console.log('\n✅ Скрипт завершен успешно!');
    console.log('💡 Теперь можете запустить seed_products.js для добавления товаров');
    
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
