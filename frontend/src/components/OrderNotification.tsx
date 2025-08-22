import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Package, Clock } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { ordersApi } from '../api/orders';

interface OrderNotificationProps {
  onClose: () => void;
}

interface OrderNotificationOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: any[];
  createdAt: string;
}

export const OrderNotification: React.FC<OrderNotificationProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [latestOrder, setLatestOrder] = useState<OrderNotificationOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      // Проверяем гостевые заказы из разных источников
      const guestOrdersFromStorage = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      const guestOrdersFromZustand = JSON.parse(localStorage.getItem('mnogo-rolly-guest-orders') || '{"state":{"orders":[]}}');
      const zustandOrders = guestOrdersFromZustand.state?.orders || [];
      
      console.log('🔍 OrderNotification: Поиск заказов:', {
        user: !!user,
        fromStorage: guestOrdersFromStorage.length,
        fromZustand: zustandOrders.length
      });
      
      if (user) {
        // Для авторизованных пользователей
        try {
          const orders = await ordersApi.getUserOrders();
          if (orders && orders.length > 0) {
            const latest = orders[0];
            setLatestOrder(latest);
          }
        } catch (error) {
          console.error('Ошибка получения заказов:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Объединяем все гостевые заказы
        const allGuestOrders = [...guestOrdersFromStorage, ...zustandOrders];
        
        if (allGuestOrders.length > 0) {
          // Берем самый последний заказ
          const latest = allGuestOrders.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          
          console.log('✅ OrderNotification: Найден гостевой заказ:', latest);
          setLatestOrder(latest);
        } else {
          console.log('❌ OrderNotification: Нет гостевых заказов');
        }
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivering':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'delivering':
        return '🚚';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения';
      case 'confirmed':
        return 'Подтвержден';
      case 'preparing':
        return 'Готовится';
      case 'delivering':
        return 'В доставке';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            <span className="text-sm sm:text-base text-gray-600">Загрузка заказа...</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!latestOrder) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm safe-area-inset-top">
      <div className="flex items-center justify-between p-3 sm:p-4 max-w-full">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                Заказ #{latestOrder.orderNumber}
              </span>
              <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(latestOrder.status)}`}>
                <span className="mr-0.5 sm:mr-1">{getStatusIcon(latestOrder.status)}</span>
                <span className="hidden sm:inline">{getStatusText(latestOrder.status)}</span>
                <span className="sm:hidden">{getStatusText(latestOrder.status).split(' ')[0]}</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {new Date(latestOrder.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => user ? navigate('/profile') : navigate('/')}
            className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors px-1 sm:px-2 py-1"
          >
            <span className="hidden sm:inline">Подробнее</span>
            <span className="sm:hidden">→</span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
