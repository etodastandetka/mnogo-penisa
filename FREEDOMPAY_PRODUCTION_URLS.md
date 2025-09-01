# URL для настройки в панели FreedomPay (Боевой режим)

## 🚀 Боевые URL для сайта https://mnogo-rolly.online

### 1. CHECK URL
```
https://mnogo-rolly.online/api/payments/freedompay/check
```
**Назначение**: Проверка возможности приема платежа
**Метод**: POST
**Параметры**: `orderId`, `amount`

### 2. RESULT URL (Webhook)
```
https://mnogo-rolly.online/api/payments/freedompay/result
```
**Назначение**: Webhook для получения результата платежа
**Метод**: POST
**Параметры**: Все параметры от FreedomPay с подписью

### 3. SUCCESS URL
```
https://mnogo-rolly.online/payment/success
```
**Назначение**: Перенаправление пользователя после успешной оплаты
**Метод**: GET
**Параметры**: `order_id`, `payment_id`

### 4. FAILURE URL
```
https://mnogo-rolly.online/payment/failure
```
**Назначение**: Перенаправление пользователя после неуспешной оплаты
**Метод**: GET
**Параметры**: `order_id`, `error_code`, `error_description`

## 📞 Контактная информация

### Helpdesk email
```
dastandzhumanaliev42@gmail.com
```

### Helpdesk phone
```
996555002029
```

## 🔧 Настройка в панели FreedomPay

1. Войдите в панель управления FreedomPay
2. Перейдите в раздел "Системные настройки"
3. Заполните все URL выше
4. Укажите контактную информацию
5. Сохраните настройки

## ✅ Проверка работоспособности

После настройки проверьте:

1. **Healthcheck**: `GET https://mnogo-rolly.online/api/payments/freedompay/health`
2. **Доступность CHECK URL**: `POST https://mnogo-rolly.online/api/payments/freedompay/check`
3. **Доступность RESULT URL**: `POST https://mnogo-rolly.online/api/payments/freedompay/result`

## 🎯 Тестирование

1. Создайте заказ на сайте
2. Перейдите к оплате
3. Убедитесь, что перенаправляетесь на FreedomPay
4. Проверьте, что webhook'и приходят на RESULT URL
5. Проверьте перенаправление на SUCCESS/FAILURE URL

## 🚨 Важно

- Все URL должны быть доступны по HTTPS
- Сервер должен быть доступен из интернета
- Проверьте, что все endpoints работают корректно
- Убедитесь в правильности подписи запросов
