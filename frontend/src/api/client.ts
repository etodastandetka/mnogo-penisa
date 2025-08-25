import axios from 'axios';

// Умный API клиент для работы с сервером
const getBaseURL = () => {
  // Для production всегда использовать относительные URL
  if (typeof window !== 'undefined') {
    // Проверяем, есть ли проблемы с HTTPS
    const protocol = window.location.protocol;
    const host = window.location.host;
    console.log('🌐 Текущий протокол:', protocol);
    console.log('🌐 Текущий хост:', host);
    
    // Если HTTPS, но есть проблемы, пробуем HTTP
    if (protocol === 'https:' && host.includes('localhost')) {
      return 'http://localhost:3001/api';
    }
  }
  return '/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Увеличиваем таймаут для мобильных устройств
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для запросов
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен если есть
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('🚨 API Error:', error.config?.url, error.message, error.code);
    
    // Улучшенная обработка ошибок для мобильных устройств
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Ошибка сети - возможно проблемы с соединением');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Таймаут запроса');
    } else if (error.response?.status >= 500) {
      console.error('🖥️ Ошибка сервера:', error.response.status);
    } else if (error.response?.status >= 400) {
      console.error('📱 Ошибка клиента:', error.response.status);
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export { apiClient as client };
export default apiClient;

