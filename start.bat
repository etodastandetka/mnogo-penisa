@echo off
echo 🍣 Запуск Mnogo Rolly...

REM Проверяем Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден! Установите Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js найден

REM Запускаем backend
echo 🚀 Запуск backend...
cd backend

REM Устанавливаем зависимости если нужно
if not exist "node_modules" (
    echo 📦 Установка зависимостей backend...
    npm install
)

REM Запускаем seed
echo 🌱 Заполнение базы данных...
npm run seed

REM Запускаем backend в новом окне
echo 🔄 Запуск backend сервера...
start "Backend" cmd /k "npm run dev"

REM Ждем 3 секунды
timeout /t 3 /nobreak >nul

REM Запускаем frontend
echo 🎨 Запуск frontend...
cd ..\frontend

REM Устанавливаем зависимости если нужно
if not exist "node_modules" (
    echo 📦 Установка зависимостей frontend...
    npm install
)

REM Создаем .env для frontend
echo ⚙️ Настройка frontend...
echo VITE_API_URL=http://localhost:3001/api > .env

REM Запускаем frontend в новом окне
echo 🔄 Запуск frontend сервера...
start "Frontend" cmd /k "npm run dev"

echo.
echo 🎉 Mnogo Rolly запущен!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo 🎯 Простой Express сервер
echo 👤 Админ-панель: http://localhost:3000/admin/login
echo.
echo 🔑 Тестовые данные:
echo    Email: admin@mnogo-rolly.ru
echo    Пароль: admin123
echo.
echo Для остановки закройте окна терминалов
pause
