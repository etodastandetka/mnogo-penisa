#!/bin/bash

echo "🐍 Настройка Python Telegram бота..."

# Проверяем Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен. Устанавливаем..."
    apt update
    apt install -y python3 python3-pip python3-venv
fi

echo "✅ Python3 найден: $(python3 --version)"

# Создаем виртуальное окружение
echo "📦 Создание виртуального окружения..."
python3 -m venv venv

# Активируем виртуальное окружение
echo "🔧 Активация виртуального окружения..."
source venv/bin/activate

# Обновляем pip
echo "⬆️ Обновление pip..."
pip install --upgrade pip

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
pip install pyTelegramBotAPI python-dotenv

echo "✅ Зависимости установлены!"

# Создаем скрипт запуска
echo "🚀 Создание скрипта запуска..."
cat > run-bot.sh << 'EOF'
#!/bin/bash
cd /var/www/mnogo-penisa/backend
source venv/bin/activate
python3 telegram_bot.py
EOF

chmod +x run-bot.sh

echo "✅ Настройка завершена!"
echo ""
echo "🚀 Для запуска бота используйте:"
echo "   ./run-bot.sh"
echo ""
echo "💡 Или вручную:"
echo "   source venv/bin/activate"
echo "   python3 telegram_bot.py"
