#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

# Конфигурация
API_BASE_URL = 'https://mnogo-rolly.online/api'
ADMIN_EMAIL = 'admin@example.com'  # Замени на реальный email
ADMIN_PASSWORD = 'admin123'         # Замени на реальный пароль

def get_admin_token():
    """Получение токена админа"""
    try:
        print("🔑 Получение токена админа...")
        
        # Данные для входа
        login_data = {
            'email': ADMIN_EMAIL,
            'password': ADMIN_PASSWORD
        }
        
        # Отправляем запрос на вход
        response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data, timeout=10)
        
        print(f"📡 Статус ответа: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Ответ API: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Извлекаем токен
            if 'access_token' in data:
                token = data['access_token']
                print(f"✅ Токен получен: {token[:20]}...")
                return token
            elif 'token' in data:
                token = data['token']
                print(f"✅ Токен получен: {token[:20]}...")
                return token
            else:
                print("❌ Токен не найден в ответе")
                print(f"Доступные поля: {list(data.keys())}")
                return None
        else:
            print(f"❌ Ошибка входа (статус: {response.status_code})")
            print(f"Ответ: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return None
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return None

def test_token(token):
    """Тестирование токена"""
    if not token:
        return False
        
    try:
        print("🧪 Тестирование токена...")
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Пробуем получить заказы
        response = requests.get(f"{API_BASE_URL}/admin/orders", headers=headers, timeout=10)
        
        print(f"📡 Тест API: статус {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Токен работает!")
            return True
        else:
            print(f"❌ Токен не работает (статус: {response.status_code})")
            print(f"Ответ: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Скрипт получения токена админа")
    print("=" * 50)
    
    # Получаем токен
    token = get_admin_token()
    
    if token:
        print("\n" + "=" * 50)
        print("🔑 ТОКЕН ПОЛУЧЕН УСПЕШНО!")
        print("=" * 50)
        print(f"Токен: {token}")
        print("=" * 50)
        
        # Тестируем токен
        test_token(token)
        
        print("\n💡 Скопируйте токен и вставьте в telegram_bot.py")
        
    else:
        print("\n❌ Не удалось получить токен!")
        print("💡 Проверьте email и пароль в скрипте")
