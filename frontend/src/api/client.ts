import axios from 'axios';

// Определяем мобильное устройство
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// API клиент для работы с сервером
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
      
      // Если это ошибка сети на мобильном, пробуем HTTP как fallback
      if (!error.response && error.request && error.code !== 'ECONNABORTED') {
        console.log('🔄 Пробуем HTTP fallback для мобильного устройства...');
        // Меняем baseURL на HTTP для следующего запроса
        client.defaults.baseURL = 'http://147.45.141.113:3001/api';
      }
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

