const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Конфигурация бота (захардкожено)
const BOT_TOKEN = '8336008623:AAHWO3vRgVceBeJvjMVaPBdZMkNTBB-MHCc';
const ADMIN_GROUP_ID = '-1002728692510';
const WEBHOOK_URL = 'https://mnogo-rolly.kg/telegram-webhook';

// Инициализация бота
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Подключение к базе данных
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Создание таблицы для связи пользователей с заказами
db.run(`
  CREATE TABLE IF NOT EXISTS telegram_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS telegram_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (telegram_id) REFERENCES telegram_users (telegram_id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
  )
`);

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    // Сохраняем пользователя в БД
    db.run(
      'INSERT OR IGNORE INTO telegram_users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
      [user.id, user.username, user.first_name, user.last_name]
    );
    
    const welcomeMessage = `
🍕 Добро пожаловать в бот заказов "Много Пениса"!

📋 Доступные команды:
/orders - Посмотреть мои заказы
/order <номер> - Информация о заказе
/help - Помощь

💡 Чтобы узнать статус заказа, напишите его номер или используйте команду /order <номер>
    `;
    
    bot.sendMessage(chatId, welcomeMessage);
  } catch (error) {
    console.error('Ошибка при обработке /start:', error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка команды /orders
bot.onText(/\/orders/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    db.all(`
      SELECT o.id, o.status, o.total_amount, o.created_at, o.delivery_address
      FROM orders o
      JOIN telegram_orders to ON o.id = to.order_id
      WHERE to.telegram_id = ?
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [userId], (err, orders) => {
      if (err) {
        console.error('Ошибка при получении заказов:', err);
        bot.sendMessage(chatId, 'Произошла ошибка при получении заказов.');
        return;
      }
      
      if (orders.length === 0) {
        bot.sendMessage(chatId, 'У вас пока нет заказов. Сделайте первый заказ на сайте! 🛒');
        return;
      }
      
      let message = '📋 Ваши последние заказы:\n\n';
      orders.forEach(order => {
        const status = getStatusEmoji(order.status);
        const date = new Date(order.created_at).toLocaleDateString('ru-RU');
        message += `${status} Заказ #${order.id}\n`;
        message += `💰 Сумма: ${order.total_amount} ₽\n`;
        message += `📅 Дата: ${date}\n`;
        message += `📍 Адрес: ${order.delivery_address || 'Не указан'}\n`;
        message += `📊 Статус: ${getStatusText(order.status)}\n\n`;
      });
      
      message += '💡 Для детальной информации используйте: /order <номер>';
      bot.sendMessage(chatId, message);
    });
  } catch (error) {
    console.error('Ошибка при обработке /orders:', error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка команды /order <номер>
bot.onText(/\/order (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const orderId = match[1];
  
  try {
    db.get(`
      SELECT o.*, GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      JOIN telegram_orders to ON o.id = to.order_id
      WHERE o.id = ? AND to.telegram_id = ?
      GROUP BY o.id
    `, [orderId, userId], (err, order) => {
      if (err) {
        console.error('Ошибка при получении заказа:', err);
        bot.sendMessage(chatId, 'Произошла ошибка при получении заказа.');
        return;
      }
      
      if (!order) {
        bot.sendMessage(chatId, 'Заказ не найден или у вас нет к нему доступа.');
        return;
      }
      
      const status = getStatusEmoji(order.status);
      const date = new Date(order.created_at).toLocaleDateString('ru-RU');
      const time = new Date(order.created_at).toLocaleTimeString('ru-RU');
      
      let message = `${status} Заказ #${order.id}\n\n`;
      message += `📅 Дата: ${date} в ${time}\n`;
      message += `💰 Сумма: ${order.total_amount} ₽\n`;
      message += `📍 Адрес: ${order.delivery_address || 'Не указан'}\n`;
      message += `📱 Телефон: ${order.phone || 'Не указан'}\n`;
      message += `📊 Статус: ${getStatusText(order.status)}\n\n`;
      
      if (order.items) {
        message += `🛒 Товары:\n${order.items}\n\n`;
      }
      
      message += `📝 Комментарий: ${order.comment || 'Нет комментария'}`;
      
      bot.sendMessage(chatId, message);
    });
  } catch (error) {
    console.error('Ошибка при обработке /order:', error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка команды /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
🔧 Помощь по боту

📋 Основные команды:
/start - Начать работу с ботом
/orders - Посмотреть мои заказы
/order <номер> - Информация о заказе
/help - Показать эту справку

💡 Примеры использования:
• /order 123 - посмотреть заказ №123
• /orders - список всех заказов

🌐 Сайт: https://your-domain.com
📞 Поддержка: @admin_username
  `;
  
  bot.sendMessage(chatId, helpMessage);
});

// Обработка текстовых сообщений (номер заказа)
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text.trim();
    
    // Проверяем, является ли сообщение номером заказа
    if (/^\d+$/.test(text)) {
      const orderId = parseInt(text);
      
      try {
        db.get(`
          SELECT o.*, GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN products p ON oi.product_id = p.id
          JOIN telegram_orders to ON o.id = to.order_id
          WHERE o.id = ? AND to.telegram_id = ?
          GROUP BY o.id
        `, [orderId, userId], (err, order) => {
          if (err) {
            console.error('Ошибка при получении заказа:', err);
            bot.sendMessage(chatId, 'Произошла ошибка при получении заказа.');
            return;
          }
          
          if (!order) {
            bot.sendMessage(chatId, 'Заказ не найден или у вас нет к нему доступа.');
            return;
          }
          
          const status = getStatusEmoji(order.status);
          const date = new Date(order.created_at).toLocaleDateString('ru-RU');
          const time = new Date(order.created_at).toLocaleTimeString('ru-RU');
          
          let message = `${status} Заказ #${order.id}\n\n`;
          message += `📅 Дата: ${date} в ${time}\n`;
          message += `💰 Сумма: ${order.total_amount} ₽\n`;
          message += `📍 Адрес: ${order.delivery_address || 'Не указан'}\n`;
          message += `📱 Телефон: ${order.phone || 'Не указан'}\n`;
          message += `📊 Статус: ${getStatusText(order.status)}\n\n`;
          
          if (order.items) {
            message += `🛒 Товары:\n${order.items}\n\n`;
          }
          
          message += `📝 Комментарий: ${order.comment || 'Нет комментария'}`;
          
          bot.sendMessage(chatId, message);
        });
      } catch (error) {
        console.error('Ошибка при обработке номера заказа:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
      }
    } else {
      bot.sendMessage(chatId, 'Отправьте номер заказа или используйте команду /help для справки.');
    }
  }
});

// Функция для уведомления клиента об изменении статуса заказа
async function notifyClientAboutStatusChange(orderId, newStatus) {
  try {
    db.get(`
      SELECT to.telegram_id, o.total_amount, o.delivery_address
      FROM telegram_orders to
      JOIN orders o ON to.order_id = o.id
      WHERE to.order_id = ?
    `, [orderId], (err, result) => {
      if (err || !result) {
        console.error('Не удалось найти пользователя для заказа:', orderId);
        return;
      }
      
      const status = getStatusEmoji(newStatus);
      const message = `
${status} Статус заказа #${orderId} изменен!

📊 Новый статус: ${getStatusText(newStatus)}
💰 Сумма: ${result.total_amount} ₽
📍 Адрес: ${result.delivery_address || 'Не указан'}

🔄 Для обновления информации используйте: /order ${orderId}
      `;
      
      bot.sendMessage(result.telegram_id, message);
    });
  } catch (error) {
    console.error('Ошибка при уведомлении клиента:', error);
  }
}

// Функция для уведомления админов о новом заказе
async function notifyAdminsAboutNewOrder(orderId, orderData) {
  try {
    const message = `
🆕 Новый заказ #${orderId}!

👤 Клиент: ${orderData.name}
📱 Телефон: ${orderData.phone}
📍 Адрес: ${orderData.delivery_address}
💰 Сумма: ${orderData.total_amount} ₽
📝 Комментарий: ${orderData.comment || 'Нет'}

🛒 Товары:
${orderData.items.map(item => `• ${item.quantity}x ${item.name} - ${item.price} ₽`).join('\n')}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `;
    
    bot.sendMessage(ADMIN_GROUP_ID, message);
  } catch (error) {
    console.error('Ошибка при уведомлении админов:', error);
  }
}

// Функция для уведомления админов об изменении статуса заказа
async function notifyAdminsAboutStatusChange(orderId, oldStatus, newStatus) {
  try {
    const message = `
🔄 Статус заказа #${orderId} изменен!

📊 Старый статус: ${getStatusText(oldStatus)}
📊 Новый статус: ${getStatusText(newStatus)}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `;
    
    bot.sendMessage(ADMIN_GROUP_ID, message);
  } catch (error) {
    console.error('Ошибка при уведомлении админов об изменении статуса:', error);
  }
}

// Вспомогательные функции
function getStatusEmoji(status) {
  const statusMap = {
    'pending': '⏳',
    'confirmed': '✅',
    'preparing': '👨‍🍳',
    'ready': '🚚',
    'delivered': '🎉',
    'cancelled': '❌'
  };
  return statusMap[status] || '❓';
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'preparing': 'Готовится',
    'ready': 'Готов к доставке',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || 'Неизвестно';
}

// Функция для связывания заказа с пользователем Telegram
async function linkOrderWithTelegramUser(orderId, phone) {
  try {
    db.get('SELECT telegram_id FROM telegram_users WHERE phone = ?', [phone], (err, user) => {
      if (err || !user) {
        console.log('Пользователь с телефоном', phone, 'не найден в Telegram');
        return;
      }
      
      db.run('INSERT OR IGNORE INTO telegram_orders (telegram_id, order_id) VALUES (?, ?)', 
        [user.telegram_id, orderId], (err) => {
        if (err) {
          console.error('Ошибка при связывании заказа с пользователем:', err);
        } else {
          console.log('Заказ', orderId, 'связан с пользователем Telegram', user.telegram_id);
        }
      });
    });
  } catch (error) {
    console.error('Ошибка при связывании заказа:', error);
  }
}

// Экспорт функций для использования в основном API
module.exports = {
  bot,
  notifyClientAboutStatusChange,
  notifyAdminsAboutNewOrder,
  notifyAdminsAboutStatusChange,
  linkOrderWithTelegramUser
};

// Запуск бота (если файл запущен напрямую)
if (require.main === module) {
  console.log('🤖 Telegram бот запущен...');
  
  // Установка webhook
  bot.setWebHook(WEBHOOK_URL).then(() => {
    console.log('✅ Webhook установлен:', WEBHOOK_URL);
  }).catch(error => {
    console.error('❌ Ошибка установки webhook:', error);
  });
}
