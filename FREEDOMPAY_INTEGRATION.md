# Интеграция FreedomPay

## Обзор

Данная интеграция заменяет старую систему оплаты на новую, использующую платежный шлюз FreedomPay для приема онлайн-платежей.

## Конфигурация

### Основные параметры
- **Project ID**: `560745`
- **Secret Key (прием платежей)**: `ICfWiGtk83PSJRyk`
- **Secret Key (выплаты)**: `7YAYjCE7qwVDm7cY`

### URL endpoints для настройки в FreedomPay

В панели FreedomPay необходимо настроить следующие URL:

#### 1. CHECK URL
```
https://yourdomain.com/api/payments/freedompay/check
```
**Назначение**: Проверка возможности приема платежа
**Метод**: POST
**Параметры**: `orderId`, `amount`

#### 2. RESULT URL
```
https://yourdomain.com/api/payments/freedompay/result
```
**Назначение**: Webhook для получения результата платежа
**Метод**: POST
**Параметры**: Все параметры от FreedomPay с подписью

#### 3. SUCCESS URL
```
https://yourdomain.com/payment/success
```
**Назначение**: Перенаправление пользователя после успешной оплаты
**Метод**: GET
**Параметры**: `order_id`, `payment_id`

#### 4. FAILURE URL
```
https://yourdomain.com/payment/failure
```
**Назначение**: Перенаправление пользователя после неуспешной оплаты
**Метод**: GET
**Параметры**: `order_id`, `error_code`, `error_description`

## Установка и настройка

### 1. Создание таблиц базы данных

```bash
cd backend
node create_payment_tables.js
```

### 2. Установка зависимостей

```bash
cd backend
npm install axios
```

### 3. Настройка переменных окружения

Создайте файл `.env` в папке `backend`:

```env
# FreedomPay URLs (замените на ваши реальные домены)
FREEDOMPAY_SUCCESS_URL=https://yourdomain.com/payment/success
FREEDOMPAY_FAILURE_URL=https://yourdomain.com/payment/failure
FREEDOMPAY_RESULT_URL=https://yourdomain.com/api/payments/freedompay/result
FREEDOMPAY_CHECK_URL=https://yourdomain.com/api/payments/freedompay/check

# Базовый URL вашего сайта
BASE_URL=https://yourdomain.com

# Настройки логирования
LOG_LEVEL=info
SAVE_LOGS_TO_FILE=false
DEBUG_FREEDOMPAY=false
```

## Структура файлов

### Backend
- `api/freedompay.ts` - Основной сервис для работы с FreedomPay API
- `api/paymentRoutes.ts` - Роуты для обработки платежей
- `config/freedompay.js` - Конфигурация FreedomPay
- `create_payment_tables.js` - Скрипт создания таблиц БД

### Frontend
- `components/FreedomPayCheckout.tsx` - Компонент checkout с FreedomPay
- `pages/PaymentSuccessPage.tsx` - Страница успешной оплаты
- `pages/PaymentFailurePage.tsx` - Страница неуспешной оплаты
- `pages/CheckoutPage.tsx` - Обновленная страница оформления заказа

## API Endpoints

### Инициализация платежа
```
POST /api/payments/freedompay/init
```

**Параметры**:
- `orderId` - ID заказа
- `amount` - Сумма платежа
- `description` - Описание платежа

**Ответ**:
```json
{
  "success": true,
  "paymentUrl": "https://freedompay.kz/payment/...",
  "paymentId": "12345",
  "message": "Платеж инициализирован успешно"
}
```

### Проверка статуса платежа
```
GET /api/payments/freedompay/status/:orderId
```

### Healthcheck
```
GET /api/payments/freedompay/health
```

## Процесс оплаты

### 1. Создание заказа
Пользователь заполняет форму заказа и нажимает "Оформить заказ"

### 2. Инициализация платежа
Система создает заказ в БД и инициализирует платеж через FreedomPay

### 3. Перенаправление на оплату
Пользователь перенаправляется на страницу оплаты FreedomPay

### 4. Обработка результата
FreedomPay отправляет webhook на RESULT URL с результатом платежа

### 5. Перенаправление пользователя
Пользователь перенаправляется на SUCCESS или FAILURE URL

## Безопасность

### Проверка подписи
Все входящие webhook'и проверяются на корректность подписи MD5

### Валидация данных
- Проверка существования заказа
- Проверка суммы платежа
- Проверка статуса заказа

### Логирование
Все операции с платежами логируются в таблицу `payment_logs`

## Мониторинг

### Healthcheck
Регулярно проверяйте доступность FreedomPay через endpoint:
```
GET /api/payments/freedompay/health
```

### Логи
Мониторьте логи сервера для отслеживания ошибок платежей

### База данных
Проверяйте таблицы `payment_transactions` и `payment_logs` для анализа платежей

## Тестирование

### Тестовый режим
Для тестирования установите переменную окружения:
```env
NODE_ENV=development
DEBUG_FREEDOMPAY=true
```

### Тестовые карты
FreedomPay предоставляет тестовые карты для разработки. Уточните их в документации FreedomPay.

## Устранение неполадок

### Частые ошибки

1. **INVALID_SIGNATURE** - Неверная подпись webhook'а
   - Проверьте правильность secret key
   - Убедитесь, что подпись формируется корректно

2. **ORDER_NOT_FOUND** - Заказ не найден
   - Проверьте существование заказа в БД
   - Убедитесь в правильности orderId

3. **AMOUNT_MISMATCH** - Несоответствие суммы
   - Проверьте сумму в заказе и платеже

### Логи
Все ошибки логируются с префиксом `❌ FreedomPay:`

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Проверьте статус FreedomPay через healthcheck
3. Обратитесь в поддержку FreedomPay
4. Проверьте настройки URL в панели FreedomPay

## Обновления

Для обновления интеграции:
1. Остановите сервер
2. Обновите файлы
3. Перезапустите сервер
4. Проверьте работоспособность через healthcheck
