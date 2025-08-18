# Настройка обычного сервера для Mnogo Rolly

## Запуск сервера

### 1. Backend (API сервер)
```bash
cd backend
npm install
npm run server
```

Сервер запустится на порту 3001: `http://localhost:3001`

### 2. Frontend (React приложение)
```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на порту 5173: `http://localhost:5173`

## Структура проекта

### Backend
- **Порт**: 3001
- **База данных**: SQLite (`./data/mnogo_rolly.db`)
- **Файлы**: Сохраняются в папку `./uploads/`
- **API**: `http://localhost:3001/api/*`

### Frontend
- **Порт**: 5173 (Vite dev server)
- **API URL**: `http://localhost:3001/api`
- **Сборка**: `npm run build`

## Деплой на Netlify

### 1. Соберите frontend
```bash
cd frontend
npm run build
```

### 2. Загрузите на Netlify
- Загрузите папку `frontend/dist` на Netlify
- Или подключите GitHub репозиторий

### 3. Настройте переменные окружения
В Netlify добавьте переменную:
```
VITE_API_URL=http://your-server-ip:3001/api
```

## Команды для запуска

### Разработка
```bash
# Backend
cd backend && npm run server

# Frontend (в другом терминале)
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && npm run start

# Frontend
cd frontend && npm run build
```

## Доступ к API

- **Health check**: `GET http://localhost:3001/api/health`
- **Продукты**: `GET http://localhost:3001/api/products`
- **Заказы**: `POST http://localhost:3001/api/orders`
- **Файлы**: `GET http://localhost:3001/uploads/filename.jpg`
