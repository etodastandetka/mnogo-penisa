import { apiClient } from './client';
import { User } from '../types';

export const getUserInfo = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения информации о пользователе:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения профиля');
  }
};

export const getUserOrders = async () => {
  try {
    const response = await apiClient.get('/orders/user');
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка получения заказов пользователя:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения заказов');
  }
};
