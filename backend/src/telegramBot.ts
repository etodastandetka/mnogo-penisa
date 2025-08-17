import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';

config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot: TelegramBot | null = null;

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

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
  if (!bot || !TELEGRAM_CHAT_ID) {
    return;
  }

  try {
    const message = formatOrderMessage(order);
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    } catch (error) {
    }
}

export async function sendStatusUpdateNotification(order: any, oldStatus: string): Promise<void> {
  if (!bot || !TELEGRAM_CHAT_ID) {
    return;
  }

  try {
    const message = formatStatusUpdateMessage(order, oldStatus);
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    } catch (error) {
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

export async function testTelegramBot(): Promise<void> {
  if (!bot || !TELEGRAM_CHAT_ID) {
    throw new Error('Telegram бот не настроен');
  }

  try {
    const message = `
🧪 <b>Тестовое сообщение</b>

Это тестовое сообщение от Telegram бота Mnogo Rolly.
Если вы видите это сообщение, значит бот настроен правильно!

⏰ <b>Время отправки:</b> ${formatDate(new Date().toISOString())}
    `.trim();

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    } catch (error) {
    throw error;
  }
}

export function getBotInfo(): { isConfigured: boolean; chatId?: string } {
  return {
    isConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    chatId: TELEGRAM_CHAT_ID
  };
}

