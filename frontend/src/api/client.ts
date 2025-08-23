import axios from 'axios';

// Определяем мобильное устройство
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// API клиент для работы с сервером - используем только HTTPS
export const client = axios.create({
  baseURL: 'https://147.45.141.113:3444/api',
  timeout: 30000, // Увеличиваем timeout для мобильных
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для запросов
client.interceptors.request.use(
  (config) => {
    // Добавляем токен если есть
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Логируем для мобильных устройств
    if (isMobile) {
      console.log(`📱 Мобильный запрос: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`📱 User-Agent: ${navigator.userAgent}`);
      console.log(`📱 Полный URL: ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
client.interceptors.response.use(
  (response) => {
    if (isMobile) {
      console.log(`📱 Мобильный ответ: ${response.config.url} - ${response.status}`);
    } else {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (isMobile) {
      console.log(`📱 Мобильная ошибка: ${error.config?.url}`);
      console.log(`📱 Код ошибки: ${error.code}`);
      console.log(`📱 Сообщение: ${error.message}`);
      console.log(`📱 Статус: ${error.response?.status}`);
      console.log(`📱 Данные:`, error.response?.data);
      console.log(`📱 Полный URL запроса: ${error.config?.baseURL}${error.config?.url}`);
    } else {
      console.log('🚨 API Error:', error.config?.url, error.response?.status, error.response?.data);
    }
    
    // Если получаем 401, перенаправляем на главную страницу
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

