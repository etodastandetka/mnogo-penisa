#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import os

def install_requirements():
    """Установка зависимостей"""
    print("📦 Установка зависимостей...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Зависимости установлены")
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка установки зависимостей: {e}")
        return False
    return True

def start_bot():
    """Запуск бота"""
    print("🚀 Запуск Python Telegram бота...")
    
    if not install_requirements():
        print("❌ Не удалось установить зависимости")
        return
    
    try:
        # Запускаем бота
        subprocess.run([sys.executable, "telegram_bot.py"])
    except KeyboardInterrupt:
        print("\n🛑 Бот остановлен")
    except Exception as e:
        print(f"❌ Ошибка запуска бота: {e}")

if __name__ == "__main__":
    start_bot()
