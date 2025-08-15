# Много Роллы - Expo приложение

React Native приложение для заказа еды с доставкой, созданное с помощью Expo.

## Возможности

- 📱 Просмотр меню продуктов
- 🛒 Корзина с управлением количеством
- 💳 Онлайн оплата через QR-коды (MBank, MegaPay, O! Деньги и др.)
- 💵 Оплата наличными
- 👤 Регистрация и авторизация пользователей
- 📍 Оформление заказов с доставкой
- 📊 Отслеживание статуса заказов

## Технологии

- Expo SDK
- React Native
- TypeScript
- React Navigation
- Zustand (управление состоянием)
- Axios (HTTP клиент)
- Expo Linear Gradient
- CryptoJS (для QR-кодов)

## Установка

### Предварительные требования

1. Node.js (версия 16 или выше)
2. Expo CLI: `npm install -g @expo/cli`

### Установка зависимостей

```bash
npm install
```

### Запуск приложения

```bash
# Запуск в браузере
npm run web

# Запуск на Android (требует Expo Go)
npm run android

# Запуск на iOS (требует Expo Go)
npm run ios
```

## Сборка APK через Expo

### 1. Установка EAS CLI

```bash
npm install -g @expo/eas-cli
```

### 2. Вход в аккаунт Expo

```bash
eas login
```

### 3. Настройка проекта

```bash
eas build:configure
```

### 4. Сборка APK

```bash
# Сборка APK для Android
eas build --platform android --profile preview

# Или для production
eas build --platform android --profile production
```

### 5. Скачивание APK

После завершения сборки, Expo предоставит ссылку для скачивания APK файла.

## Сборка AAB (Android App Bundle)

Для загрузки в Google Play Store:

```bash
eas build --platform android --profile production
```

## Сборка для iOS

```bash
# Сборка для iOS (требует Apple Developer аккаунт)
eas build --platform ios --profile production
```

## Локальная сборка

Для сборки без использования Expo серверов:

```bash
# Установка зависимостей для локальной сборки
npx expo install expo-dev-client

# Локальная сборка APK
eas build --platform android --profile preview --local
```

## Настройка сервера

Приложение настроено на работу с локальным сервером по адресу `http://localhost:3001/api`. 

Для изменения адреса сервера отредактируйте файл `src/utils/api.ts`:

```typescript
const API_BASE_URL = 'http://your-server-address:3001/api';
```

## Структура проекта

```
src/
├── components/     # Переиспользуемые компоненты
├── screens/        # Экраны приложения
├── store/          # Zustand stores
├── types/          # TypeScript типы
└── utils/          # Утилиты и API
```

## Преимущества Expo

- 🚀 Быстрая разработка
- 📱 Простая сборка APK/AAB
- 🔧 Автоматические обновления
- 📦 Встроенные нативные модули
- 🌐 Кроссплатформенность
- 📊 Аналитика и мониторинг

## Команды для разработки

```bash
# Запуск Metro bundler
npx expo start

# Запуск с туннелем (для тестирования на устройстве)
npx expo start --tunnel

# Публикация обновлений
npx expo publish
```

## Лицензия

MIT
