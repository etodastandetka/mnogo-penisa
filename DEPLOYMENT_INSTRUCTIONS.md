# Инструкция по развертыванию FreedomPay в боевой режим

## 🚀 Шаг 1: Настройка сервера

### 1.1. Запуск боевого сервера
```bash
cd backend
npm install
node start-server.js
```

### 1.2. Проверка доступности
Убедитесь, что сервер доступен по адресу:
- `https://mnogo-rolly.online`
- `https://mnogo-rolly.online/api/payments/freedompay/health`

## 🔧 Шаг 2: Настройка в панели FreedomPay

### 2.1. Войдите в панель управления FreedomPay
Используйте ваши учетные данные для входа.

### 2.2. Заполните системные настройки:

#### CHECK URL
```
https://mnogo-rolly.online/api/payments/freedompay/check
```

#### RESULT URL
```
https://mnogo-rolly.online/api/payments/freedompay/result
```

#### SUCCESS URL
```
https://mnogo-rolly.online/payment/success
```

#### FAILURE URL
```
https://mnogo-rolly.online/payment/failure
```

#### Helpdesk email
```
dastandzhumanaliev42@gmail.com
```

#### Helpdesk phone
```
996555002029
```

### 2.3. Сохраните настройки

## ✅ Шаг 3: Проверка работоспособности

### 3.1. Проверьте healthcheck
```bash
curl https://mnogo-rolly.online/api/payments/freedompay/health
```

Ожидаемый ответ:
```json
{
  "success": true,
  "healthy": true,
  "timestamp": "2025-09-01T...",
  "service": "FreedomPay",
  "mode": "production",
  "baseUrl": "https://mnogo-rolly.online"
}
```

### 3.2. Проверьте доступность CHECK URL
```bash
curl -X POST https://mnogo-rolly.online/api/payments/freedompay/check \
  -H "Content-Type: application/json" \
  -d '{"orderId": "test", "amount": 100}'
```

## 🎯 Шаг 4: Тестирование на сайте

### 4.1. Создайте тестовый заказ
1. Перейдите на `https://mnogo-rolly.online`
2. Добавьте товары в корзину
3. Оформите заказ
4. Перейдите к оплате

### 4.2. Проверьте процесс оплаты
1. Убедитесь, что перенаправляетесь на FreedomPay
2. Заполните тестовые данные карты
3. Завершите оплату
4. Проверьте перенаправление на SUCCESS URL

### 4.3. Проверьте webhook
1. Убедитесь, что webhook приходит на RESULT URL
2. Проверьте обновление статуса заказа в БД
3. Проверьте создание записи в `payment_transactions`

## 🚨 Важные моменты

### Безопасность
- Все запросы подписываются MD5 хешем
- Проверяется подпись входящих webhook'ов
- Используется HTTPS для всех URL

### Мониторинг
- Логируются все входящие запросы
- Отслеживаются ошибки платежей
- Мониторится статус FreedomPay

### Резервное копирование
- Регулярно делайте бэкап базы данных
- Сохраните конфигурационные файлы
- Документируйте все изменения

## 🔍 Устранение проблем

### Сервер недоступен
- Проверьте, что сервер запущен
- Убедитесь в правильности портов
- Проверьте firewall настройки

### Webhook не приходят
- Проверьте правильность RESULT URL
- Убедитесь в доступности сервера
- Проверьте логи FreedomPay

### Ошибки подписи
- Проверьте правильность secret key
- Убедитесь в корректности алгоритма MD5
- Проверьте порядок параметров

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Обратитесь в поддержку FreedomPay
3. Свяжитесь по email: dastandzhumanaliev42@gmail.com
4. Позвоните: 996555002029
