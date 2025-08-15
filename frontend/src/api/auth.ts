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

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const authApi = {
  // Вход в систему
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/login', data);
    return response.data;
  },

  // Регистрация
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  // Получить профиль пользователя
  getProfile: async (): Promise<User> => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};
