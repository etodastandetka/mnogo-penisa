# Инструкции по сборке APK для "Много Роллы"

## 🚀 Быстрая сборка APK через Expo

### Шаг 1: Установка EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Шаг 2: Вход в аккаунт Expo
```bash
eas login
```
Если у вас нет аккаунта, создайте его на [expo.dev](https://expo.dev)

### Шаг 3: Настройка проекта
```bash
eas build:configure
```

### Шаг 4: Сборка APK
```bash
# Для тестирования (APK)
eas build --platform android --profile preview

# Для продакшена (AAB для Google Play)
eas build --platform android --profile production
```

### Шаг 5: Скачивание
После завершения сборки (5-15 минут), Expo предоставит ссылку для скачивания файла.

---

## 📱 Альтернативные способы сборки

### Способ 1: Локальная сборка (без Expo серверов)
```bash
# Установка зависимостей
npx expo install expo-dev-client

# Локальная сборка
eas build --platform android --profile preview --local
```

### Способ 2: Сборка через Expo Go (для тестирования)
```bash
# Запуск приложения
npx expo start

# Сканирование QR-кода приложением Expo Go
```

### Способ 3: Сборка через Expo Development Build
```bash
# Создание development build
eas build --platform android --profile development

# Установка на устройство для разработки
```

---

## ⚙️ Настройка eas.json

Создайте файл `eas.json` в корне проекта:

```json
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔧 Настройка app.json

Убедитесь, что в `app.json` указаны правильные настройки:

```json
{
  "expo": {
    "name": "Много Роллы",
    "slug": "mnogo-rolly",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#dc2626"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#dc2626"
      },
      "package": "com.mnogorolly.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## 📋 Требования для сборки

### Для сборки через Expo серверы:
- ✅ Аккаунт Expo
- ✅ Интернет соединение
- ✅ Node.js 16+

### Для локальной сборки:
- ✅ Android Studio
- ✅ Java Development Kit (JDK)
- ✅ Android SDK
- ✅ Переменные окружения ANDROID_HOME, JAVA_HOME

---

## 🎯 Типы сборок

### Preview (APK)
- **Назначение**: Тестирование на устройствах
- **Формат**: .apk
- **Размер**: ~25-50 MB
- **Время сборки**: 5-10 минут

### Production (AAB)
- **Назначение**: Загрузка в Google Play Store
- **Формат**: .aab
- **Размер**: ~20-40 MB
- **Время сборки**: 10-15 минут

### Development
- **Назначение**: Разработка и отладка
- **Формат**: .apk
- **Размер**: ~30-60 MB
- **Время сборки**: 5-10 минут

---

## 🔍 Отладка проблем

### Ошибка "Build failed"
```bash
# Проверка логов
eas build:list

# Повторная сборка
eas build --platform android --profile preview --clear-cache
```

### Ошибка "Network timeout"
```bash
# Использование локальной сборки
eas build --platform android --profile preview --local
```

### Ошибка "Dependencies not found"
```bash
# Переустановка зависимостей
rm -rf node_modules
npm install
```

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте [документацию Expo](https://docs.expo.dev)
2. Обратитесь в [Expo Discord](https://chat.expo.dev)
3. Создайте issue в [Expo GitHub](https://github.com/expo/expo)

---

## ✅ Чек-лист перед сборкой

- [ ] Все зависимости установлены
- [ ] Код компилируется без ошибок
- [ ] Настроен app.json
- [ ] Создан eas.json
- [ ] Войдены в аккаунт Expo
- [ ] Выбран правильный профиль сборки
- [ ] Устройство подключено (для локальной сборки)

**Удачи с вашим приложением! 🎉**
