import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { updateOrderStatus } from '../../api/admin';

import { 
  X, 
  Eye, 
  Download, 
  Phone, 
  MapPin, 
  Clock, 
  Package,
  CreditCard,
  Receipt,
  User,
  Search
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  product_id?: number;
}

interface OrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_address?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status?: string;
  created_at: string;
  items?: OrderItem[];
  payment_proof?: string;
  payment_proof_date?: string;
  notes?: string;
}

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate?: (updatedOrder: OrderDetail) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order?.status || '');

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    try {
      setLoading(true);
      await updateOrderStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
      
      if (onOrderUpdate) {
        onOrderUpdate({ ...order, status: newStatus });
      }
      
      alert('Статус заказа успешно обновлен!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivering': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов';
      case 'delivering': return 'В доставке';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'pending': return 'Ожидает оплаты';
      case 'failed': return 'Ошибка оплаты';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS',
      minimumFractionDigits: 0
    }).format(price);
  };



    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Детали заказа #{order.order_number}
            </h2>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Информация о заказе */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Информация о заказе</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Дата создания</label>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Сумма заказа</label>
                  <p className="text-lg font-semibold text-green-600">{formatPrice(order.total_amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Способ оплаты</label>
                  <p>{order.payment_method || 'Не указан'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Статус оплаты</label>
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {order.payment_status || 'Не указан'}
                  </Badge>
                </div>
              </div>
              
              {/* Управление статусом заказа */}
              <div className="border-t pt-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Статус заказа</label>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={getStatusColor(currentStatus)}>
                      {getStatusText(currentStatus)}
                    </Badge>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Ожидает</option>
                      <option value="preparing">Готовится</option>
                      <option value="ready">Готов</option>
                      <option value="delivering">В доставке</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                    {loading && <span className="text-sm text-gray-500">Обновляется...</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация о клиенте */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Информация о клиенте</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Имя</label>
                  <p>{order.customer_name || 'Не указано'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Телефон</label>
                  <p>{order.customer_phone || 'Не указан'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Адрес</label>
                  <p>{order.customer_address || order.delivery_address || 'Не указан'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Товары в заказе */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Товары в заказе</h3>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price || 0)}</p>
                        <p className="text-sm text-gray-600">
                          Всего: {formatPrice((item.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {(order as any).items_summary || 'Детали заказа не загружены'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Чек об оплате */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Чек об оплате</h3>
            </CardHeader>
            <CardContent>
               {(order.payment_proof &&
                order.payment_proof !== "" &&
                order.payment_proof !== "null" &&
                order.payment_proof !== null &&
                order.payment_proof !== "undefined" &&
                order.payment_proof.trim() !== "") ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <Receipt className="h-5 w-5 text-green-500" />
                    <div>
                      <span className="text-sm text-gray-600">
                        Клиент предоставил подтверждение оплаты
                      </span>
                      {order.payment_proof_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Загружено: {new Date(order.payment_proof_date).toLocaleString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      {/* Показываем ссылку на чек */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Ссылка на чек об оплате:</strong>
                        </p>
                        <a 
                          href={order.payment_proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {order.payment_proof}
                        </a>
                        <p className="text-xs text-gray-500 mt-2">
                          Если фото не отображается, используйте ссылку выше
                        </p>
                      </div>
                      
                      {/* Показываем фото чека, если загружается */}
                      <div className="mt-4">
                        <img
                          src={order.payment_proof}
                          alt="Чек об оплате"
                          className="w-full max-w-md h-auto rounded-lg border border-gray-200 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(order.payment_proof, '_blank')}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Кликните по изображению для увеличения
                        </p>
                      </div>
                    </div>


                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Чек об оплате не предоставлен</p>
                  <p className="text-sm text-gray-600">Клиент еще не загрузил подтверждение оплаты</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Заметки */}
          {order.notes && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Заметки к заказу</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Действия */}
          <div className="flex justify-end items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
              <Button 
                onClick={() => {
                  // Здесь можно добавить логику для печати
                  window.print();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Печать заказа
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
