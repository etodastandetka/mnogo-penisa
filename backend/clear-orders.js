const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Подключаемся к базе данных
const dbPath = path.join(__dirname, 'data', 'mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Подключаемся к базе данных:', dbPath);

// Функция для очистки заказов
const clearOrders = () => {
  console.log('🗑️ Начинаем очистку заказов...');
  
  // Сначала удаляем элементы заказов (order_items)
  db.run('DELETE FROM order_items', function(err) {
    if (err) {
      console.error('❌ Ошибка удаления элементов заказов:', err);
    } else {
      console.log('✅ Удалено элементов заказов:', this.changes);
    }
    
    // Затем удаляем чеки (receipts)
    db.run('DELETE FROM receipts', function(err) {
      if (err) {
        console.error('❌ Ошибка удаления чеков:', err);
      } else {
        console.log('✅ Удалено чеков:', this.changes);
      }
      
      // Наконец удаляем сами заказы
      db.run('DELETE FROM orders', function(err) {
        if (err) {
          console.error('❌ Ошибка удаления заказов:', err);
        } else {
          console.log('✅ Удалено заказов:', this.changes);
          console.log('🎉 Все заказы успешно очищены!');
        }
        
        // Проверяем результат
        db.get('SELECT COUNT(*) as count FROM orders', (err, result) => {
          if (err) {
            console.error('❌ Ошибка проверки:', err);
          } else {
            console.log('📊 Осталось заказов в базе:', result.count);
          }
          
          // Закрываем соединение
          db.close((err) => {
            if (err) {
              console.error('❌ Ошибка закрытия базы данных:', err);
            } else {
              console.log('✅ База данных закрыта');
            }
          });
        });
      });
    });
  });
};

// Запускаем очистку
clearOrders();



