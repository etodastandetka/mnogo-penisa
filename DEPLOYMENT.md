# 🚀 Инструкция по развертыванию Mnogo Rolly

## 📋 Обзор

Этот проект состоит из трех частей:
1. **Frontend** (React) - развертывается на Netlify
2. **Backend** (Node.js) - развертывается на Vercel
3. **Мобильное приложение** (React Native) - собирается локально

## 🌐 Frontend (Netlify)

### 1. Подготовка
Убедитесь, что проект загружен на GitHub.

### 2. Развертывание на Netlify
1. Перейдите на [netlify.com](https://netlify.com)
2. Нажмите "New site from Git"
3. Выберите GitHub и ваш репозиторий
4. Настройте параметры:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 3. Переменные окружения
В настройках Netlify добавьте:
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

## 🔧 Backend (Vercel)

### 1. Подготовка
1. Установите Vercel CLI: `npm i -g vercel`
2. Перейдите в папку `backend`

### 2. Развертывание на Vercel
```bash
cd backend
vercel
```

### 3. Переменные окружения
В настройках Vercel добавьте:
```
JWT_SECRET=your_super_secret_jwt_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
CORS_ORIGIN=https://your-frontend-url.netlify.app
```

### 4. Альтернативные платформы для Backend

#### Railway
1. Подключите GitHub репозиторий
2. Укажите папку `backend`
3. Добавьте переменные окружения

#### Render
1. Создайте новый Web Service
2. Подключите GitHub репозиторий
3. Укажите папку `backend`
4. Команда запуска: `npm start`

#### Heroku
1. Создайте приложение
2. Подключите GitHub репозиторий
3. Укажите папку `backend`
4. Добавьте переменные окружения

## 📱 Мобильное приложение

### Сборка APK
```bash
cd MnogoRollyExpo
npx expo build:android
```

### Сборка iOS
```bash
cd MnogoRollyExpo
npx expo build:ios
```

## 🔗 Настройка связей

### 1. Обновите URL в Frontend
После развертывания backend, обновите `VITE_API_URL` в Netlify.

### 2. Обновите URL в Mobile App
В файле `MnogoRollyExpo/src/utils/api.ts` обновите базовый URL.

### 3. Проверьте CORS
Убедитесь, что в backend настроен CORS для вашего frontend домена.

## 🧪 Тестирование

### 1. Frontend
- Откройте сайт на Netlify
- Проверьте загрузку продуктов
- Попробуйте создать заказ

### 2. Backend
- Проверьте health endpoint: `https://your-backend.vercel.app/api/health`
- Протестируйте API через Postman

### 3. Mobile App
- Запустите на эмуляторе или устройстве
- Проверьте все функции

## 🔧 Устранение неполадок

### Frontend не загружается
- Проверьте переменные окружения
- Убедитесь, что build проходит успешно

### Backend не отвечает
- Проверьте логи в Vercel
- Убедитесь, что переменные окружения настроены

### CORS ошибки
- Проверьте настройки CORS в backend
- Убедитесь, что домен frontend добавлен в CORS_ORIGIN

## 📊 Мониторинг

### Netlify
- Аналитика трафика
- Логи ошибок
- Статус деплоя

### Vercel
- Логи функций
- Аналитика производительности
- Статус деплоя

## 🔄 Обновления

### Автоматические деплои
При push в GitHub:
- Frontend автоматически обновится на Netlify
- Backend автоматически обновится на Vercel

### Ручные обновления
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
vercel --prod
```

## 💰 Стоимость

### Бесплатные планы
- **Netlify**: 100GB трафика/месяц
- **Vercel**: 100GB трафика/месяц
- **Railway**: $5 кредитов/месяц
- **Render**: 750 часов/месяц

### Платные планы
- **Netlify Pro**: $19/месяц
- **Vercel Pro**: $20/месяц
- **Railway**: $5/месяц
- **Render**: $7/месяц

## 🛡️ Безопасность

### Рекомендации
1. Используйте сильные JWT секреты
2. Настройте HTTPS везде
3. Ограничьте CORS только нужными доменами
4. Регулярно обновляйте зависимости

### Переменные окружения
Никогда не коммитьте секреты в Git. Используйте переменные окружения платформ.
