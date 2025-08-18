import { User } from '../types';
import { client } from './client';

export const getUserInfo = async (): Promise<User> => {
  const response = await client.get('/user/me');
  return response.data;
};

// Получить заказы пользователя
export const getUserOrders = async () => {
  const response = await client.get('/orders/user');
  return response.data;
};
