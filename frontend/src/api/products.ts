import { Product } from '../types';
import { apiClient } from './client';

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log('🔄 Загружаем товары...');
    const response = await apiClient.get('/products');
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Загружено ${response.data.length} товаров`);
      return response.data;
    } else {
      console.warn('⚠️ Неожиданный формат ответа:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('❌ Ошибка загрузки товаров:', error);
    
    if (error.response) {
      console.error('🚨 Статус:', error.response.status);
      console.error('🚨 Данные:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Ошибка сети - возможно проблемы с соединением');
    } else {
      console.error('🚨 Ошибка:', error.message);
    }
    
    throw new Error('Ошибка соединения с сервером. Проверьте интернет-соединение');
  }
};

export const getProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка загрузки товара:', error);
    return null;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await apiClient.get(`/products/category/${category}`);
    return response.data || [];
  } catch (error: any) {
    console.error('❌ Ошибка загрузки товаров по категории:', error);
    return [];
  }
};
