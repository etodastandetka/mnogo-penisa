import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { authApi } from '../api/auth';
import { getUserInfo } from '../api/user';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Начинаем процесс входа...');
      const result = await authApi.login(credentials);
      
      // Сохраняем данные в store
      setUser({
        id: result.user.id.toString(),
        name: result.user.name,
        phone: result.user.phone || '', // Будет заполнено позже
        email: result.user.email
      });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', result.access_token);
      console.log('✅ Токен сохранен в localStorage');
      
      // Принудительно обновляем информацию о пользователе с сервера
      try {
        console.log('🔄 Получаем дополнительную информацию о пользователе...');
        const userInfo = await getUserInfo();
        setUser(userInfo);
        console.log('✅ Информация о пользователе обновлена');
      } catch (error) {
        console.warn('⚠️ Не удалось получить дополнительную информацию о пользователе:', error);
        // Игнорируем ошибку, если не удалось получить дополнительную информацию
      }
      
      // Перенаправляем на главную страницу
      console.log('🚀 Перенаправляем на главную страницу...');
      navigate('/');
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error);
      setError(error.message || 'Ошибка входа. Проверьте email и пароль.');
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
    setLoading(true);
    setError('');

    try {
      console.log('📝 Начинаем процесс регистрации...');
      const result = await authApi.register(userData);
      
      // Сохраняем данные в store
      setUser({
        id: result.user.id.toString(),
        name: result.user.name,
        phone: userData.phone,
        email: result.user.email
      });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', result.access_token);
      console.log('✅ Токен сохранен в localStorage');
      
      // Перенаправляем на главную страницу
      console.log('🚀 Перенаправляем на главную страницу...');
      navigate('/');
    } catch (error: any) {
      console.error('❌ Ошибка регистрации:', error);
      setError(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-orange-200 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {isLogin ? (
          <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setIsLogin(false)} loading={loading} error={error} />
        ) : (
          <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setIsLogin(true)} loading={loading} error={error} />
        )}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // Очищаем ошибки при переключении
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {isLogin ? 'Не зарегистрированы?' : 'Уже есть аккаунт?'}
          </button>
        </div>
      </div>
    </div>
  );
};




