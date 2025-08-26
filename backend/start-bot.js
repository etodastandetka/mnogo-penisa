#!/usr/bin/env node

const { bot } = require('./src/telegramBot');

console.log('🤖 Запуск Telegram бота...');

// Проверяем конфигурацию
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен!');
  console.log('📝 Создайте файл .env с переменными окружения');
  process.exit(1);
}

if (!process.env.TELEGRAM_ADMIN_GROUP_ID) {
  console.error('❌ TELEGRAM_ADMIN_GROUP_ID не установлен!');
  console.log('📝 Укажите ID админ-группы в .env файле');
  process.exit(1);
}

console.log('✅ Конфигурация проверена');
console.log('🤖 Бот готов к работе');

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал завершения');
  console.log('👋 Бот остановлен');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал завершения');
  console.log('👋 Бот остановлен');
  process.exit(0);
});

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
  process.exit(1);
});

console.log('💡 Для остановки бота нажмите Ctrl+C');
console.log('📱 Бот работает в режиме webhook');
console.log('🌐 Webhook URL:', process.env.TELEGRAM_WEBHOOK_URL || 'Не установлен');
