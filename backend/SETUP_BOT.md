# 🚀 Быстрая настройка Telegram бота

## 1. Создайте файл `.env` в папке `backend/`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_GROUP_ID=your_group_id_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram-webhook

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3001
NODE_ENV=development
```

## 2. Получите токен бота:

1. Напишите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Введите название: "Много Пениса - Заказы"
4. Введите username: `mnogo_penisa_bot`
5. Скопируйте полученный токен в `TELEGRAM_BOT_TOKEN`

## 3. Получите ID группы:

1. Создайте группу в Telegram
2. Добавьте туда бота
3. Напишите [@userinfobot](https://t.me/userinfobot) в группе
4. Скопируйте ID группы в `TELEGRAM_ADMIN_GROUP_ID`

## 4. Запустите бота:

```bash
npm run bot
```

## 5. Тестирование:

1. Откройте сайт: http://localhost:3000
2. Сделайте заказ
3. Проверьте уведомления в группе
4. Напишите боту `/start`
