#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import telebot
import sqlite3
import os
import json
from datetime import datetime
import threading
import time

# Конфигурация бота (захардкожено)
BOT_TOKEN = '8336008623:AAHWO3vRgVceBeJvjMVaPBdZMkNTBB-MHCc'
ADMIN_GROUP_ID = -1002728692510
WEBHOOK_URL = 'https://mnogo-rolly.kg/telegram-webhook'

# Инициализация бота
bot = telebot.TeleBot(BOT_TOKEN)

# Путь к базе данных
DB_PATH = 'database.sqlite'

def init_database():
    """Инициализация базы данных"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Создаем таблицу пользователей Telegram
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telegram_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Создаем таблицу связи заказов с пользователями
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telegram_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (telegram_id) REFERENCES telegram_users (telegram_id),
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ База данных инициализирована")

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
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Получаем заказы пользователя
        cursor.execute('''
            SELECT o.id, o.status, o.total_amount, o.created_at, o.delivery_address
            FROM orders o
            JOIN telegram_orders to ON o.id = to.order_id
            WHERE to.telegram_id = ?
            ORDER BY o.created_at DESC
            LIMIT 10
        ''', (user_id,))
        
        orders = cursor.fetchall()
        
        if not orders:
            bot.send_message(chat_id, 'У вас пока нет заказов. Сделайте первый заказ на сайте! 🛒')
            return
        
        message_text = '📋 Ваши последние заказы:\n\n'
        
        for order in orders:
            order_id, status, total_amount, created_at, delivery_address = order
            status_emoji = get_status_emoji(status)
            status_text = get_status_text(status)
            date = datetime.fromisoformat(created_at).strftime('%d.%m.%Y')
            
            message_text += f"{status_emoji} Заказ #{order_id}\n"
            message_text += f"💰 Сумма: {total_amount} ₽\n"
            message_text += f"📅 Дата: {date}\n"
            message_text += f"📍 Адрес: {delivery_address or 'Не указан'}\n"
            message_text += f"📊 Статус: {status_text}\n\n"
        
        message_text += '💡 Для детальной информации используйте: /order <номер>'
        bot.send_message(chat_id, message_text)
        
    except Exception as e:
        print(f"❌ Ошибка при получении заказов: {e}")
        bot.send_message(chat_id, 'Произошла ошибка при получении заказов.')
    
    finally:
        conn.close()

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
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Получаем детали заказа
        cursor.execute('''
            SELECT o.*, GROUP_CONCAT(oi.quantity || 'x ' || p.name) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            JOIN telegram_orders to ON o.id = to.order_id
            WHERE o.id = ? AND to.telegram_id = ?
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

💡 Примеры использования:
• /order 123 - посмотреть заказ №123
• /orders - список всех заказов

🌐 Сайт: https://mnogo-rolly.kg
📞 Поддержка: @admin_username
    """
    
    bot.send_message(chat_id, help_text.strip())

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
                JOIN telegram_orders to ON o.id = to.order_id
                WHERE o.id = ? AND to.telegram_id = ?
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
        message = f"""
🆕 Новый заказ #{order_data['order_number']}!

👤 Клиент: {order_data['customer_name']}
📱 Телефон: {order_data['customer_phone']}
📍 Адрес: {order_data['delivery_address']}
💰 Сумма: {order_data['total_amount']} ₽
📝 Комментарий: {order_data.get('notes', 'Нет')}

🛒 Товары:
{chr(10).join([f"• {item['quantity']}x {item['name']} - {item['price']} ₽" for item in order_data['items']])}

⏰ Время: {datetime.now().strftime('%d.%m.%Y %H:%M')}
        """
        
        bot.send_message(ADMIN_GROUP_ID, message.strip())
        print(f"✅ Уведомление о заказе #{order_data['order_number']} отправлено в админ-группу")
        
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления админам: {e}")

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
