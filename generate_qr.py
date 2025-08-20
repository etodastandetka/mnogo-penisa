#!/usr/bin/env python3
"""
Скрипт для генерации QR-кода для чаевых
"""

import qrcode
from PIL import Image, ImageDraw, ImageFont
import os

def generate_tips_qr():
    """Генерирует QR-код для чаевых"""
    
    # Создаем QR-код
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Добавляем данные (можно изменить на реальный URL для чаевых)
    qr.add_data('https://mnogo-rolly.online/tips')
    qr.make(fit=True)
    
    # Создаем изображение
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Изменяем размер
    qr_image = qr_image.resize((200, 200))
    
    # Создаем новое изображение с белым фоном
    final_image = Image.new('RGB', (300, 350), 'white')
    
    # Вставляем QR-код в центр
    qr_x = (300 - 200) // 2
    qr_y = 50
    final_image.paste(qr_image, (qr_x, qr_y))
    
    # Добавляем текст
    draw = ImageDraw.Draw(final_image)
    
    # Пытаемся использовать системный шрифт
    try:
        # Для Windows
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        try:
            # Для Linux/Mac
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        except:
            # Fallback на стандартный шрифт
            font = ImageFont.load_default()
    
    # Добавляем заголовок
    title = "QR код для чаевых"
    title_bbox = draw.textbbox((0, 0), title, font=font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (300 - title_width) // 2
    draw.text((title_x, 20), title, fill="black", font=font)
    
    # Добавляем подпись
    subtitle = "Отсканируйте для чаевых"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (300 - subtitle_width) // 2
    draw.text((subtitle_x, 270), subtitle, fill="black", font=font)
    
    # Сохраняем изображение
    output_path = "frontend/public/images/qr-tips.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_image.save(output_path)
    
    print(f"✅ QR-код для чаевых сохранен в: {output_path}")
    print(f"📏 Размер: {final_image.size}")
    
    return output_path

if __name__ == "__main__":
    try:
        # Устанавливаем qrcode если не установлен
        import qrcode
    except ImportError:
        print("❌ Модуль qrcode не установлен. Устанавливаем...")
        import subprocess
        subprocess.check_call(["pip", "install", "qrcode[pil]"])
        import qrcode
    
    generate_tips_qr()
