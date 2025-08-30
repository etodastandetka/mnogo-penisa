# 🤖 Python Telegram Бот для Заказов

## 📋 Функции бота

- **/start** - Начать работу с ботом
- **/orders** - Посмотреть все заказы пользователя
- **/order <номер>** - Детальная информация о заказе
- **/help** - Справка по командам
- **Номер заказа** - Можно просто написать номер заказа

## 🚀 Быстрый запуск

### 1. Установка Python
Убедитесь, что у вас установлен Python 3.7+

### 2. Запуск бота
```bash
# Простой запуск
python telegram_bot.py

# Или через скрипт (автоматически установит зависимости)
python start-python-bot.py
```

### 3. Остановка бота
Нажмите `Ctrl+C`

## 📦 Установка зависимостей вручную

```bash
pip install -r requirements.txt
```

## 🔧 Конфигурация

Токены захардкожены в файле `telegram_bot.py`:

```python
BOT_TOKEN = '8336008623:AAHWO3vRgVceBeJvjMVaPBdZMkNTBB-MHCc'
ADMIN_GROUP_ID = -1002728692510
WEBHOOK_URL = 'https://mnogo-rolly.kg/telegram-webhook'
```

## 🌐 Webhook vs Polling

- **Production режим** - использует webhook
- **Development режим** - использует polling

## 📱 Тестирование бота

1. Найдите бота в Telegram: `@mnogo_penisa_bot`
2. Отправьте `/start`
3. Попробуйте команды `/help`, `/orders`

## 🗄️ База данных

Бот автоматически создает необходимые таблицы:
- `telegram_users` - пользователи бота
- `telegram_orders` - связь заказов с пользователями

## 🔄 Интеграция с сайтом

Для отправки уведомлений о новых заказах используйте функции:

```python
from telegram_bot import notify_admins_new_order, link_order_with_telegram_user

# Уведомление админов
notify_admins_new_order({
    'order_number': '123',
    'customer_name': 'Иван',
    'customer_phone': '+79001234567',
    'delivery_address': 'ул. Примерная, 1',
    'total_amount': 1500,
    'items': [{'name': 'Ролл', 'quantity': 2, 'price': 750}]
})

# Связывание заказа с пользователем
link_order_with_telegram_user(123, '+79001234567')
```

## 🚨 Устранение неполадок

### Бот не отвечает
- Проверьте токен бота
- Убедитесь, что бот запущен
- Проверьте логи на ошибки

### Ошибки базы данных
- Убедитесь, что `database.sqlite` доступен
- Проверьте права доступа к файлу

### Webhook ошибки
- В development режиме webhook не устанавливается
- Проверьте доступность домена в production
