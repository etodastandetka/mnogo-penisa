# Много Роллы - Мобильное приложение

React Native приложение для заказа еды с доставкой.

## Возможности

- 📱 Просмотр меню продуктов
- 🛒 Корзина с управлением количеством
- 💳 Онлайн оплата через QR-коды (MBank, MegaPay, O! Деньги и др.)
- 💵 Оплата наличными
- 👤 Регистрация и авторизация пользователей
- 📍 Оформление заказов с доставкой
- 📊 Отслеживание статуса заказов

## Технологии

- React Native 0.72.6
- TypeScript
- React Navigation
- Zustand (управление состоянием)
- Axios (HTTP клиент)
- React Native Linear Gradient
- React Native QR Code SVG

## Установка

### Предварительные требования

1. Node.js (версия 16 или выше)
2. React Native CLI
3. Android Studio (для Android)
4. Xcode (для iOS, только на macOS)

### Установка зависимостей

```bash
npm install
```

### Для Android

1. Убедитесь, что у вас установлен Android Studio и настроены переменные окружения
2. Запустите эмулятор Android или подключите устройство
3. Выполните команду:

```bash
npm run android
```

### Для iOS (только на macOS)

1. Установите зависимости iOS:

```bash
cd ios && pod install && cd ..
```

2. Запустите приложение:

```bash
npm run ios
```

## Сборка APK

### Для Android

1. Создайте keystore для подписи приложения:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Переместите keystore в папку `android/app/`

3. Настройте `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

4. Соберите APK:

```bash
cd android
./gradlew assembleRelease
```

APK файл будет создан в `android/app/build/outputs/apk/release/`

## Сборка для iOS

1. Откройте проект в Xcode:

```bash
open ios/MnogoRollyApp.xcworkspace
```

2. Выберите устройство или симулятор
3. Нажмите Product → Archive
4. Следуйте инструкциям для загрузки в App Store

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

## Лицензия

MIT
