#!/bin/bash

# Скрипт развертывания Mnogo Rolly на сервере
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем развертывание Mnogo Rolly..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем, что мы root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Пожалуйста, запустите скрипт как root (sudo ./deploy.sh)${NC}"
    exit 1
fi

# Обновляем систему
echo -e "${YELLOW}📦 Обновляем систему...${NC}"
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
echo -e "${YELLOW}📦 Устанавливаем необходимые пакеты...${NC}"
apt install -y nginx nodejs npm git curl

# Устанавливаем Node.js 18
echo -e "${YELLOW}📦 Устанавливаем Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Создаем пользователя для приложения
echo -e "${YELLOW}👤 Создаем пользователя mnogo-penisa...${NC}"
useradd -m -s /bin/bash mnogo-penisa || true

# Создаем директории
echo -e "${YELLOW}📁 Создаем директории...${NC}"
mkdir -p /var/www/mnogo-penisa
mkdir -p /var/log/mnogo-penisa
chown -R mnogo-penisa:mnogo-penisa /var/www/mnogo-penisa
chown -R mnogo-penisa:mnogo-penisa /var/log/mnogo-penisa

# Копируем файлы проекта
echo -e "${YELLOW}📂 Копируем файлы проекта...${NC}"
cp -r ./frontend /var/www/mnogo-penisa/
cp -r ./backend /var/www/mnogo-penisa/
chown -R mnogo-penisa:mnogo-penisa /var/www/mnogo-penisa

# Устанавливаем зависимости backend
echo -e "${YELLOW}📦 Устанавливаем зависимости backend...${NC}"
cd /var/www/mnogo-penisa/backend
sudo -u mnogo-penisa npm install

# Собираем frontend
echo -e "${YELLOW}🔨 Собираем frontend...${NC}"
cd /var/www/mnogo-penisa/frontend
sudo -u mnogo-penisa npm install
sudo -u mnogo-penisa npm run build

# Копируем nginx конфигурацию
echo -e "${YELLOW}⚙️ Настраиваем nginx...${NC}"
cp /var/www/mnogo-penisa/nginx.conf /etc/nginx/sites-available/mnogo-penisa
ln -sf /etc/nginx/sites-available/mnogo-penisa /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем nginx конфигурацию
nginx -t

# Создаем systemd сервис
echo -e "${YELLOW}⚙️ Создаем systemd сервис...${NC}"
cat > /etc/systemd/system/mnogo-penisa.service << EOF
[Unit]
Description=Mnogo Penisa Backend Server
After=network.target

[Service]
Type=simple
User=mnogo-penisa
WorkingDirectory=/var/www/mnogo-penisa/backend
ExecStart=/usr/bin/node start-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

# Логирование
StandardOutput=append:/var/log/mnogo-penisa/app.log
StandardError=append:/var/log/mnogo-penisa/error.log

# Безопасность
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/www/mnogo-penisa

[Install]
WantedBy=multi-user.target
EOF

# SSL сертификаты Let's Encrypt (если нужны)
echo -e "${YELLOW}🔒 Проверяем SSL сертификаты...${NC}"
if [ ! -f "/etc/letsencrypt/live/mnogo-rolly.online/fullchain.pem" ]; then
    echo -e "${YELLOW}📝 Let's Encrypt сертификаты не найдены${NC}"
    echo -e "${YELLOW}💡 Запустите: sudo certbot --nginx -d mnogo-rolly.online${NC}"
else
    echo -e "${GREEN}✅ Let's Encrypt сертификаты найдены${NC}"
fi

# Запускаем сервисы
echo -e "${YELLOW}🚀 Запускаем сервисы...${NC}"
systemctl daemon-reload
systemctl enable mnogo-penisa
systemctl start mnogo-penisa
systemctl enable nginx
systemctl restart nginx

# Настраиваем firewall
echo -e "${YELLOW}🔥 Настраиваем firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3444

# Проверяем статус
echo -e "${GREEN}✅ Проверяем статус сервисов...${NC}"
echo "Mnogo Penisa Backend:"
systemctl status mnogo-penisa --no-pager -l
echo ""
echo "Nginx:"
systemctl status nginx --no-pager -l

echo -e "${GREEN}🎉 Развертывание завершено!${NC}"
echo -e "${GREEN}🌐 Сайт доступен по адресу: https://147.45.141.113${NC}"
echo -e "${YELLOW}📝 Логи backend: /var/log/mnogo-penisa/${NC}"
echo -e "${YELLOW}📝 Логи nginx: /var/log/nginx/${NC}"
echo ""
echo -e "${YELLOW}🔧 Полезные команды:${NC}"
echo "sudo systemctl status mnogo-penisa    # Статус backend"
echo "sudo systemctl restart mnogo-penisa   # Перезапуск backend"
echo "sudo systemctl status nginx          # Статус nginx"
echo "sudo tail -f /var/log/mnogo-penisa/app.log   # Логи backend"
