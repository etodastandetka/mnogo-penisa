import { apiClient } from './client';
import { User } from '../types';

export const getUserInfo = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/user/me');
    const userData = response.data;
    
    // Преобразуем is_admin в isAdmin для совместимости
    return {
      ...userData,
      isAdmin: userData.is_admin || userData.isAdmin || false
    };
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
