import { create } from 'zustand';
import { adminApi, AdminStats, AdminOrder, OrderFilters } from '../api/admin';

interface AdminState {
  // Состояние
  stats: AdminStats | null;
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  loading: boolean;
  error: string | null;

  // Действия
  fetchStats: () => Promise<void>;
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  setSelectedOrder: (order: AdminOrder | null) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Начальное состояние
  stats: null,
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,

  // Получить статистику
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await adminApi.getStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки статистики',
        loading: false 
      });
    }
  },

  // Получить заказы
  fetchOrders: async (filters) => {
    set({ loading: true, error: null });
    try {
      const orders = await adminApi.getOrders(filters);
      set({ orders, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказов',
        loading: false 
      });
    }
  },

  // Получить заказ по ID
  fetchOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const order = await adminApi.getOrder(id);
      set({ selectedOrder: order, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказа',
        loading: false 
      });
    }
  },

  // Обновить статус заказа
  updateOrderStatus: async (id, status) => {
    set({ loading: true });
    try {
      const updatedOrder = await adminApi.updateOrderStatus(id, status);
      
      // Обновляем заказ в списке
      const { orders } = get();
      const updatedOrders = orders.map(order => 
        order.id === id ? updatedOrder : order
      );
      
      set({ 
        orders: updatedOrders,
        selectedOrder: updatedOrder,
        loading: false 
      });
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
      // Не устанавливаем глобальную ошибку, чтобы не ломать интерфейс
      set({ loading: false });
      throw error; // Пробрасываем ошибку для обработки в компоненте
    }
  },

  // Установить выбранный заказ
  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
  },

  // Очистить ошибку
  clearError: () => {
    set({ error: null });
  },
}));
