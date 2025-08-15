# 🚀 Быстрый старт Mnogo Rolly

## Для Windows

### Вариант 1: Простой запуск
```cmd
start.bat
```

### Вариант 2: PowerShell
```powershell
.\start-simple.ps1
```

### Вариант 3: Ручной запуск
```cmd
# Backend
cd backend
npm install
npm run seed
npm run dev

# Frontend (в новом терминале)
cd frontend
npm install
echo VITE_API_URL=http://localhost:3001/api > .env
npm run dev
```

## Для Linux/Mac

```bash
# Backend
cd backend
npm install
npm run seed
npm run dev

# Frontend (в новом терминале)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001/api" > .env
npm run dev
```

## 🔗 Доступные URL

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Админ-панель**: http://localhost:3000/admin/login

## 🔑 Тестовые данные

- **Email**: admin@mnogo-rolly.ru
- **Пароль**: admin123

## ❗ Если возникают ошибки

### Ошибка установки зависимостей
```cmd
cd backend
rmdir /s node_modules
del package-lock.json
npm install
```

### Ошибка WebSocket
1. Убедитесь, что порты 3000 и 3001 свободны
2. Перезапустите терминалы
3. Проверьте файрвол

### Ошибка импорта
1. Проверьте файл `frontend/src/api/client.ts`
2. Перезапустите dev сервер

## 🎯 Что включено

✅ **Backend**: Express API с SQLite  
✅ **Frontend**: React с админ-панелью  
✅ **Дизайн**: Японский стиль  
✅ **Аутентификация**: JWT токены  
✅ **API**: RESTful endpoints  
✅ **База данных**: Тестовые данные  

## 📱 Функции админ-панели

- 📊 Дашборд с статистикой
- 📦 Управление заказами
- 🍣 Управление товарами
- 👥 Управление клиентами
- 📈 Аналитика
- ⚙️ Настройки системы
