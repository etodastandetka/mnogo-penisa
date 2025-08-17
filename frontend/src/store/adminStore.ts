import { create } from 'zustand';
import { getStats, getProducts, createProduct, updateProduct, deleteProduct } from '../api/admin';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminStore {
  // Статистика
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  
  // Продукты
  products: any[];
  productsLoading: boolean;
  productsError: string | null;
  
  // Пользователи
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  
  // Действия
  fetchStats: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  createProduct: (productData: any) => Promise<void>;
  updateProduct: (id: string, productData: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  clearError: () => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Начальное состояние
  stats: null,
  loading: false,
  error: null,
  
  products: [],
  productsLoading: false,
  productsError: null,
  
  users: [],
  usersLoading: false,
  usersError: null,

  // Получить статистику
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await getStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка загрузки статистики',
        loading: false 
      });
    }
  },

  // Получить продукты
  fetchProducts: async () => {
    set({ productsLoading: true, productsError: null });
    try {
      const products = await getProducts();
      set({ products, productsLoading: false });
    } catch (error) {
      set({ 
        productsError: error instanceof Error ? error.message : 'Ошибка загрузки продуктов',
        productsLoading: false 
      });
    }
  },

  // Создать продукт
  createProduct: async (productData: any) => {
    try {
      await createProduct(productData);
      // Обновляем список продуктов
      get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },

  // Обновить продукт
  updateProduct: async (id: string, productData: any) => {
    try {
      await updateProduct(id, productData);
      // Обновляем список продуктов
      get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },

  // Удалить продукт
  deleteProduct: async (id: string) => {
    try {
      await deleteProduct(id);
      // Обновляем список продуктов
      get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },



  // Очистить ошибку
  clearError: () => {
    set({ error: null });
  },
}));
