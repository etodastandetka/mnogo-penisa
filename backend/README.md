# 🍣 Простой сервер Mnogo Rolly

Простая версия сервера на Node.js + Express + TypeScript без сложных фреймворков.

## 🚀 Быстрый запуск

```cmd
start.bat
```

Или вручную:

```bash
npm install
npm run seed
npm run dev
```

## 📁 Структура

```
backend/
├── src/
│   ├── server.ts    # Основной сервер
│   └── seed.ts      # Заполнение БД
├── data/            # SQLite база данных
├── package.json
├── tsconfig.json
└── start.bat
```

## 🔗 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/profile` - Профиль пользователя

### Продукты
- `GET /api/products` - Список всех продуктов
- `GET /api/products/:id` - Получить продукт по ID
- `GET /api/products/categories` - Список категорий

### Админ API
- `GET /api/admin/stats` - Статистика дашборда
- `GET /api/admin/orders` - Список заказов
- `GET /api/admin/orders/:id` - Детали заказа
- `PATCH /api/admin/orders/:id/status` - Обновление статуса

## 🔑 Тестовые данные

- **Email**: admin@mnogo-rolly.ru
- **Пароль**: admin123

## 🛠️ Технологии

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Типизация
- **SQLite** - База данных
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей

## 📊 База данных

Автоматически создаются таблицы:
- `users` - Пользователи
- `products` - Продукты
- `orders` - Заказы
- `order_items` - Элементы заказов

## 🎯 Преимущества простого сервера

✅ **Простота** - Легко понять и модифицировать  
✅ **Быстрый запуск** - Минимум зависимостей  
✅ **TypeScript** - Типизация для надежности  
✅ **SQLite** - Встроенная база данных  
✅ **JWT** - Безопасная аутентификация  
✅ **Готов к продакшену** - Helmet, CORS, compression  

## 🔄 Сравнение с NestJS

| Аспект | Простой сервер | NestJS |
|--------|----------------|--------|
| Сложность | Простой | Сложный |
| Зависимости | 8 пакетов | 50+ пакетов |
| Время запуска | 2 сек | 10+ сек |
| Размер | 200 строк | 1000+ строк |
| Гибкость | Высокая | Средняя |
| Enterprise | Нет | Да |

## 🚀 Запуск

```bash
# Разработка
npm run dev

# Продакшен
npm run build
npm start
```

Сервер будет доступен по адресу: http://localhost:3001

## 🔗 Интеграция с Frontend

Frontend уже настроен для работы с этим API. Просто запустите:

```bash
# Backend
cd backend
npm run dev

# Frontend (в новом терминале)
cd frontend
npm run dev
```

## 📝 Что включено

✅ **Полный API** - Аутентификация, продукты, заказы  
✅ **Админ панель** - Статистика и управление  
✅ **База данных** - SQLite с тестовыми данными  
✅ **Безопасность** - JWT, bcrypt, helmet  
✅ **TypeScript** - Полная типизация  
✅ **Готов к продакшену** - CORS, compression, graceful shutdown
