# Настройка обычного сервера для Mnogo Rolly

## Установка необходимого ПО

### 1. Node.js и npm
Скачайте и установите Node.js с официального сайта: https://nodejs.org/

**Рекомендуемая версия**: Node.js 18.x или выше

**Проверка установки:**
```bash
node --version
npm --version
```

### 2. Git (если еще не установлен)
Скачайте с: https://git-scm.com/

**Проверка установки:**
```bash
git --version
```

## Подготовка проекта

### 1. Клонирование репозитория
```bash
git clone https://github.com/etodastandetka/testo.git
cd testo
```

### 2. Установка зависимостей

**Быстрая установка (рекомендуется):**
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

**Ручная установка:**
```bash
# Backend зависимости
cd backend
npm install

# Frontend зависимости
cd ../frontend
npm install
```

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

## Возможные проблемы и решения

### Ошибка "npm command not found"
**Решение**: Убедитесь, что Node.js установлен правильно. Перезапустите терминал после установки.

### Ошибка "EACCES: permission denied"
**Решение**: На Linux/Mac используйте `sudo npm install` или настройте npm для работы без sudo.

### Порт 3001 уже занят
**Решение**: Измените порт в `backend/api/index.ts` или остановите процесс, использующий порт 3001.

### Ошибка "Cannot find module"
**Решение**: Убедитесь, что выполнили `npm install` в папках `backend` и `frontend`.

### Проблемы с TypeScript
**Решение**: Установите TypeScript глобально: `npm install -g typescript`

## Системные требования

- **Node.js**: 18.x или выше
- **npm**: 8.x или выше
- **Операционная система**: Windows, macOS, Linux
- **Память**: минимум 2GB RAM
- **Место на диске**: минимум 500MB
