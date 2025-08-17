const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./data/mnogo_rolly.db');

// Новый пароль для админа
const newPassword = 'admin123';

// Хешируем новый пароль
const hashedPassword = bcrypt.hashSync(newPassword, 10);

// Обновляем пароль
db.run(
  'UPDATE users SET password = ? WHERE email = ?',
  [hashedPassword, 'admin@mnogo-rolly.ru'],
  function(err) {
    if (err) {
      } else {
      // Проверяем результат
      db.get('SELECT id, email, name, is_admin, role FROM users WHERE email = ?', ['admin@mnogo-rolly.ru'], (err, user) => {
        if (err) {
          } else {
          }
        db.close();
      });
    }
  }
);




