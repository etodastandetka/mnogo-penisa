import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Package, X, QrCode } from 'lucide-react';
import { PaymentQR } from './PaymentQR';
import { PrintReceipt } from './PrintReceipt';

interface OrderStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ isOpen, onClose }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Введите номер заказа');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`http://localhost:3001/api/orders/status/${orderNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        setError('Заказ не найден');
      } else {
        setError('Ошибка при поиске заказа');
      }
    } catch (error) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Статус заказа</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Поиск заказа */}
          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Введите номер заказа"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
              >
                {loading ? 'Поиск...' : 'Найти'}
              </Button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Результат поиска */}
          {order && (
            <div className="space-y-6">
              {/* Заголовок заказа */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Package className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Заказ #{order.orderNumber}
                    </h3>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex items-center space-x-2`}>
                    {getStatusIcon(order.status)}
                    <span>{getStatusText(order.status)}</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Дата заказа:</span>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Сумма:</span>
                    <p className="font-medium text-red-600">{order.totalAmount} сом</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Способ оплаты:</span>
                    <p className="font-medium">{order.paymentMethod === 'cash' ? 'Наличными' : 'Онлайн'}</p>
                  </div>
                </div>
              </div>

              {/* Информация о клиенте */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Информация о клиенте</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Имя:</span>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Телефон:</span>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Адрес:</span>
                    <p className="font-medium">{order.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Товары */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Товары</h4>
                <div className="space-y-3">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image_url || item.product.image || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">{item.product.price * item.quantity} сом</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Действия */}
              <div className="flex flex-wrap gap-3">
                <PrintReceipt order={order} onClose={() => {}} />
                
                {order.status === 'pending' && (
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    Оплатить
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно оплаты */}
      {showPayment && order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentQR
            order={order}
            onPaymentComplete={() => {
              setShowPayment(false);
              onClose();
            }}
            onClose={() => setShowPayment(false)}
          />
        </div>
      )}
    </div>
  );
};
