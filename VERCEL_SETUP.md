# Настройка Vercel для Mnogo Rolly

## Проблема
Vercel не может создать папку `./data` для базы данных, так как файловая система доступна только для чтения.

## Решение

### 1. Backend (API)
- **База данных**: Используется in-memory SQLite на Vercel, файловая SQLite для локальной разработки
- **Файлы**: Сохраняются в `/tmp` на Vercel, в папку `uploads` для локальной разработки
- **URL файлов**: Адаптированы для работы с Vercel API endpoints

### 2. Frontend
- **API URL**: Настроен для работы с Vercel backend
- **Переменные окружения**: Обновлены для production

## Деплой

### Backend
1. Подключите репозиторий к Vercel
2. Установите переменные окружения:
   - `JWT_SECRET` - секретный ключ для JWT
   - `CORS_ORIGIN` - домен frontend (опционально)

### Frontend
1. Обновите `env.production` с правильным URL backend:
   ```
   VITE_API_URL=https://your-backend-vercel-url.vercel.app/api
   ```

2. Обновите `vercel.json` с правильным URL backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-backend-vercel-url.vercel.app/api/$1"
       }
     ]
   }
   ```

## Ограничения Vercel
- **In-memory база данных**: Данные не сохраняются между деплоями
- **Временные файлы**: Файлы в `/tmp` удаляются после запроса
- **Рекомендация**: Используйте внешнюю базу данных (PostgreSQL, MySQL) и облачное хранилище (AWS S3, Cloudinary) для production

## Альтернативы для Production
1. **База данных**: PostgreSQL на Railway/Heroku/AWS
2. **Файлы**: AWS S3, Cloudinary, или Firebase Storage
3. **Хостинг**: Railway, Heroku, или AWS для полноценного backend
