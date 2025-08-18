# Настройка HTTPS для Mnogo Rolly

## Проблема
Netlify работает по HTTPS, а ваш сервер по HTTP. Браузер блокирует смешанный контент.

## Решение: Настройка Nginx + SSL

### 1. Подключитесь к серверу
```bash
ssh root@45.144.221.227
```

### 2. Установите Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 3. Установите Certbot для SSL
```bash
sudo apt install certbot python3-certbot-nginx
```

### 4. Создайте конфигурацию Nginx
```bash
sudo nano /etc/nginx/sites-available/mnogo-rolly
```

Содержимое файла:
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

### 5. Активируйте конфигурацию
```bash
sudo ln -s /etc/nginx/sites-available/mnogo-rolly /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # удалить дефолтную конфигурацию
sudo nginx -t  # проверить конфигурацию
sudo systemctl reload nginx
```

### 6. Получите SSL сертификат
```bash
sudo certbot --nginx -d 45.144.221.227
```

Если certbot не работает с IP, используйте:
```bash
sudo certbot --nginx --agree-tos --email your-email@example.com -d your-domain.com
```

### 7. Проверьте статус
```bash
sudo systemctl status nginx
sudo certbot certificates
```

### 8. Обновите фронтенд
После настройки HTTPS измените URL в `frontend/src/api/client.ts`:
```typescript
baseURL: 'https://45.144.221.227/api',  // без порта 3001
```

## Альтернативное решение: Cloudflare

Если у вас есть домен:

1. Зарегистрируйтесь на [Cloudflare](https://cloudflare.com)
2. Добавьте ваш домен
3. Настройте DNS записи:
   - A: your-domain.com → 45.144.221.227
4. Включите "Always Use HTTPS"
5. Включите "Flexible SSL"

## Проверка
После настройки проверьте:
```bash
curl https://45.144.221.227/api/health
```

Должен вернуть:
```json
{"status":"OK","message":"Mnogo Rolly API работает"}
```
