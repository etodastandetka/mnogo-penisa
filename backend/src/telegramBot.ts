import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
import sqlite3 from 'sqlite3';
import path from 'path';

config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_GROUP_ID = process.env.TELEGRAM_ADMIN_GROUP_ID;
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL;

let bot: TelegramBot | null = null;

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
  
  // Установка webhook если указан URL
  if (TELEGRAM_WEBHOOK_URL) {
    bot.setWebHook(TELEGRAM_WEBHOOK_URL).then(() => {
      console.log('✅ Telegram webhook установлен:', TELEGRAM_WEBHOOK_URL);
    }).catch(error => {
      console.error('❌ Ошибка установки webhook:', error);
    });
  }
}

// Подключение к базе данных
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Создание таблиц для Telegram бота
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

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export async function sendNewOrderNotification(order: Order): Promise<void> {
  if (!bot || !TELEGRAM_ADMIN_GROUP_ID) {
    return;
  }

  try {
    const message = formatOrderMessage(order);
    await bot.sendMessage(TELEGRAM_ADMIN_GROUP_ID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
    // Связываем заказ с пользователем Telegram по телефону
    await linkOrderWithTelegramUser(order.orderNumber, order.customerPhone);
  } catch (error) {
    console.error('Ошибка отправки уведомления о новом заказе:', error);
  }
}

export async function sendStatusUpdateNotification(order: any, oldStatus: string): Promise<void> {
  if (!bot || !TELEGRAM_ADMIN_GROUP_ID) {
    return;
  }

  try {
    const message = formatStatusUpdateMessage(order, oldStatus);
    await bot.sendMessage(TELEGRAM_ADMIN_GROUP_ID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    
    // Уведомляем клиента об изменении статуса
    await notifyClientAboutStatusChange(order.orderNumber, order.status);
  } catch (error) {
    console.error('Ошибка отправки уведомления об изменении статуса:', error);
  }
}

function formatOrderMessage(order: Order): string {
  const statusEmoji = getStatusEmoji(order.status);
  const statusText = getStatusText(order.status);
  
  return `
🆕 <b>Новый заказ!</b>

📋 <b>Заказ #${order.orderNumber}</b>
👤 <b>Клиент:</b> ${order.customerName}
📞 <b>Телефон:</b> ${order.customerPhone}
📍 <b>Адрес:</b> ${order.deliveryAddress || 'Не указан'}
💰 <b>Сумма:</b> ${order.totalAmount} сом
${statusEmoji} <b>Статус:</b> ${statusText}

🛒 <b>Товары:</b>
${order.items.map(item => `• ${item.productName} x${item.quantity} - ${item.price} сом`).join('\n')}

⏰ <b>Время заказа:</b> ${formatDate(order.createdAt)}
  `.trim();
}

function formatStatusUpdateMessage(order: any, oldStatus: string): string {
  const oldStatusEmoji = getStatusEmoji(oldStatus);
  const newStatusEmoji = getStatusEmoji(order.status);
  const oldStatusText = getStatusText(oldStatus);
  const newStatusText = getStatusText(order.status);
  
  return `
🔄 <b>Обновление статуса заказа</b>

📋 <b>Заказ #${order.orderNumber}</b>
👤 <b>Клиент:</b> ${order.customerName}
${oldStatusEmoji} <b>Старый статус:</b> ${oldStatusText}
${newStatusEmoji} <b>Новый статус:</b> ${newStatusText}

⏰ <b>Время обновления:</b> ${formatDate(new Date().toISOString())}
  `.trim();
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'paid': return '💳';
    case 'preparing': return '👨‍🍳';
    case 'ready': return '✅';
    case 'delivering': return '🚚';
    case 'delivered': return '🎉';
    case 'cancelled': return '❌';
    default: return '📋';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Ожидает оплаты';
    case 'paid': return 'Оплачен';
    case 'preparing': return 'Готовится';
    case 'ready': return 'Готов';
    case 'delivering': return 'В доставке';
    case 'delivered': return 'Доставлен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Тестовая функция удалена

export function getBotInfo(): { isConfigured: boolean; chatId?: string } {
  return {
    isConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_GROUP_ID),
    chatId: TELEGRAM_ADMIN_GROUP_ID
  };
}

// Функция для уведомления клиента об изменении статуса заказа
async function notifyClientAboutStatusChange(orderId: string, newStatus: string): Promise<void> {
  try {
    db.get(`
      SELECT to.telegram_id, o.total_amount, o.delivery_address
      FROM telegram_orders to
      JOIN orders o ON to.order_id = o.id
      WHERE to.order_id = ?
    `, [orderId], (err, result) => {
      if (err || !result) {
        console.log('Не удалось найти пользователя для заказа:', orderId);
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
      
      bot?.sendMessage(result.telegram_id, message);
    });
  } catch (error) {
    console.error('Ошибка при уведомлении клиента:', error);
  }
}

// Функция для связывания заказа с пользователем Telegram
async function linkOrderWithTelegramUser(orderId: string, phone: string): Promise<void> {
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

// Функция для регистрации пользователя в Telegram
export async function registerTelegramUser(telegramId: number, username: string, firstName: string, lastName: string, phone?: string): Promise<void> {
  try {
    db.run(
      'INSERT OR IGNORE INTO telegram_users (telegram_id, username, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [telegramId, username, firstName, lastName, phone]
    );
    console.log('Пользователь Telegram зарегистрирован:', telegramId);
  } catch (error) {
    console.error('Ошибка при регистрации пользователя Telegram:', error);
  }
}

// Функция для получения информации о заказе пользователя
export async function getUserOrder(telegramId: number, orderId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT o.*, GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      JOIN telegram_orders to ON o.id = to.order_id
      WHERE o.id = ? AND to.telegram_id = ?
      GROUP BY o.id
    `, [orderId, telegramId], (err, order) => {
      if (err) {
        reject(err);
      } else {
        resolve(order);
      }
    });
  });
}

// Функция для получения списка заказов пользователя
export async function getUserOrders(telegramId: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT o.id, o.status, o.total_amount, o.created_at, o.delivery_address
      FROM orders o
      JOIN telegram_orders to ON o.id = to.order_id
      WHERE to.telegram_id = ?
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [telegramId], (err, orders) => {
      if (err) {
        reject(err);
      } else {
        resolve(orders || []);
      }
    });
  });
}

