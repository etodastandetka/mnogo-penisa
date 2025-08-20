#!/usr/bin/env python3
"""
Скрипт для генерации QR-кода в base64 для встраивания в HTML
"""

import qrcode
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import os

def generate_qr_base64():
    """Генерирует QR-код и возвращает его в base64"""
    
    # Создаем QR-код
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=2,
    )
    
    # Добавляем данные
    qr.add_data('https://mnogo-rolly.online/tips')
    qr.make(fit=True)
    
    # Создаем изображение с высоким контрастом
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Изменяем размер
    qr_image = qr_image.resize((160, 160))
    
    # Создаем новое изображение с белым фоном и рамкой
    final_image = Image.new('RGB', (200, 240), 'white')
    
    # Добавляем черную рамку
    draw = ImageDraw.Draw(final_image)
    draw.rectangle([0, 0, 199, 239], outline='black', width=2)
    
    # Вставляем QR-код в центр
    qr_x = (200 - 160) // 2
    qr_y = 20
    final_image.paste(qr_image, (qr_x, qr_y))
    
    # Добавляем текст
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Добавляем заголовок
    title = "QR код для чаевых"
    title_bbox = draw.textbbox((0, 0), title, font=font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (200 - title_width) // 2
    draw.text((title_x, 190), title, fill="black", font=font)
    
    # Конвертируем в base64
    buffer = BytesIO()
    final_image.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    # Сохраняем также как файл
    output_path = "frontend/public/images/qr-tips.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_image.save(output_path)
    
    # Создаем HTML файл с base64
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>QR Code Base64</title>
</head>
<body>
    <h2>QR Code Base64 для вставки в HTML:</h2>
    <textarea rows="10" cols="80" readonly>
data:image/png;base64,{img_str}
    </textarea>
    
    <h2>Предварительный просмотр:</h2>
    <img src="data:image/png;base64,{img_str}" alt="QR код для чаевых" />
    
    <h2>HTML код для вставки:</h2>
    <textarea rows="5" cols="80" readonly>
&lt;img src="data:image/png;base64,{img_str}" alt="QR код для чаевых" style="width: 80px; height: 80px; margin: 0 auto; display: block;" /&gt;
    </textarea>
</body>
</html>
"""
    
    with open("qr_base64_output.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"✅ QR-код сохранен в: {output_path}")
    print(f"✅ HTML файл с base64 создан: qr_base64_output.html")
    print(f"📏 Размер: {final_image.size}")
    print(f"🎨 Цвета: черный QR-код на белом фоне с рамкой")
    
    return img_str

if __name__ == "__main__":
    try:
        import qrcode
    except ImportError:
        print("❌ Модуль qrcode не установлен. Устанавливаем...")
        import subprocess
        subprocess.check_call(["pip", "install", "qrcode[pil]"])
        import qrcode
    
    generate_qr_base64()
