import axios from 'axios';

// Улучшенное определение мобильного устройства
const getBaseURL = () => {
  // Проверяем несколько способов определения мобильного устройства
  const isMobile = 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
    window.innerWidth < 768;
  
  if (isMobile) {
    // Для мобильных устройств сначала пробуем HTTPS, потом HTTP как fallback
    return 'https://45.144.221.227:3444/api';
  } else {
    // Для десктопа используем HTTPS
    return 'https://45.144.221.227:3444/api';
  }
};

export const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Увеличиваем timeout для iPhone
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

    // Добавляем заголовки для лучшей совместимости с iPhone
    config.headers['Accept'] = 'application/json';
    config.headers['Cache-Control'] = 'no-cache';

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
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('🚨 API Error:', error.config?.url, error.response?.status, error.response?.data);
    
    // Если получаем 401, перенаправляем на главную страницу
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    // Если это ошибка сети на мобильном, пробуем HTTP как fallback
    if (!error.response && error.request && error.code !== 'ECONNABORTED') {
      console.log('🔄 Пробуем HTTP fallback для мобильного устройства...');
      // Меняем baseURL на HTTP для следующего запроса
      client.defaults.baseURL = 'http://45.144.221.227:3001/api';
    }
    
    return Promise.reject(error);
  }
);

