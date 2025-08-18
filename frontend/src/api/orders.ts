import { client } from './client';
import { Order, PaymentMethod, CartItem } from '../types';

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

export const ordersApi = {
  // Создать заказ (для авторизованного пользователя)
  create: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const payload = {
      customer: {
        name: orderData.customer.name,
        phone: orderData.customer.phone,
        address: orderData.customer.address,
        notes: orderData.customer.notes,
      },
      items: orderData.items.map((item) => ({
        product: {
          id: item.product.id,
          price: item.product.price,
        },
        quantity: item.quantity,
      })),
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
    };
    const response = await client.post('/orders', payload);
    return response.data.data;
  },

  // Получить заказы пользователя
  getUserOrders: async (): Promise<any[]> => {
    const response = await client.get('/orders/user');
    return response.data;
  },

  // Обновить статус заказа (админ)
  updateStatusAdmin: async (id: number, status: string): Promise<any> => {
    const response = await client.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
};

