# Автоматический коммит всех изменений
Write-Host "🚀 Автоматический коммит изменений..." -ForegroundColor Green

# Добавляем все файлы
Write-Host "📁 Добавляем файлы в git..." -ForegroundColor Yellow
git add -A

# Проверяем статус
Write-Host "📊 Статус git:" -ForegroundColor Yellow
git status

# Коммитим изменения
Write-Host "💾 Создаем коммит..." -ForegroundColor Yellow
git commit -m "🎯 Полная система управления сменами

✅ Backend:
- Таблицы shifts и shift_details в базе данных
- API endpoints для управления сменами
- Автоматический подсчет заказов и выручки

✅ Frontend:
- Кнопки управления сменами в header админки
- Страница аналитики с управлением сменами
- Проверка статуса смены на checkout
- Блокировка заказов когда смена закрыта

✅ Функционал:
- Открытие/закрытие смен
- Статистика по заказам и выручке
- История смен
- Защита от заказов в нерабочее время"

# Пушим изменения
Write-Host "🚀 Пушим в GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Готово! Все изменения закоммичены и запушены." -ForegroundColor Green
