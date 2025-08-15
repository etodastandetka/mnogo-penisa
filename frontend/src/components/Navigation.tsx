import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { useGuestOrderStore } from '../store/guestOrderStore';
import { OrderStatus } from './OrderStatus';
import { OrderNotification } from './OrderNotification';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const { user, token, isAuthenticated, logout } = useUserStore();
  const { orders: guestOrders } = useGuestOrderStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderStatusOpen, setOrderStatusOpen] = useState(false);
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Проверяем, есть ли активные заказы для показа уведомления
  useEffect(() => {
    const checkActiveOrders = async () => {
      if (isAuthenticated && token) {
        try {
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
        } catch (error) {
          console.error('Ошибка загрузки заказов:', error);
        }
      } else if (guestOrders.length > 0) {
        const latestOrder = guestOrders[0];
        const hasActiveOrder = latestOrder.status !== 'completed' && latestOrder.status !== 'cancelled';
        setShowOrderNotification(hasActiveOrder);
      }
    };

    checkActiveOrders();
  }, [isAuthenticated, token, guestOrders]);

  const isMenuPage = location.pathname === '/menu';
  const isLandingPage = location.pathname === '/';
  const isContactPage = location.pathname === '/contact';

  return (
    <nav className={`bg-white shadow-soft sticky top-0 z-50 ${showOrderNotification ? 'top-16' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-xl md:text-2xl font-bold text-red-600">
              Mnogo Rolly
              <span className="text-xs md:text-sm font-normal text-gray-500 ml-2">🍣</span>
            </h1>
          </div>
          
          {/* Навигационные ссылки - десктоп */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                isLandingPage 
                  ? 'text-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Главная
            </button>
            <button
              onClick={() => navigate('/menu')}
              className={`text-sm font-medium transition-colors ${
                isMenuPage 
                  ? 'text-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Меню
            </button>
            <button
              onClick={() => navigate('/contact')}
              className={`text-sm font-medium transition-colors ${
                isContactPage 
                  ? 'text-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Контакты
            </button>
          </div>
          
          {/* Корзина и кнопки */}
          <div className="flex items-center gap-4">
            {/* Статус заказа */}
            <Button
              variant="outline"
              onClick={() => setOrderStatusOpen(true)}
              className="hidden sm:flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden md:block">Статус заказа</span>
            </Button>

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
                    className="absolute -top-2 -right-2 bg-red-500"
                  >
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            )}

            {/* Кнопки авторизации */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Привет, {user?.name}!
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="text-gray-700 hover:text-red-600"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-gray-700 hover:text-red-600"
              >
                <User className="w-4 h-4 mr-2" />
                Войти
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                isLandingPage 
                  ? 'bg-red-50 text-red-600' 
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
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                isMenuPage 
                  ? 'bg-red-50 text-red-600' 
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
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                isContactPage 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Контакты
            </button>
            <button
              onClick={() => {
                setOrderStatusOpen(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-4 h-4 inline mr-2" />
              Статус заказа
            </button>

            {/* Разделитель */}
            <div className="border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Привет, {user?.name}!
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
                  className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно статуса заказа */}
      <OrderStatus 
        isOpen={orderStatusOpen} 
        onClose={() => setOrderStatusOpen(false)} 
      />

      {/* Уведомление о заказе */}
      {showOrderNotification && (
        <OrderNotification onClose={() => setShowOrderNotification(false)} />
      )}
    </nav>
  );
};
