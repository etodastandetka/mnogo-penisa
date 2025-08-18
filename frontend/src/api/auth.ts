import { client } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface NormalizedAuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    isAdmin?: boolean;
  };
}

export const authApi = {
  // Вход в систему
  login: async (data: LoginRequest): Promise<NormalizedAuthResponse> => {
    try {
      console.log('🔐 Попытка входа для:', data.email);
      const response = await client.post('/auth/login', data);
      console.log('✅ Ответ сервера:', response.data);
      
      const r = response.data;
      
      // Проверяем структуру ответа
      if (!r.success) {
        throw new Error(r.message || 'Ошибка входа');
      }
      
      // Бэкенд возвращает { success, data: { user, token } }
      const user = r?.data?.user || r?.user;
      const token = r?.data?.token || r?.token;
      
      if (!user || !token) {
        throw new Error('Неверный формат ответа сервера');
      }
      
      console.log('✅ Вход выполнен успешно для пользователя:', user.name);
      
      return {
        access_token: token,
        user,
      };
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error);
      
      if (error.response) {
        // Ошибка от сервера
        const errorMessage = error.response.data?.message || 'Ошибка сервера';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Ошибка сети
        throw new Error('Ошибка соединения с сервером');
      } else {
        // Другая ошибка
        throw new Error(error.message || 'Неизвестная ошибка');
      }
    }
  },

  // Регистрация
  register: async (data: RegisterRequest): Promise<NormalizedAuthResponse> => {
    try {
      console.log('📝 Попытка регистрации для:', data.email);
      const response = await client.post('/auth/register', data);
      console.log('✅ Ответ сервера:', response.data);
      
      const r = response.data;
      
      // Проверяем структуру ответа
      if (!r.success) {
        throw new Error(r.message || 'Ошибка регистрации');
      }
      
      const user = r?.data?.user || r?.user;
      const token = r?.data?.token || r?.token;
      
      if (!user || !token) {
        throw new Error('Неверный формат ответа сервера');
      }
      
      console.log('✅ Регистрация выполнена успешно для пользователя:', user.name);
      
      return {
        access_token: token,
        user,
      };
    } catch (error: any) {
      console.error('❌ Ошибка регистрации:', error);
      
      if (error.response) {
        // Ошибка от сервера
        const errorMessage = error.response.data?.message || 'Ошибка сервера';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Ошибка сети
        throw new Error('Ошибка соединения с сервером');
      } else {
        // Другая ошибка
        throw new Error(error.message || 'Неизвестная ошибка');
      }
    }
  },

  // Получить профиль пользователя
  getProfile: async (): Promise<any> => {
    try {
      const response = await client.get('/user/me');
      return response.data;
    } catch (error: any) {
      console.error('❌ Ошибка получения профиля:', error);
      throw error;
    }
  },
};
