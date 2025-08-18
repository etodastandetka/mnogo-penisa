import axios from 'axios';

// Определяем базовый URL в зависимости от среды
const getBaseURL = () => {
  // Используем HTTPS для всех сред
  return 'https://45.144.221.227:3443/api';
};

// Создаем экземпляр axios с базовой конфигурацией
const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Увеличиваем таймаут для мобильных устройств
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 API Request:', config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request');
    } else {
      console.log('❌ No token found in localStorage');
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
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('🚨 API Error:', error.config?.url, error.response?.status, error.response?.data);
    
    // Если получаем 401, перенаправляем на главную страницу
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized, clearing token and redirecting...');
      localStorage.removeItem('token');
      // Не перенаправляем автоматически, пусть компоненты сами решают
    }
    
    // Если таймаут, возвращаем понятную ошибку
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timeout');
      return Promise.reject(new Error('Превышено время ожидания ответа от сервера'));
    }
    
    // Если нет интернета
    if (!error.response && error.request) {
      console.log('🌐 Network error');
      return Promise.reject(new Error('Ошибка соединения с сервером. Проверьте интернет-соединение'));
    }
    
    return Promise.reject(error);
  }
);

export { client };

