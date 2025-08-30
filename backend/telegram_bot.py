#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import telebot
import requests
import os
import json
from datetime import datetime
import threading
import time

# Конфигурация бота (захардкожено)
BOT_TOKEN = '8336008623:AAHWO3vRgVceBeJvjMVaPBdZMkNTBB-MHCc'
ADMIN_GROUP_ID = -1002728692510
WEBHOOK_URL = 'https://mnogo-rolly.online/telegram-webhook'

# Инициализация бота
bot = telebot.TeleBot(BOT_TOKEN)

# API конфигурация
API_BASE_URL = 'https://mnogo-rolly.online/api'
LOCAL_API_URL = 'http://127.0.0.1:3000/api'

# Токен админа (получите через get-admin-token.py)
ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjY3LCJlbWFpbCI6ImFkbWluQG1ub2dvLXJvbGx5LnJ1IiwiaWF0IjoxNzU2NTQ5NDc1LCJleHAiOjE3NTcxNTQyNzV9.6-bsKgZNwFFqzJAVIpNSmGtMt2hSpf2tx2TFejmcfXQ'

def init_database():
    """Инициализация базы данных"""
    print("🔧 Проверка подключения к API...")
    
    try:
        # Пробуем подключиться к API
        response = requests.get(f"{API_BASE_URL}/products", timeout=5)
        if response.status_code == 200:
            print(f"✅ API доступен: {API_BASE_URL}")
            return True
        else:
            print(f"⚠️ API недоступен (статус: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка подключения к API: {e}")
        return False

def get_status_emoji(status):
    """Получить эмодзи для статуса"""
    status_map = {
        'pending': '⏳',
        'confirmed': '✅',
        'preparing': '👨‍🍳',
        'ready': '🚚',
        'delivered': '🎉',
        'cancelled': '❌'
    }
    return status_map.get(status, '❓')

def get_status_text(status):
    """Получить текст статуса"""
    status_map = {
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Подтвержден',
        'preparing': 'Готовится',
        'ready': 'Готов к доставке',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    }
    return status_map.get(status, status)

@bot.message_handler(commands=['start'])
def start_command(message):
    """Обработка команды /start"""
    chat_id = message.chat.id
    user = message.from_user
    
    welcome_message = f"""
🍕 Добро пожаловать в бот заказов "Много Пениса"!

👋 Привет, {user.first_name}!

📋 Доступные команды:
/order <номер> - Информация о заказе
/help - Помощь

💡 Чтобы узнать статус заказа, напишите его номер или используйте команду /order <номер>
    """
    
    bot.send_message(chat_id, welcome_message.strip())
    print(f"👤 Пользователь {user.id} ({user.username}) начал работу с ботом")



@bot.message_handler(commands=['order'])
def order_detail_command(message):
    """Обработка команды /order <номер>"""
    chat_id = message.chat.id
    user_id = message.from_user.id
    
    # Извлекаем номер заказа из команды
    command_parts = message.text.split()
    if len(command_parts) != 2:
        bot.send_message(chat_id, 'Использование: /order <номер>\nПример: /order 123')
        return
    
    try:
        order_id = int(command_parts[1])
    except ValueError:
        bot.send_message(chat_id, 'Номер заказа должен быть числом')
        return
    
    try:
        # Получаем детали заказа через API с токеном админа
        headers = {
            'Authorization': f'Bearer {ADMIN_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        print(f"🔍 Запрос к API: {API_BASE_URL}/admin/orders/{order_id}")
        response = requests.get(f"{API_BASE_URL}/admin/orders/{order_id}", headers=headers, timeout=10)
        
        print(f"📡 Ответ API: статус {response.status_code}")
        print(f"📄 Тело ответа: {response.text[:200]}...")
        
        if response.status_code == 200:
            order = response.json()
            
            # Формируем сообщение с деталями заказа
            status_emoji = get_status_emoji(order.get('status', 'pending'))
            status_text = get_status_text(order.get('status', 'pending'))
            
            # Форматируем дату
            try:
                created_at = order.get('created_at', '')
                date = datetime.fromisoformat(created_at.replace('Z', '+00:00')).strftime('%d.%m.%Y %H:%M')
            except:
                date = 'Дата не указана'
            
            message_text = f"{status_emoji} Заказ #{order.get('id', 'N/A')}\n\n"
            message_text += f"📅 Дата: {date}\n"
            message_text += f"💰 Сумма: {order.get('total_amount', 0)} ₽\n"
            message_text += f"📍 Адрес: {order.get('delivery_address', 'Не указан')}\n"
            message_text += f"📱 Телефон: {order.get('customer_phone', 'Не указан')}\n"
            message_text += f"📊 Статус: {status_text}\n\n"
            
            # Добавляем товары если есть
            items = order.get('items', [])
            if items:
                message_text += "🛒 Товары:\n"
                for item in items:
                    if isinstance(item, dict):
                        message_text += f"• {item.get('quantity', 1)}x {item.get('name', 'Товар')} - {item.get('price', 0)} ₽\n"
                    else:
                        message_text += f"• {item}\n"
                message_text += "\n"
            
            message_text += f"📝 Комментарий: {order.get('notes', 'Нет комментария')}"
            
            bot.send_message(chat_id, message_text)
            
        elif response.status_code == 404:
            bot.send_message(chat_id, 'Заказ не найден.')
        else:
            bot.send_message(chat_id, f'❌ Ошибка получения заказа (статус: {response.status_code})')
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка при получении заказа: {e}")
        bot.send_message(chat_id, 'Произошла ошибка при получении заказа. Попробуйте позже.')
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        bot.send_message(chat_id, 'Произошла неожиданная ошибка.')

@bot.message_handler(commands=['help'])
def help_command(message):
    """Обработка команды /help"""
    chat_id = message.chat.id
    
    help_text = """
🔧 Помощь по боту

📋 Основные команды:
/start - Начать работу с ботом
/order <номер> - Информация о заказе
/help - Показать эту справку
/test - Тест уведомления в админ-группу

💡 Примеры использования:
• /order 123 - посмотреть заказ №123
• /test - проверить уведомления

🌐 Сайт: https://mnogo-rolly.online
📞 Поддержка: @admin_username
    """
    
    bot.send_message(chat_id, help_text.strip())

@bot.message_handler(commands=['test'])
def test_command(message):
    """Тестовая команда для проверки уведомлений"""
    chat_id = message.chat.id
    
    # Тестовые данные заказа (как в реальном заказе)
    test_order = {
        'order_number': 'MR-1755448995603-999',
        'customer_name': 'Тестовый клиент',
        'customer_phone': '+996700123456',
        'delivery_address': 'Тестовый адрес, Бишкек',
        'total_amount': 2500,
        'items': [
            {'name': 'Ролл Калифорния', 'quantity': 2, 'price': 800},
            {'name': 'Ролл Филадельфия', 'quantity': 1, 'price': 900}
        ]
    }
    
    try:
        # Отправляем тестовое уведомление в админ-группу
        notify_admins_new_order(test_order)
        bot.send_message(chat_id, "✅ Тестовое уведомление отправлено в админ-группу!")
    except Exception as e:
        bot.send_message(chat_id, f"❌ Ошибка отправки теста: {e}")
        print(f"❌ Ошибка тестовой команды: {e}")





@bot.message_handler(func=lambda message: True)
def handle_text_message(message):
    """Обработка текстовых сообщений (номер заказа)"""
    chat_id = message.chat.id
    user_id = message.from_user.id
    text = message.text.strip()
    
    # Проверяем, является ли сообщение номером заказа
    if text.isdigit():
        order_id = int(text)
        
        try:
            # Получаем детали заказа через API с токеном админа
            headers = {
                'Authorization': f'Bearer {ADMIN_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(f"{API_BASE_URL}/admin/orders/{order_id}", headers=headers, timeout=10)
            
            if response.status_code == 200:
                order = response.json()
                
                # Формируем сообщение с деталями заказа
                status_emoji = get_status_emoji(order.get('status', 'pending'))
                status_text = get_status_text(order.get('status', 'pending'))
                
                # Форматируем дату
                try:
                    created_at = order.get('created_at', '')
                    date = datetime.fromisoformat(created_at.replace('Z', '+00:00')).strftime('%d.%m.%Y %H:%M')
                except:
                    date = 'Дата не указана'
                
                message_text = f"{status_emoji} Заказ #{order.get('id', 'N/A')}\n\n"
                message_text += f"📅 Дата: {date}\n"
                message_text += f"💰 Сумма: {order.get('total_amount', 0)} сом\n"
                message_text += f"📍 Адрес: {order.get('delivery_address', 'Не указан')}\n"
                message_text += f"📱 Телефон: {order.get('customer_phone', 'Не указан')}\n"
                message_text += f"📊 Статус: {status_text}\n\n"
                
                # Добавляем товары если есть
                items = order.get('items', [])
                if items:
                    message_text += "🛒 Товары:\n"
                    for item in items:
                        if isinstance(item, dict):
                            message_text += f"• {item.get('quantity', 1)}x {item.get('name', 'Товар')} - {item.get('price', 0)} сом\n"
                        else:
                            message_text += f"• {item}\n"
                    message_text += "\n"
                
                message_text += f"📝 Комментарий: {order.get('notes', 'Нет комментария')}"
                
                bot.send_message(chat_id, message_text)
                
            elif response.status_code == 404:
                bot.send_message(chat_id, 'Заказ не найден.')
            else:
                bot.send_message(chat_id, f'❌ Ошибка получения заказа (статус: {response.status_code})')
                
        except Exception as e:
            print(f"❌ Ошибка при получении заказа: {e}")
            bot.send_message(chat_id, 'Произошла ошибка при получении заказа.')
    else:
        bot.send_message(chat_id, 'Отправьте номер заказа или используйте команду /help для справки.')

def notify_admins_new_order(order_data):
    """Уведомление админов о новом заказе"""
    try:
        print(f"🤖 Попытка отправить уведомление о заказе: {order_data}")
        
        # Формируем список товаров
        items_text = ""
        if 'items' in order_data and order_data['items']:
            for item in order_data['items']:
                if isinstance(item, dict):
                    name = item.get('name', 'Товар')
                    quantity = item.get('quantity', 1)
                    price = item.get('price', 0)
                    items_text += f"• {name} x{quantity} - {price} сом\n"
                else:
                    items_text += f"• {item}\n"
        else:
            items_text = "Товары не указаны"
        
        # Получаем текущее время в Бишкеке (UTC+6)
        from datetime import timezone, timedelta
        bishkek_tz = timezone(timedelta(hours=6))
        current_time = datetime.now(bishkek_tz).strftime('%d.%m.%Y, %H:%M')
        
        message = f"""
🆕 Новый заказ!

📋 Заказ #{order_data.get('id', 'N/A')}
👤 Клиент: {order_data.get('customer_name', 'Не указан')}
📞 Телефон: {order_data.get('customer_phone', 'Не указан')}
📍 Адрес: {order_data.get('delivery_address', 'Не указан')}
💰 Сумма: {order_data.get('total_amount', 0)} сом
⏳ Статус: Ожидает оплаты

🛒 Товары:
{items_text}

⏰ Время заказа: {current_time} время бишкек
        """
        
        bot.send_message(ADMIN_GROUP_ID, message.strip())
        print(f"✅ Уведомление о заказе #{order_data.get('id', 'N/A')} отправлено в админ-группу")
        
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления админам: {e}")
        import traceback
        traceback.print_exc()

def notify_new_order_webhook():
    """Webhook для мгновенного уведомления о новом заказе"""
    print("🔗 Webhook для новых заказов готов")

# Добавляем HTTP endpoint для получения уведомлений
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/telegram-webhook/new-order', methods=['POST'])
def new_order_webhook():
    """Endpoint для получения уведомлений о новых заказах"""
    try:
        order_data = request.json
        
        if order_data:
            print(f"🆕 Получен новый заказ через webhook: {order_data}")
            
            # Отправляем уведомление в группу
            notify_admins_new_order(order_data)
            
            return jsonify({"status": "success", "message": "Уведомление отправлено"}), 200
        else:
            return jsonify({"status": "error", "message": "Данные заказа не получены"}), 400
            
    except Exception as e:
        print(f"❌ Ошибка webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def start_webhook_server():
    """Запуск webhook сервера"""
    try:
        app.run(host='0.0.0.0', port=5001, debug=False)
    except Exception as e:
        print(f"❌ Ошибка запуска webhook сервера: {e}")



def start_bot():
    """Запуск бота"""
    print("🤖 Запуск Telegram бота...")
    
    # Инициализируем базу данных
    init_database()
    
    # Запускаем webhook сервер в отдельном потоке
    webhook_thread = threading.Thread(target=start_webhook_server, daemon=True)
    webhook_thread.start()
    print("🔗 Webhook сервер запущен на порту 5001")
    
    # Устанавливаем webhook в production
    if os.getenv('NODE_ENV') == 'production':
        try:
            bot.set_webhook(url=WEBHOOK_URL)
            print(f"✅ Webhook установлен: {WEBHOOK_URL}")
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
    else:
        print("🔄 Режим разработки: webhook не устанавливается")
    
    print("✅ Бот готов к работе!")
    print("💡 Для остановки нажмите Ctrl+C")
    
    # Запускаем бота
    try:
        bot.polling(none_stop=True, interval=0)
    except KeyboardInterrupt:
        print("\n🛑 Бот остановлен")
    except Exception as e:
        print(f"❌ Ошибка бота: {e}")

if __name__ == "__main__":
    start_bot()
