import axios from 'axios';

// Простой API клиент для работы с сервером
export const client = axios.create({
  baseURL: 'https://147.45.141.113:3444/api',
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

