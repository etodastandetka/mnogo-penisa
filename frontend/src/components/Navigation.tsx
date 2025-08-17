import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { useGuestOrderStore } from '../store/guestOrderStore';

import { OrderNotification } from './OrderNotification';
import { AdminPanelButton } from './AdminPanelButton';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const { user, isAdmin, clearUser } = useUserStore();
  const { orders: guestOrders } = useGuestOrderStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Проверяем, есть ли активные заказы для показа уведомления
  useEffect(() => {
    const checkActiveOrders = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await fetch('http://localhost:3001/api/orders/user', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const orders = await response.json();
              setUserOrders(orders);
              
              if (orders.length > 0) {
                const latestOrder = orders[0];
                const hasActiveOrder = latestOrder.status !== 'completed' && latestOrder.status !== 'cancelled';
                setShowOrderNotification(hasActiveOrder);
              }
            }
          }
        } catch (error) {
          }
      } else if (guestOrders.length > 0) {
        const latestOrder = guestOrders[0];
        const hasActiveOrder = latestOrder.status !== 'completed' && latestOrder.status !== 'cancelled';
        setShowOrderNotification(hasActiveOrder);
      }
    };

    checkActiveOrders();
  }, [user, guestOrders]);

  const isMenuPage = location.pathname === '/menu';
  const isLandingPage = location.pathname === '/';
  const isContactPage = location.pathname === '/contact';

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Очищаем store пользователя
    clearUser();
    // Перенаправляем на главную страницу
    navigate('/');
  };

  return (
    <>
      {/* Уведомление о заказе */}
      {showOrderNotification && (
        <OrderNotification onClose={() => setShowOrderNotification(false)} />
      )}

      {/* Основной header - статичный */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Логотип */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                Mnogo Rolly
                <span className="text-xs md:text-sm lg:text-base font-normal text-gray-500 ml-2">🍣</span>
              </h1>
            </div>
            
            {/* Навигационные ссылки - десктоп */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => navigate('/')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-300 hover:text-red-600 ${
                  isLandingPage 
                    ? 'text-red-600' 
                    : 'text-gray-700'
                }`}
              >
                Главная
                {isLandingPage && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => navigate('/menu')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-300 hover:text-red-600 ${
                  isMenuPage 
                    ? 'text-red-600' 
                    : 'text-gray-700'
                }`}
              >
                Меню
                {isMenuPage && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"></div>
                )}
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                className={`relative text-sm lg:text-base font-medium transition-all duration-300 hover:text-red-600 ${
                  isContactPage 
                    ? 'text-red-600' 
                    : 'text-gray-700'
                }`}
              >
                Контакты
                {isContactPage && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600 rounded-full"></div>
                )}
              </button>
            </nav>
            
            {/* Правая часть - кнопки и пользователь */}
            <div className="flex items-center gap-3 lg:gap-4">
              


              {/* Корзина на странице меню */}
              {isMenuPage && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/checkout')}
                  className="relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="absolute -top-2 -right-2 bg-red-500 text-white"
                    >
                      {getItemCount()}
                    </Badge>
                  )}
                </Button>
              )}

                          {/* Пользователь */}
            {user ? (
                <div className="flex items-center gap-2">
                  {/* Кнопка админ панели */}
                  <AdminPanelButton />
                  
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Привет, {user?.name || 'Пользователь'}!
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:block">Войти</span>
                </Button>
              )}
              
              {/* Мобильное меню кнопка */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              
              {/* Навигация */}
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  isLandingPage 
                    ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Главная
              </button>
              
              <button
                onClick={() => {
                  navigate('/menu');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  isMenuPage 
                    ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Меню
              </button>
              
              <button
                onClick={() => {
                  navigate('/contact');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  isContactPage 
                    ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Контакты
              </button>



              {/* Разделитель */}
              <div className="border-t border-gray-200 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Привет, {user?.name || 'Пользователь'}!
                    </div>
                    
                    {/* Кнопка админ панели в мобильном меню */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold transition-colors"
                      >
                        🛠️ Админ панель
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Профиль
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Выйти
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Войти
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>


    </>
  );
};
