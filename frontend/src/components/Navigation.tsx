import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getUserOrders } from '../api/orders';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogOut, 
  Package,
  Clock
} from 'lucide-react';
import { Button } from './ui/Button';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState(0);
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkActiveOrders = async () => {
      if (user) {
        try {
          const orders = await getUserOrders();
          const active = orders.filter((order: any) => 
            order.status === 'pending' || 
            order.status === 'preparing' || 
            order.status === 'delivering'
          ).length;
          setActiveOrders(active);
        } catch (error) {
          console.error('❌ Ошибка проверки активных заказов:', error);
        }
      }
    };

    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 30000); // Проверяем каждые 30 секунд

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMenu();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/')}
              className="flex-shrink-0 flex items-center"
            >
              <span className="text-2xl font-bold text-orange-600">🍣</span>
              <span className="ml-2 text-xl font-bold text-gray-800">Mnogo Rolly</span>
            </button>
          </div>

          {/* Десктопное меню */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleNavigation('/menu')}
              className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Меню
            </button>
            
            <button
              onClick={() => handleNavigation('/contact')}
              className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Контакты
            </button>
            
            <button
              onClick={() => handleNavigation('/checkout')}
              className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {activeOrders > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeOrders}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </button>
                
                {user.isAdmin && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Админ
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('/auth')}
                className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Войти
              </button>
            )}
          </div>

          {/* Мобильное меню кнопка */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-orange-600 p-2 rounded-md"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <button
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-orange-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Меню
            </button>
            
            <button
              onClick={() => handleNavigation('/contact')}
              className="text-gray-700 hover:text-orange-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Контакты
            </button>
            
            <button
              onClick={() => handleNavigation('/checkout')}
              className="text-gray-700 hover:text-orange-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center justify-between"
            >
              <span>Корзина</span>
              {activeOrders > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeOrders}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="text-gray-700 hover:text-orange-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </button>
                
                {user.isAdmin && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="bg-orange-600 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Админ панель
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation('/auth')}
                className="bg-orange-600 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
