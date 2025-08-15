import { client } from './client';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularProducts: Array<{
    id: number;
    name: string;
    salesCount: number;
  }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
}

export interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const adminApi = {
  // Получить статистику для дашборда
  getStats: async (): Promise<AdminStats> => {
    const response = await client.get('/admin/stats');
    return response.data;
  },

  // Получить все заказы с фильтрами
  getOrders: async (filters?: OrderFilters): Promise<AdminOrder[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const url = `/admin/orders?${params.toString()}`;
    console.log('API запрос заказов:', url);
    const response = await client.get(url);
    console.log('API ответ заказов:', response.data);
    return response.data;
  },

  // Получить заказ по ID
  getOrder: async (id: number): Promise<AdminOrder> => {
    const response = await client.get(`/admin/orders/${id}`);
    return response.data;
  },

  // Обновить статус заказа
  updateOrderStatus: async (id: number, status: string): Promise<AdminOrder> => {
    const response = await client.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // Получить аналитику
  getAnalytics: async (period: string = 'week'): Promise<any> => {
    const response = await client.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Получить клиентов
  getCustomers: async (): Promise<any[]> => {
    const response = await client.get('/admin/customers');
    return response.data;
  },

  // Получить товары
  getProducts: async (): Promise<any[]> => {
    const response = await client.get('/admin/products');
    return response.data;
  },

  // Удалить товар
  deleteProduct: async (id: number): Promise<any> => {
    const response = await client.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Создать товар
  createProduct: async (productData: any): Promise<any> => {
    const response = await client.post('/admin/products', productData);
    return response.data;
  },

  // Обновить товар
  updateProduct: async (id: number, productData: any): Promise<any> => {
    const response = await client.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  // Telegram бот
  testTelegramBot: async (): Promise<any> => {
    const response = await client.post('/admin/test-telegram');
    return response.data;
  },

  getTelegramInfo: async (): Promise<any> => {
    const response = await client.get('/admin/telegram-info');
    return response.data;
  },
};
