import { apiClient } from './client';

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

export const login = async (credentials: LoginRequest): Promise<NormalizedAuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка входа:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Неверный email или пароль');
    } else if (error.response?.status >= 500) {
      throw new Error('Ошибка сервера. Попробуйте позже');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Ошибка соединения. Проверьте интернет');
    } else {
      throw new Error(error.response?.data?.message || 'Ошибка входа');
    }
  }
};

export const register = async (userData: RegisterRequest): Promise<NormalizedAuthResponse> => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка регистрации:', error);
    
    if (error.response?.status === 409) {
      throw new Error('Пользователь с таким email уже существует');
    } else if (error.response?.status >= 500) {
      throw new Error('Ошибка сервера. Попробуйте позже');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Ошибка соединения. Проверьте интернет');
    } else {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error: any) {
    console.error('❌ Ошибка выхода:', error);
    // Игнорируем ошибки при выходе
  }
};
