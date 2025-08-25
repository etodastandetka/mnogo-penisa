import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const { user, isAdmin, fetchUserInfo, isLoading } = useUserStore();

  console.log('🔒 ProtectedRoute:', { user, isAdmin, isLoading, requireAdmin });



  useEffect(() => {
    // Если пользователь не загружен, пытаемся загрузить
    if (!user && !isLoading) {
      fetchUserInfo().catch(() => {
        // Если не удалось загрузить пользователя, перенаправляем на главную
        navigate('/');
      });
    }
  }, [user, isLoading, fetchUserInfo, navigate]);

  // Показываем загрузку пока проверяем права
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    );
  }

  // Если требуется админ и пользователь не админ
  if (requireAdmin && !isAdmin) {
    // Перенаправляем на главную страницу
    navigate('/');
    return null;
  }

  // Если пользователь не авторизован
  if (!user) {
    navigate('/');
    return null;
  }

  return <>{children}</>;
};
