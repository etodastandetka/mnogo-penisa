# 🚀 Установка Mnogo Penisa на сервер 147.45.141.113

## 📋 Предварительные требования

- Ubuntu 20.04+ сервер
- Root доступ
- Домен направлен на IP сервера

## 🔧 Шаг 1: Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
sudo apt install -y nginx nodejs npm git curl

# Устанавливаем Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 📁 Шаг 2: Загрузка проекта

```bash
# Создаем директорию для проекта
sudo mkdir -p /var/www/mnogo-penisa
cd /var/www/mnogo-penisa

# Клонируем проект (замените на ваш репозиторий)
sudo git clone https://github.com/YOUR_USERNAME/mnogo-penisa.git .

# Или загружаем файлы через SCP
# scp -r ./frontend ./backend user@147.45.141.113:/var/www/mnogo-penisa/
```

## 🔨 Шаг 3: Сборка проектов

```bash
# Backend
cd /var/www/mnogo-penisa/backend
sudo npm install

# Frontend
cd /var/www/mnogo-penisa/frontend
sudo npm install
sudo npm run build
```

## ⚙️ Шаг 4: Настройка Nginx

```bash
# Копируем конфигурацию nginx
sudo cp nginx.conf /etc/nginx/sites-available/mnogo-penisa

# Активируем сайт
sudo ln -sf /etc/nginx/sites-available/mnogo-penisa /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t
```

## 🔒 Шаг 5: SSL сертификаты

```bash
# Создаем самоподписанный сертификат
sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/mnogo-penisa.key \
    -out /etc/ssl/certs/mnogo-penisa.crt \
    -subj "/C=KG/ST=Bishkek/L=Bishkek/O=MnogoPenisa/CN=147.45.141.113"

# Устанавливаем права
sudo chmod 600 /etc/ssl/private/mnogo-penisa.key
sudo chmod 644 /etc/ssl/certs/mnogo-penisa.crt
```

## 🚀 Шаг 6: Systemd сервис

```bash
# Создаем сервис для backend
sudo nano /etc/systemd/system/mnogo-penisa.service
```

Содержимое файла:
```ini
[Unit]
Description=Mnogo Penisa Backend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mnogo-penisa/backend
ExecStart=/usr/bin/node start-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## 🔥 Шаг 7: Запуск

```bash
# Запускаем сервисы
sudo systemctl daemon-reload
sudo systemctl enable mnogo-penisa
sudo systemctl start mnogo-penisa
sudo systemctl restart nginx

# Настраиваем firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3444
```

## ✅ Шаг 8: Проверка

```bash
# Проверяем статус
sudo systemctl status mnogo-penisa
sudo systemctl status nginx

# Проверяем логи
sudo journalctl -u mnogo-penisa -f
```

## 🌐 Результат

Сайт будет доступен по адресу:
- **https://147.45.141.113** (основной)
- **https://mnogo-rolly.online** (когда DNS обновится)
- **https://mnogo-rolly.ru** (когда DNS обновится)

## 🔧 Полезные команды

```bash
# Перезапуск backend
sudo systemctl restart mnogo-penisa

# Перезапуск nginx
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/mnogo-penisa_access.log
sudo journalctl -u mnogo-penisa -f

# Обновление проекта
cd /var/www/mnogo-penisa
sudo git pull
cd frontend && sudo npm run build
sudo systemctl restart mnogo-penisa
```
