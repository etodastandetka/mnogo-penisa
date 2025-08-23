import axios from 'axios';

// Умный API клиент для работы с сервером
const getBaseURL = () => {
  // Если мы в браузере и на localhost, используем локальный backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Проверяем, работает ли HTTPS на localhost
    return window.location.protocol === 'https:' 
      ? 'https://localhost:3001/api'
      : 'http://localhost:3001/api';
  }
  
  // Если мы в браузере и на 127.0.0.1, используем локальный backend
  if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
    return window.location.protocol === 'https:' 
      ? 'https://127.0.0.1:3001/api'
      : 'http://127.0.0.1:3001/api';
  }
  
  // Для продакшена используем относительный URL (nginx проксирует)
  return '/api';
};

const baseURL = getBaseURL();
console.log('🌐 API Base URL:', baseURL);

export const client = axios.create({
  baseURL: baseURL,
  timeout: 15000,
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
    
    return Promise.reject(error);
  }
);

