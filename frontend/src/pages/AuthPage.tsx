import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { login, register } from '../api/auth';
import { useUserStore } from '../store/userStore';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUserStore();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await login(credentials);
      
      console.log('🔧 Login response:', response);
      
      if (!response) {
        throw new Error('Неверный ответ от сервера');
      }
      
      // Проверяем разные варианты ответа
      const accessToken = response.access_token;
      const userData = response.user || response;
      
      if (!accessToken) {
        throw new Error('Токен не получен');
      }
      
      if (!userData || !userData.id) {
        throw new Error('Данные пользователя не получены');
      }
      
      localStorage.setItem('token', accessToken);
      setUser({
        id: userData.id.toString(),
        name: userData.name || 'Пользователь',
        phone: userData.phone || '',
        email: userData.email || ''
      });
      
      // Перенаправляем на главную страницу
      window.location.href = '/';
    } catch (err: any) {
      console.error('❌ Ошибка входа:', err);
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await register(userData);
      
      console.log('🔧 Register response:', response);
      
      if (!response) {
        throw new Error('Неверный ответ от сервера');
      }
      
      const accessToken = response.access_token;
      const userInfo = response.user || response;
      
      if (!accessToken) {
        throw new Error('Токен не получен');
      }
      
      if (!userInfo || !userInfo.id) {
        throw new Error('Данные пользователя не получены');
      }
      
      localStorage.setItem('token', accessToken);
      setUser({
        id: userInfo.id.toString(),
        name: userInfo.name || 'Пользователь',
        phone: userInfo.phone || '',
        email: userInfo.email || ''
      });
      
      // Перенаправляем на главную страницу
      window.location.href = '/';
    } catch (err: any) {
      console.error('❌ Ошибка регистрации:', err);
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
            loading={loading}
            error={error || undefined}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
            loading={loading}
            error={error || undefined}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;




