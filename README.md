# Mnogo Rolly - Система доставки еды

## 🚀 Деплой проекта

### Frontend (Netlify/Vercel)

1. **Подготовка к деплою:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Деплой на Netlify:**
   - Загрузите папку `dist` в Netlify
   - Или подключите GitHub репозиторий
   - Netlify автоматически выполнит `npm run build`

3. **Деплой на Vercel:**
   - Подключите GitHub репозиторий к Vercel
   - Vercel автоматически выполнит `npm run build`

### Backend (Vercel)

1. **Подготовка:**
   ```bash
   cd backend
   npm install
   ```

2. **Деплой на Vercel:**
   - Подключите папку `backend` к Vercel
   - Установите переменные окружения в Vercel

## 🔧 Переменные окружения

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Vercel)
```
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## 📱 Мобильная версия

Сайт уже адаптирован для мобильных устройств:
- Responsive grid для банковских кнопок
- Адаптивные карточки и формы
- Мобильное меню навигации

## 🗑️ Очистка данных

### Удаление всех товаров:
```bash
DELETE /api/admin/clear-all-products
```

### Удаление всех заказов:
```bash
DELETE /api/admin/clear-test-data
```

## 🏗️ Структура проекта

```
├── frontend/          # React + Vite приложение
│   ├── dist/         # Сборка для продакшена
│   ├── netlify.toml  # Конфигурация Netlify
│   └── vercel.json   # Конфигурация Vercel
├── backend/           # Node.js + Express API
└── README.md         # Этот файл
```

## 🚀 Команды для деплоя

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run dev  # для разработки
```

## 📋 Чек-лист перед деплоем

- [ ] Убрать отладочные логи
- [ ] Проверить мобильную версию
- [ ] Обновить API URL в production
- [ ] Выполнить `npm run build`
- [ ] Проверить папку `dist`
- [ ] Загрузить на хостинг
