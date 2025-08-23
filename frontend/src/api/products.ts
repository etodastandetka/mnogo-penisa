import { Product, ProductCategory } from '../types';
import { client } from './client';

export const productsApi = {
  // Получить все продукты
  getAll: async (): Promise<Product[]> => {
    try {
      console.log('🔍 Запрос товаров...');
      const response = await client.get('/products');
      console.log('✅ Получено товаров:', response.data?.length || 0);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('❌ Неверный формат ответа:', response.data);
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки товаров:', error);
      
      // Детальная диагностика для iPhone
      if (error.code === 'ERR_NETWORK') {
        console.log('🌐 Ошибка сети - возможно проблемы с соединением');
        throw new Error('Ошибка соединения с сервером. Проверьте интернет-соединение');
      }
      
      // Если это ошибка сети, возвращаем пустой массив
      if (!error.response && error.request) {
        console.log('📡 Ошибка запроса - нет ответа от сервера');
        throw new Error('Сервер не отвечает. Проверьте соединение с интернетом');
      }
      
      // Если это ошибка сервера
      if (error.response?.status >= 500) {
        console.log('🖥️ Ошибка сервера:', error.response.status);
        throw new Error('Ошибка сервера. Попробуйте позже');
      }
      
      // Если это ошибка клиента
      if (error.response?.status >= 400) {
        console.log('📱 Ошибка клиента:', error.response.status);
        throw new Error('Ошибка запроса данных');
      }
      
      // Если это таймаут
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Таймаут запроса');
        throw new Error('Превышено время ожидания ответа от сервера');
      }
      
      // Если это ошибка CORS (часто на iPhone)
      if (error.message && error.message.includes('CORS')) {
        console.log('🚫 Ошибка CORS');
        throw new Error('Ошибка доступа к серверу. Попробуйте обновить страницу');
      }
      
      throw new Error(error.message || 'Неизвестная ошибка при загрузке товаров');
    }
  },

  // Получить продукты по категории
  getByCategory: async (category: ProductCategory): Promise<Product[]> => {
    try {
      console.log('🔍 Запрос товаров категории:', category);
      const response = await client.get(`/products?category=${category}`);
      console.log('✅ Получено товаров категории', category, ':', response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Ошибка загрузки товаров по категории:', error);
      
      if (!error.response && error.request) {
        throw new Error('Ошибка соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка загрузки товаров по категории');
    }
  },

  // Получить популярные продукты
  getPopular: async (): Promise<Product[]> => {
    try {
      console.log('🔍 Запрос популярных товаров...');
      const response = await client.get('/products');
      // Возвращаем первые 6 товаров как популярные
      const popularProducts = (response.data || []).slice(0, 6);
      console.log('✅ Получено популярных товаров:', popularProducts.length);
      return popularProducts;
    } catch (error: any) {
      console.error('❌ Ошибка загрузки популярных товаров:', error);
      
      if (!error.response && error.request) {
        throw new Error('Ошибка соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка загрузки популярных товаров');
    }
  },

  // Получить продукт по ID
  getById: async (id: string): Promise<Product> => {
    try {
      console.log('🔍 Запрос товара по ID:', id);
      const response = await client.get(`/products/${id}`);
      console.log('✅ Товар найден:', response.data?.name);
      return response.data;
    } catch (error: any) {
      console.error('❌ Ошибка загрузки товара по ID:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Товар не найден');
      }
      
      if (!error.response && error.request) {
        throw new Error('Ошибка соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  // Поиск продуктов
  search: async (query: string): Promise<Product[]> => {
    try {
      console.log('🔍 Поиск товаров:', query);
      const response = await client.get(`/products?search=${encodeURIComponent(query)}`);
      console.log('✅ Найдено товаров:', response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Ошибка поиска товаров:', error);
      
      if (!error.response && error.request) {
        throw new Error('Ошибка соединения с сервером');
      }
      
      throw new Error(error.message || 'Ошибка поиска товаров');
    }
  },
};
