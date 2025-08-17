import { Product, ProductCategory } from '../types';
import { client } from './client';

export const productsApi = {
  // Получить все продукты
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await client.get('/products');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Получить продукты по категории
  getByCategory: async (category: ProductCategory): Promise<Product[]> => {
    try {
      const response = await client.get(`/products?category=${category}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Получить популярные продукты
  getPopular: async (): Promise<Product[]> => {
    try {
      const response = await client.get('/products');
      // Возвращаем первые 6 товаров как популярные
      return response.data.slice(0, 6);
    } catch (error) {
      return [];
    }
  },

  // Получить продукт по ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await client.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Продукт не найден');
    }
  },

  // Поиск продуктов
  search: async (query: string): Promise<Product[]> => {
    try {
      const response = await client.get(`/products?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },
};
