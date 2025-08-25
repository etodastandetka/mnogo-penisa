import { apiClient } from './client';

export interface CreateOrderRequest {
  items: Array<{
    product: {
      id: string | number;
      price: number;
    };
    quantity: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  total: number;
  paymentMethod: string;
  notes?: string;
}

export interface CreateOrderResponse {
  orderId: number;
  orderNumber: string;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  try {
    // Проверяем, есть ли токен
    const token = localStorage.getItem('token');
    const endpoint = token ? '/orders' : '/orders/guest';
    
    console.log('📦 Создаем заказ через endpoint:', endpoint);
    
    const response = await apiClient.post(endpoint, orderData);
    
    // Бэкенд возвращает { success: true, data: { orderId, orderNumber } }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Неверный формат ответа от сервера');
  } catch (error: any) {
    console.error('❌ Ошибка создания заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка создания заказа');
  }
};

export const getUserOrders = async () => {
  try {
    // Проверяем, есть ли токен
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Нет токена, возвращаем пустой массив заказов');
      return [];
    }
    
    const response = await apiClient.get('/orders/user');
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка получения заказов пользователя:', error);
    // Если ошибка 401 (не авторизован), возвращаем пустой массив
    if (error.response?.status === 401) {
      return [];
    }
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

export const getGuestOrderByNumber = async (orderNumber: string) => {
  try {
    const response = await apiClient.get(`/orders/guest/${orderNumber}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения гостевого заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения заказа');
  }
};

