import axios from 'axios';

// Определяем базовый URL в зависимости от среды
const getBaseURL = () => {
  // Принудительно используем HTTPS для продакшена
  if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
    return 'https://45.144.221.227:3443/api';
  }
  // В разработке используем HTTP
  return 'http://45.144.221.227:3001/api';
};

// Создаем экземпляр axios с базовой конфигурацией
const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если получаем 401, перенаправляем на главную страницу
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export { client };

