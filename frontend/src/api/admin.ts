import { client } from './client';
import { User } from '../types';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  totalProducts: number;
  totalUsers: number;
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
  paymentProof?: string;
  paymentProofDate?: string;
  notes?: string;
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

// Получить статистику для дашборда
export const getStats = async (): Promise<AdminStats> => {
  const response = await client.get('/admin/stats');
  return response.data;
};

// Получить все заказы с фильтрами
export const getOrders = async (filters?: OrderFilters): Promise<AdminOrder[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.search) params.append('search', filters.search);

  const url = `/admin/orders?${params.toString()}`;
  const response = await client.get(url);
  return response.data;
};

// Получить заказ по ID
export const getOrder = async (id: number): Promise<AdminOrder> => {
  const response = await client.get(`/admin/orders/${id}`);
  return response.data;
};

// Обновить статус заказа
export const updateOrderStatus = async (id: number, status: string): Promise<AdminOrder> => {
  const response = await client.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// Получить аналитику
export const getAnalytics = async (period: string = 'week'): Promise<any> => {
  const response = await client.get(`/admin/analytics?period=${period}`);
  return response.data;
};

// Получить клиентов
export const getCustomers = async (): Promise<any[]> => {
  const response = await client.get('/admin/customers');
  return response.data;
};

// Получить товары
export const getProducts = async (): Promise<any[]> => {
  const response = await client.get('/admin/products');
  return response.data;
};

// Создать товар
export const createProduct = async (productData: any): Promise<any> => {
  const response = await client.post('/admin/products', productData);
  return response.data;
};

// Обновить товар
export const updateProduct = async (id: string, productData: any): Promise<any> => {
  const response = await client.put(`/admin/products/${id}`, productData);
  return response.data;
};

// Удалить товар
export const deleteProduct = async (id: string): Promise<any> => {
  const response = await client.delete(`/admin/products/${id}`);
  return response.data;
};


