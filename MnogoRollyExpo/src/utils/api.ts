import axios from 'axios';
import { Product, Order, User } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Добавляем токен к запросам
api.interceptors.request.use((config) => {
  // В React Native используем AsyncStorage вместо localStorage
  // const token = await AsyncStorage.getItem('user-token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
};

export const ordersApi = {
  create: (orderData: any) => api.post<Order>('/orders', orderData),
  createGuest: (orderData: any) => api.post<Order>('/orders/guest', orderData),
  getUserOrders: () => api.get<Order[]>('/orders/user'),
  getGuestOrder: (orderNumber: string) => api.get<Order>(`/orders/guest/${orderNumber}`),
  updateStatus: (orderId: number, status: string) => api.patch<Order>(`/orders/${orderId}/status`, { status }),
  getQrCode: (orderId: number) => api.get(`/orders/${orderId}/qr`),
  updatePayment: (orderId: number) => api.patch<Order>(`/orders/${orderId}/payment`),
};

export const authApi = {
  register: (userData: { name: string; email: string; phone: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/register', userData),
  login: (credentials: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', credentials),
  updateProfile: (userData: Partial<User>) => api.patch<User>('/user/profile', userData),
};

export default api;
