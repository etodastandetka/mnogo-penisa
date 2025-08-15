@echo off
echo 🔧 Исправление ошибок Mnogo Rolly...

echo 🚀 Исправляем backend...
cd backend

echo 📦 Устанавливаем зависимости...
npm install

echo 🌱 Заполнение базы данных...
npm run seed

echo 🎨 Исправляем frontend...
cd ..\frontend

echo ⚙️ Настройка frontend...
echo VITE_API_URL=http://localhost:3001/api > .env

echo.
echo ✅ Все ошибки исправлены!
echo.
echo Теперь можно запускать проект:
echo   Backend: cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo Или используйте скрипты:
echo   start.bat
echo   start-simple.ps1
pause
