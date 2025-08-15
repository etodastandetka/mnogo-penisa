import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminNavigation } from './AdminNavigation';
import { Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleNavigationClick = () => {
    // Закрываем мобильное меню при клике на пункт навигации с небольшой задержкой
    setTimeout(() => {
      setSidebarOpen(false);
    }, 100);
  };

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
                             <div className="text-sm text-gray-700">
                 Добро пожаловать, <span className="font-medium text-indigo-600">Администратор</span>
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
