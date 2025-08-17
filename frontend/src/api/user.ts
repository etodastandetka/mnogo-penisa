import { User } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const getUserInfo = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Токен не найден');
  }

  const response = await fetch(`${API_BASE_URL}/api/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка получения данных пользователя');
  }

  return response.json();
};
