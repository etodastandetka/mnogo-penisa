# Локальная разработка

## Быстрый запуск

### 1. Запуск backend

#### HTTP сервер (быстро, только для компьютера)
```bash
# Linux/Mac
npm run local

# Windows
npm run local:win
```

#### HTTPS сервер (для телефона через локальную сеть)
```bash
# Linux/Mac
npm run local:https

# Windows
npm run local:https:win
```

### 2. Запуск frontend
```bash
cd ../frontend
npm run dev
```

## Что изменилось

- **Backend** теперь поддерживает несколько режимов:
  - `npm run local` → HTTP на порту 3000 (быстро, только для компьютера)
  - `npm run local:https` → HTTPS на порту 3000 (для телефона через локальную сеть)
  - `npm run server` → HTTPS на порту 3444 (продакшн с nginx)

- **Frontend** автоматически подключается к:
  - `http://localhost:3000/api` для HTTP режима
  - `https://localhost:3000/api` для HTTPS режима
  - `https://147.45.141.113:3444/api` для продакшена

## Порты

- **Backend локально**: 3000 (HTTP)
- **Backend продакшн**: 3444 (HTTPS)
- **Frontend**: 5173 (Vite dev server)

## Переменные окружения

```bash
NODE_ENV=development  # Режим разработки
NODE_ENV=production   # Режим продакшна
USE_HTTPS=true       # Принудительно использовать HTTPS
PORT=3000            # Порт для HTTP/HTTPS сервера
HTTPS_PORT=3444      # Порт для продакшн HTTPS сервера
```

## Отладка

В консоли backend вы увидите:

**HTTP режим:**
- 🚀 HTTP Server started on port: 3000
- 🌐 URL: http://127.0.0.1:3000
- 🌐 Локальная разработка: http://localhost:3000

**HTTPS режим:**
- 🔒 HTTPS Server started on port: 3000
- 🌐 URL: https://127.0.0.1:3000
- 🌐 Локальная сеть: https://[YOUR_IP]:3000

В консоли frontend вы увидите:
- 🌐 API Base URL: http://localhost:3000/api (HTTP)
- 🌐 API Base URL: https://localhost:3000/api (HTTPS)

## Работа с телефоном

1. **Запустите HTTPS сервер:**
   ```bash
   npm run local:https
   ```

2. **Узнайте IP адрес компьютера:**
   ```bash
   # Linux/Mac
   ifconfig
   
   # Windows
   ipconfig
   ```

3. **Откройте на телефоне:**
   ```
   https://[YOUR_IP]:3000
   ```
   
   Например: `https://192.168.1.100:3000`

4. **Примите самоподписанный сертификат** в браузере телефона
