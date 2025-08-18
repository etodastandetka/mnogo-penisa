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
    const response = await client.post('/auth/login', data);
    const r = response.data;
    // Бэкенд возвращает { success, data: { user, token } }
    const user = r?.data?.user || r?.user;
    const token = r?.data?.token || r?.token;
    return {
      access_token: token,
      user,
    };
  },

  // Регистрация
  register: async (data: RegisterRequest): Promise<NormalizedAuthResponse> => {
    const response = await client.post('/auth/register', data);
    const r = response.data;
    const user = r?.data?.user || r?.user;
    const token = r?.data?.token || r?.token;
    return {
      access_token: token,
      user,
    };
  },

  // Получить профиль пользователя
  getProfile: async (): Promise<any> => {
    const response = await client.get('/user/me');
    return response.data;
  },
};
