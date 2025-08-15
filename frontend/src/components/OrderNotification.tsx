import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Package, X, QrCode } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { PaymentQR } from './PaymentQR';
import { PrintReceipt } from './PrintReceipt';

interface OrderNotificationProps {
  onClose: () => void;
}

export const OrderNotification: React.FC<OrderNotificationProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, token } = useUserStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Ошибка загрузки заказов:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Получаем последний заказ
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'delivering': return '🚚';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'preparing': return 'Готовится';
      case 'delivering': return 'Доставляется';
      case 'completed': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const handleViewDetails = () => {
    if (user) {
      navigate('/profile');
    } else {
      // Для гостей можно добавить логику открытия модального окна
      // Пока просто закрываем уведомление
      onClose();
    }
  };

  // Если нет заказов или загрузка, не показываем уведомление
  if (loading || !latestOrder) {
    return null;
  }

  // Показываем уведомление только для активных заказов (не завершенных и не отмененных)
  if (latestOrder.status === 'completed' || latestOrder.status === 'cancelled') {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Статус заказа</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Заказ {latestOrder.orderNumber}
                </span>
                <Badge className={`${getStatusColor(latestOrder.status)} flex items-center space-x-1`}>
                  {getStatusIcon(latestOrder.status)}
                  <span>{getStatusText(latestOrder.status)}</span>
                </Badge>
                <span className="text-sm font-medium text-gray-900">
                  {latestOrder.totalAmount} сом
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <PrintReceipt order={latestOrder} onClose={() => {}} />
              {latestOrder.status === 'pending' && (
                <Button
                  onClick={() => setShowPayment(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Оплатить
                </Button>
              )}
              <Button
                onClick={handleViewDetails}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Подробнее
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно оплаты */}
      {showPayment && latestOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentQR
            order={latestOrder}
            onPaymentComplete={() => {
              setShowPayment(false);
              onClose();
            }}
            onClose={() => setShowPayment(false)}
          />
        </div>
      )}
    </>
  );
};
