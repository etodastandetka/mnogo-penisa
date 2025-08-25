import { apiClient } from './client';

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

export interface OrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_address?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status?: string;
  created_at: string;
  payment_proof?: string;
  payment_proof_date?: string;
  notes?: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    product_id?: number;
  }>;
}

export interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const getStats = async (): Promise<AdminStats> => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения статистики:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения статистики');
  }
};

export const getOrders = async (filters?: OrderFilters): Promise<AdminOrder[]> => {
  try {
    const response = await apiClient.get('/admin/orders', { params: filters });
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка получения заказов:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения заказов');
  }
};

export const getOrder = async (id: number): Promise<OrderDetail> => {
  try {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения заказа');
  }
};

export const updateOrderStatus = async (id: number, status: string): Promise<AdminOrder> => {
  try {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка обновления статуса заказа:', error);
    throw new Error(error.response?.data?.message || 'Ошибка обновления статуса');
  }
};

export const getAnalytics = async (period: string = 'week'): Promise<any> => {
  try {
    const response = await apiClient.get(`/admin/analytics?period=${period}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка получения аналитики:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения аналитики');
  }
};

export const getCustomers = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/admin/customers');
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка получения клиентов:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения клиентов');
  }
};

export const getProducts = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/admin/products');
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка получения товаров:', error);
    throw new Error(error.response?.data?.message || 'Ошибка получения товаров');
  }
};

export const createProduct = async (productData: any): Promise<any> => {
  try {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка создания товара:', error);
    throw new Error(error.response?.data?.message || 'Ошибка создания товара');
  }
};

export const updateProduct = async (id: string, productData: any): Promise<any> => {
  try {
    console.log('📤 API: Отправляем запрос на обновление товара:', { id, productData });
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    console.log('✅ API: Ответ от сервера:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ API: Ошибка обновления товара:', error);
    console.error('❌ API: Детали ошибки:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 404) {
      throw new Error('Товар не найден');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Неверные данные товара');
    } else if (error.response?.status === 500) {
      throw new Error('Ошибка сервера при обновлении товара');
    } else {
      throw new Error(error.response?.data?.message || 'Ошибка обновления товара');
    }
  }
};

export const deleteProduct = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка удаления товара:', error);
    throw new Error(error.response?.data?.message || 'Ошибка удаления товара');
  }
};


