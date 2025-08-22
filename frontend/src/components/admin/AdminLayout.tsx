import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { AdminNavigation } from './AdminNavigation';
import { Menu, X, BarChart3 } from 'lucide-react';
import { getTodayStats, TodayStats } from '../../api/stats';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/');
  };

  const handleNavigationClick = () => {
    // Закрываем мобильное меню при клике на пункт навигации с небольшой задержкой
    setTimeout(() => {
      setSidebarOpen(false);
    }, 100);
  };

  // Функция для загрузки статистики за сегодня
  const fetchTodayStats = async () => {
    setStatsLoading(true);
    try {
      const response = await getTodayStats();
      setTodayStats(response.stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики за сегодня:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Загружаем статистику при монтировании компонента
  useEffect(() => {
    fetchTodayStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Мобильная навигация */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍣</span>
              <span className="text-lg font-semibold text-gray-900">Mnogo Rolly</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <AdminNavigation onLogout={handleLogout} onNavigationClick={handleNavigationClick} />
        </div>
      </div>

      {/* Десктопная навигация */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminNavigation onLogout={handleLogout} onNavigationClick={handleNavigationClick} />
      </div>

      {/* Основной контент */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Верхняя панель */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900">
                Админ-панель
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Статистика за сегодня */}
              <div className="flex items-center space-x-3">
                {statsLoading ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <BarChart3 className="w-4 h-4 animate-pulse" />
                    <span>Загрузка...</span>
                  </div>
                ) : todayStats ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Сегодня</span>
                      <span className="text-xs text-blue-600">
                        {todayStats.total_orders} заказов
                      </span>
                      <span className="text-xs text-blue-600">
                        {todayStats.total_revenue.toLocaleString()} сом
                      </span>
                    </div>
                    <button
                      onClick={fetchTodayStats}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Обновить</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Статистика недоступна</span>
                    </div>
                    <button
                      onClick={fetchTodayStats}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Загрузить</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-700">
                Добро пожаловать, <span className="font-medium text-indigo-600">{user?.name || 'Администратор'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
