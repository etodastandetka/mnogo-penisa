# Настройка правильного SSL сертификата

## Проблема
Самоподписанный сертификат вызывает предупреждения в браузере.

## Решение: Let's Encrypt

### 1. Установите Certbot на сервере
```bash
ssh root@45.144.221.227

# Установите Certbot
sudo apt update
sudo apt install certbot

# Установите Nginx (если не установлен)
sudo apt install nginx
```

### 2. Настройте Nginx как прокси
```bash
sudo nano /etc/nginx/sites-available/mnogo-rolly
```

Содержимое:
```nginx
server {
    listen 80;
    server_name 45.144.221.227;  # или ваш домен

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Активируйте конфигурацию
```bash
sudo ln -s /etc/nginx/sites-available/mnogo-rolly /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Получите SSL сертификат
```bash
# Для IP адреса (может не работать)
sudo certbot --nginx -d 45.144.221.227

# Для домена (рекомендуется)
sudo certbot --nginx -d your-domain.com
```

### 5. Обновите фронтенд
После получения сертификата измените URL:
```typescript
// В frontend/src/api/client.ts
baseURL: 'https://45.144.221.227/api',  // без порта
```

## Альтернативное решение: Cloudflare

Если у вас есть домен:

1. Зарегистрируйтесь на [Cloudflare](https://cloudflare.com)
2. Добавьте ваш домен
3. Настройте DNS: A → 45.144.221.227
4. Включите "Always Use HTTPS"
5. Включите "Flexible SSL"

## Временное решение для разработки

Используйте HTTP для тестирования:
```typescript
baseURL: 'http://45.144.221.227:3001/api'
```

## Проверка
После настройки:
```bash
curl https://45.144.221.227/api/health
```

Должен вернуть ответ без предупреждений.
