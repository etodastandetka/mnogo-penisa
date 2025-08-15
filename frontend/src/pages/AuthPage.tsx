import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useUserStore } from '../store/userStore';

type AuthMode = 'login' | 'register';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useUserStore();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (result.success) {
        // Сохраняем данные в store
        login(result.data.user, result.data.token);
        
        // Перенаправляем на главную страницу
        navigate('/');
      } else {
        setError(result.message || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Ошибка соединения с сервером');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (result.success) {
        // Сохраняем данные в store
        login(result.data.user, result.data.token);
        
        // Перенаправляем на главную страницу
        navigate('/');
      } else {
        setError(result.message || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      setError('Ошибка соединения с сервером');
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
        {mode === 'login' ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setMode('register')}
            loading={loading}
            error={error}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setMode('login')}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};




