# Mnogo Rolly - Ресторан Суши

Полнофункциональное веб-приложение для заказа суши с онлайн оплатой и мобильным приложением.

## 🍣 Особенности

- **Веб-сайт**: Полнофункциональный сайт с меню, корзиной и онлайн оплатой
- **Мобильное приложение**: React Native приложение с Expo
- **Админ панель**: Управление товарами, заказами и настройками
- **Онлайн оплата**: Поддержка множества банков (MBank, MegaPay, O! Деньги и др.)
- **Telegram бот**: Уведомления о новых заказах
- **QR-коды**: Генерация QR-кодов для быстрой оплаты

## 🚀 Технологии

### Frontend (Веб)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (управление состоянием)
- React Router
- Lucide React (иконки)

### Backend
- Node.js
- Express.js
- SQLite3
- JWT аутентификация
- Multer (загрузка файлов)
- Telegram Bot API

### Мобильное приложение
- React Native
- Expo
- React Navigation
- Zustand
- Axios

## 📦 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd mnogo-rolly
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Мобильное приложение
```bash
cd MnogoRollyExpo
npm install
npx expo start
```

## 🔧 Настройка

### Переменные окружения

Создайте файл `.env` в папке `backend`:

```env
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### База данных

База данных SQLite создается автоматически при первом запуске. Начальные данные загружаются из `backend/src/seed.ts`.

## 📱 Функции

### Для клиентов
- Просмотр меню с категориями
- Добавление товаров в корзину
- Оформление заказа с доставкой
- Онлайн оплата через QR-коды
- Отслеживание статуса заказа
- Регистрация и авторизация

### Для администраторов
- Управление товарами (CRUD)
- Управление заказами
- Просмотр статистики
- Настройка Telegram бота
- Загрузка изображений товаров

## 💳 Поддерживаемые банки

- MBank
- MegaPay
- O! Деньги
- Balance.kg
- Bakai24
- Demir Bank
- Optima Bank
- PayQR

## 🚀 Развертывание

### Netlify (Frontend)
1. Подключите репозиторий к Netlify
2. Укажите папку `frontend` как корневую
3. Команда сборки: `npm run build`
4. Папка для публикации: `dist`

### Vercel (Backend)
1. Подключите репозиторий к Vercel
2. Укажите папку `backend` как корневую
3. Команда сборки: `npm run build`
4. Команда запуска: `npm start`

## 📄 Лицензия

MIT License

## 👨‍💻 Автор

Разработано для ресторана "Mnogo Rolly"
