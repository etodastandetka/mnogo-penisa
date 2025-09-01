# URL для интеграции FreedomPay

## Основные URL для настройки в панели FreedomPay

### 1. CHECK URL
```
https://yourdomain.com/api/payments/freedompay/check
```
**Назначение**: Проверка возможности приема платежа
**Метод**: POST
**Параметры**: 
- `orderId` - ID заказа
- `amount` - Сумма платежа

### 2. RESULT URL (Webhook)
```
https://yourdomain.com/api/payments/freedompay/result
```
**Назначение**: Получение уведомления о результате платежа
**Метод**: POST
**Параметры**: Все параметры от FreedomPay с подписью `pg_sig`

### 3. SUCCESS URL
```
https://yourdomain.com/payment/success
```
**Назначение**: Перенаправление пользователя после успешной оплаты
**Метод**: GET
**Параметры**: 
- `order_id` - ID заказа
- `payment_id` - ID платежа

### 4. FAILURE URL
```
https://yourdomain.com/payment/failure
```
**Назначение**: Перенаправление пользователя после неуспешной оплаты
**Метод**: GET
**Параметры**: 
- `order_id` - ID заказа
- `error_code` - Код ошибки
- `error_description` - Описание ошибки

## API Endpoints вашего сервера

### Инициализация платежа
```
POST https://yourdomain.com/api/payments/freedompay/init
```

### Проверка статуса платежа
```
GET https://yourdomain.com/api/payments/freedompay/status/:orderId
```

### Healthcheck FreedomPay
```
GET https://yourdomain.com/api/payments/freedompay/health
```

## URL для тестирования (локальная разработка)

### Локальные URL
```
CHECK URL: http://localhost:3000/api/payments/freedompay/check
RESULT URL: http://localhost:3000/api/payments/freedompay/result
SUCCESS URL: http://localhost:3000/payment/success
FAILURE URL: http://localhost:3000/payment/failure
```

## Важные замечания

1. **Замените `yourdomain.com` на ваш реальный домен**
2. **Все URL должны быть доступны по HTTPS в продакшене**
3. **URL должны быть настроены в панели FreedomPay**
4. **Проверьте доступность всех endpoints перед запуском**

## Проверка работоспособности

После настройки URL проверьте:

1. **Healthcheck**: `GET /api/payments/freedompay/health`
2. **Доступность CHECK URL**: `POST /api/payments/freedompay/check`
3. **Доступность RESULT URL**: `POST /api/payments/freedompay/result`

## Тестирование

Для тестирования используйте скрипт:
```bash
cd backend
node test_freedompay.js
```
