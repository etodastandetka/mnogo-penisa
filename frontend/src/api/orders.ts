import { apiClient } from './client';
import { CartItem, PaymentMethod } from '../types';

export interface CreateOrderRequest {
  items: CartItem[];
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  orderNumber: string;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка создания заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка создания заказа');
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

export const getOrderById = async (orderId: string | number) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения заказа');
  }
};

