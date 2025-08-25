const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Подключаемся к базе данных
const dbPath = path.join(__dirname, 'data', 'mnogo_rolly.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Подключаемся к базе данных:', dbPath);

// Обновляем права пользователя на администратора
const email = 'admin@mnogo-rolly.ru';

db.run(
  'UPDATE users SET is_admin = 1, role = "admin" WHERE email = ?',
  [email],
  function(err) {
    if (err) {
      console.error('❌ Ошибка обновления пользователя:', err);
    } else {
      if (this.changes > 0) {
        console.log('✅ Пользователь успешно обновлен!');
        console.log('📧 Email:', email);
        console.log('🔑 Права: Администратор');
        console.log('📊 Изменено записей:', this.changes);
      } else {
        console.log('⚠️ Пользователь не найден или уже является администратором');
      }
    }
    
    // Проверяем результат
    db.get('SELECT id, name, email, is_admin, role FROM users WHERE email = ?', [email], (err, user) => {
      if (err) {
        console.error('❌ Ошибка проверки пользователя:', err);
      } else if (user) {
        console.log('📋 Текущие данные пользователя:');
        console.log('   ID:', user.id);
        console.log('   Имя:', user.name);
        console.log('   Email:', user.email);
        console.log('   is_admin:', user.is_admin);
        console.log('   role:', user.role);
      } else {
        console.log('❌ Пользователь не найден в базе данных');
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
  }
);
