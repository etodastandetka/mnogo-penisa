import { client } from './client';
import { Order, OrderStatus, PaymentMethod } from '../types';

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export const ordersApi = {
  // Создать заказ
  create: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await client.post('/orders', orderData);
    return response.data.data;
  },

  // Получить заказ по ID
  getById: async (id: string): Promise<Order> => {
    const response = await client.get(`/orders/${id}`);
    return response.data.data;
  },

  // Обновить статус заказа
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await client.put(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  // Получить QR-код для оплаты
  getQrCode: async (id: string): Promise<{ qrCode: string; amount: number }> => {
    const response = await client.get(`/orders/${id}/qr`);
    return response.data.data;
  },

  // Получить чек
  getReceipt: async (id: string): Promise<{ pdfUrl: string }> => {
    const response = await client.get(`/orders/${id}/receipt`);
    return response.data.data;
  },

  // Получить заказы пользователя
  getUserOrders: async (): Promise<Order[]> => {
    const response = await client.get('/orders/my');
    return response.data.data;
  },
};

