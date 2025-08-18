#!/bin/bash

echo "========================================"
echo "   Mnogo Rolly - Установка проекта"
echo "========================================"
echo

echo "Проверяем Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Скачайте и установите Node.js с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js найден"
node --version

echo
echo "Проверяем npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден!"
    exit 1
fi

echo "✅ npm найден"
npm --version

echo
echo "========================================"
echo "Устанавливаем зависимости Backend..."
echo "========================================"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Backend"
    exit 1
fi

echo
echo "========================================"
echo "Устанавливаем зависимости Frontend..."
echo "========================================"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей Frontend"
    exit 1
fi

echo
echo "========================================"
echo "✅ Установка завершена успешно!"
echo "========================================"
echo
echo "Для запуска сервера выполните:"
echo "  cd backend"
echo "  npm run server"
echo
echo "Для запуска frontend выполните:"
echo "  cd frontend"
echo "  npm run dev"
echo
