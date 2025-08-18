import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, X, QrCode } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useUserStore } from '../store/userStore';

import { ordersApi } from '../api/orders';

interface Order {
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

interface OrderNotificationProps {
  onClose: () => void;
}

export const OrderNotification: React.FC<OrderNotificationProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchLatestOrder = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

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
        return 'Доставляется';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const handleViewDetails = () => {
    if (user) {
      navigate('/profile');
    } else {
      onClose();
    }
  };

  if (loading || !latestOrder) {
    return null;
  }

  if (latestOrder.status === 'delivered' || latestOrder.status === 'cancelled') {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Статус заказа</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <span className="text-sm text-gray-600">
                  Заказ {latestOrder.orderNumber}
                </span>
                <Badge className={`${getStatusColor(latestOrder.status)} flex items-center space-x-1 w-fit`}>
                  {getStatusIcon(latestOrder.status)}
                  <span className="hidden sm:inline">{getStatusText(latestOrder.status)}</span>
                  <span className="sm:hidden">{getStatusText(latestOrder.status).split(' ')[0]}</span>
                </Badge>
                <span className="text-sm font-medium text-gray-900">
                  {latestOrder.totalAmount} сом
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={handleViewDetails}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Подробнее</span>
                <span className="sm:hidden">Детали</span>
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Закрыть</span>
              </Button>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};
