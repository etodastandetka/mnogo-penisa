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
    
    # Сохраняем пользователя в БД
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR IGNORE INTO telegram_users (telegram_id, username, first_name, last_name)
        VALUES (?, ?, ?, ?)
    ''', (user.id, user.username, user.first_name, user.last_name))
    
    conn.commit()
    conn.close()
    
    welcome_message = f"""
🍕 Добро пожаловать в бот заказов "Много Пениса"!

👋 Привет, {user.first_name}!

📋 Доступные команды:
/orders - Посмотреть мои заказы
/order <номер> - Информация о заказе
/help - Помощь

💡 Чтобы узнать статус заказа, напишите его номер или используйте команду /order <номер>
    """
    
    bot.send_message(chat_id, welcome_message.strip())
    print(f"👤 Пользователь {user.id} ({user.username}) начал работу с ботом")

@bot.message_handler(commands=['orders'])
def orders_command(message):
    """Обработка команды /orders"""
    chat_id = message.chat.id
    user_id = message.from_user.id
    
    try:
        # Получаем заказы через API
        response = requests.get(f"{API_BASE_URL}/orders", timeout=10)
        
        if response.status_code == 200:
            orders = response.json()
            
            if not orders or len(orders) == 0:
                bot.send_message(chat_id, 'У вас пока нет заказов. Сделайте первый заказ на сайте! 🛒')
                return
            
            message_text = '📋 Ваши последние заказы:\n\n'
            
            # Показываем последние 5 заказов
            for order in orders[:5]:
                order_id = order.get('id', 'N/A')
                status = order.get('status', 'pending')
                total_amount = order.get('total_amount', 0)
                created_at = order.get('created_at', '')
                delivery_address = order.get('delivery_address', 'Не указан')
                
                status_emoji = get_status_emoji(status)
                status_text = get_status_text(status)
                
                # Форматируем дату
                try:
                    date = datetime.fromisoformat(created_at.replace('Z', '+00:00')).strftime('%d.%m.%Y')
                except:
                    date = 'Дата не указана'
                
                message_text += f"{status_emoji} Заказ #{order_id}\n"
                message_text += f"💰 Сумма: {total_amount} ₽\n"
                message_text += f"📅 Дата: {date}\n"
                message_text += f"📍 Адрес: {delivery_address}\n"
                message_text += f"📊 Статус: {status_text}\n\n"
            
            message_text += '💡 Для детальной информации используйте: /order <номер>'
            bot.send_message(chat_id, message_text)
            
        else:
            bot.send_message(chat_id, f'❌ Ошибка получения заказов (статус: {response.status_code})')
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка при получении заказов: {e}")
        bot.send_message(chat_id, 'Произошла ошибка при получении заказов. Попробуйте позже.')
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        bot.send_message(chat_id, 'Произошла неожиданная ошибка.')

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
        # Получаем детали заказа через API
        response = requests.get(f"{API_BASE_URL}/orders/{order_id}", timeout=10)
        
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
/orders - Посмотреть мои заказы
/order <номер> - Информация о заказе
/help - Показать эту справку
/test - Тест уведомления в админ-группу

💡 Примеры использования:
• /order 123 - посмотреть заказ №123
• /orders - список всех заказов

🌐 Сайт: https://mnogo-rolly.online
📞 Поддержка: @admin_username
    """
    
    bot.send_message(chat_id, help_text.strip())

@bot.message_handler(commands=['test'])
def test_command(message):
    """Тестовая команда для проверки уведомлений"""
    chat_id = message.chat.id
    
    # Тестовые данные заказа
    test_order = {
        'order_number': 'TEST-123',
        'customer_name': 'Тестовый клиент',
        'customer_phone': '+79001234567',
        'delivery_address': 'Тестовый адрес',
        'total_amount': 1500,
        'notes': 'Тестовый заказ',
        'items': [
            {'name': 'Тестовый ролл', 'quantity': 2, 'price': 750}
        ]
    }
    
    try:
        # Отправляем тестовое уведомление в админ-группу
        notify_admins_new_order(test_order)
        bot.send_message(chat_id, "✅ Тестовое уведомление отправлено в админ-группу!")
    except Exception as e:
        bot.send_message(chat_id, f"❌ Ошибка отправки теста: {e}")
        print(f"❌ Ошибка тестовой команды: {e}")

@bot.message_handler(commands=['dbinfo'])
def dbinfo_command(message):
    """Информация о базе данных"""
    chat_id = message.chat.id
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Получаем список таблиц
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        # Получаем количество записей в каждой таблице
        table_info = []
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            table_info.append(f"• {table_name}: {count} записей")
        
        # Получаем информацию о пользователе
        user_id = message.from_user.id
        cursor.execute("SELECT COUNT(*) FROM telegram_users WHERE telegram_id = ?", (user_id,))
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM telegram_orders WHERE telegram_id = ?", (user_id,))
        orders_count = cursor.fetchone()[0]
        
        message_text = f"""
🗄️ Информация о базе данных:

📋 Таблицы:
{chr(10).join(table_info)}

👤 Ваши данные:
• Зарегистрирован: {'Да' if user_count > 0 else 'Нет'}
• Связанных заказов: {orders_count}

💡 Используйте /test для проверки уведомлений
        """
        
        bot.send_message(chat_id, message_text.strip())
        conn.close()
        
    except Exception as e:
        bot.send_message(chat_id, f"❌ Ошибка получения информации о БД: {e}")
        print(f"❌ Ошибка команды dbinfo: {e}")

@bot.message_handler(func=lambda message: True)
def handle_text_message(message):
    """Обработка текстовых сообщений (номер заказа)"""
    chat_id = message.chat.id
    user_id = message.from_user.id
    text = message.text.strip()
    
    # Проверяем, является ли сообщение номером заказа
    if text.isdigit():
        order_id = int(text)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        try:
            # Получаем детали заказа
            cursor.execute('''
                SELECT o.*, GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                JOIN telegram_orders t_orders ON o.id = t_orders.order_id
                WHERE o.id = ? AND t_orders.telegram_id = ?
                GROUP BY o.id
            ''', (order_id, user_id))
            
            order = cursor.fetchone()
            
            if not order:
                bot.send_message(chat_id, 'Заказ не найден или у вас нет к нему доступа.')
                return
            
            # Формируем сообщение с деталями заказа
            status_emoji = get_status_emoji(order[6])  # status
            status_text = get_status_text(order[6])
            date = datetime.fromisoformat(order[8]).strftime('%d.%m.%Y %H:%M')  # created_at
            
            message_text = f"{status_emoji} Заказ #{order[0]}\n\n"
            message_text += f"📅 Дата: {date}\n"
            message_text += f"💰 Сумма: {order[5]} ₽\n"  # total_amount
            message_text += f"📍 Адрес: {order[4] or 'Не указан'}\n"  # delivery_address
            message_text += f"📱 Телефон: {order[3] or 'Не указан'}\n"  # customer_phone
            message_text += f"📊 Статус: {status_text}\n\n"
            
            if order[-1]:  # items
                message_text += f"🛒 Товары:\n{order[-1]}\n\n"
            
            message_text += f"📝 Комментарий: {order[7] or 'Нет комментария'}"  # notes
            
            bot.send_message(chat_id, message_text)
            
        except Exception as e:
            print(f"❌ Ошибка при получении заказа: {e}")
            bot.send_message(chat_id, 'Произошла ошибка при получении заказа.')
        
        finally:
            conn.close()
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
                    items_text += f"• {item.get('quantity', 1)}x {item.get('name', 'Товар')} - {item.get('price', 0)} ₽\n"
                else:
                    items_text += f"• {item}\n"
        else:
            items_text = "Товары не указаны"
        
        message = f"""
🆕 Новый заказ #{order_data.get('order_number', 'N/A')}!

👤 Клиент: {order_data.get('customer_name', 'Не указан')}
📱 Телефон: {order_data.get('customer_phone', 'Не указан')}
📍 Адрес: {order_data.get('delivery_address', 'Не указан')}
💰 Сумма: {order_data.get('total_amount', 0)} ₽
📝 Комментарий: {order_data.get('notes', 'Нет')}

🛒 Товары:
{items_text}

⏰ Время: {datetime.now().strftime('%d.%m.%Y %H:%M')}
        """
        
        bot.send_message(ADMIN_GROUP_ID, message.strip())
        print(f"✅ Уведомление о заказе #{order_data.get('order_number', 'N/A')} отправлено в админ-группу")
        
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления админам: {e}")
        import traceback
        traceback.print_exc()

def notify_client_status_change(order_id, new_status, client_telegram_id):
    """Уведомление клиента об изменении статуса заказа"""
    try:
        status_emoji = get_status_emoji(new_status)
        status_text = get_status_text(new_status)
        
        message = f"""
{status_emoji} Статус заказа #{order_id} изменен!

📊 Новый статус: {status_text}

🔄 Для обновления информации используйте: /order {order_id}
        """
        
        bot.send_message(client_telegram_id, message.strip())
        print(f"✅ Уведомление об изменении статуса заказа #{order_id} отправлено клиенту {client_telegram_id}")
        
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления клиенту: {e}")

def link_order_with_telegram_user(order_id, phone):
    """Связывание заказа с пользователем Telegram по телефону"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Ищем пользователя по телефону
        cursor.execute('SELECT telegram_id FROM telegram_users WHERE phone = ?', (phone,))
        user = cursor.fetchone()
        
        if user:
            telegram_id = user[0]
            
            # Связываем заказ с пользователем
            cursor.execute('''
                INSERT OR IGNORE INTO telegram_orders (telegram_id, order_id)
                VALUES (?, ?)
            ''', (telegram_id, order_id))
            
            conn.commit()
            print(f"✅ Заказ {order_id} связан с пользователем Telegram {telegram_id}")
            
            # Уведомляем клиента о новом заказе
            notify_client_status_change(order_id, 'pending', telegram_id)
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Ошибка связывания заказа: {e}")

def start_bot():
    """Запуск бота"""
    print("🤖 Запуск Telegram бота...")
    
    # Инициализируем базу данных
    init_database()
    
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
