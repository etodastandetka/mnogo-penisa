@echo off
echo ========================================
echo    Mnogo Rolly - Установка проекта
echo ========================================
echo.

echo Проверяем Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js найден
node --version

echo.
echo Проверяем npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не найден!
    pause
    exit /b 1
)

echo ✅ npm найден
npm --version

echo.
echo ========================================
echo Устанавливаем зависимости Backend...
echo ========================================
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей Backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Устанавливаем зависимости Frontend...
echo ========================================
cd ../frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей Frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Установка завершена успешно!
echo ========================================
echo.
echo Для запуска сервера выполните:
echo   cd backend
echo   npm run server
echo.
echo Для запуска frontend выполните:
echo   cd frontend
echo   npm run dev
echo.
pause
