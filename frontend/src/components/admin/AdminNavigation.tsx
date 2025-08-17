import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface AdminNavigationProps {
  onLogout: () => void;
  onNavigationClick?: () => void;
}

const navigationItems = [
  { name: 'Дашборд', href: '/admin/dashboard', icon: TrendingUp },
  { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Настройки', href: '/admin/settings', icon: Settings },
];

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ onLogout, onNavigationClick }) => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      {/* Логотип */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍣</span>
          <span className="text-lg font-semibold text-gray-900">Mnogo Rolly</span>
        </div>
      </div>

      {/* Навигация */}
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onNavigationClick}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Кнопка выхода */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onNavigationClick?.();
              onLogout();
            }}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
};


