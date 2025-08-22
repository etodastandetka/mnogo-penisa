@echo off
echo 🚀 Автоматический коммит изменений...

echo 📁 Добавляем файлы в git...
git add -A

echo 📊 Статус git:
git status

echo 💾 Создаем коммит...
git commit -m "🎯 Полная система управления сменами - Backend: таблицы shifts, API endpoints - Frontend: кнопки управления сменами, страница аналитики, проверка статуса на checkout - Функционал: открытие/закрытие смен, статистика, история, защита от заказов"

echo 🚀 Пушим в GitHub...
git push origin main

echo ✅ Готово! Все изменения закоммичены и запушены.
pause
