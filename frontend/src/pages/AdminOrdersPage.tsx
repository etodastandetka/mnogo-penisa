import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { OrderDetailModal } from '../components/admin/OrderDetailModal';
import {
  Filter,
  Search,
  RefreshCw,
  Package,
  Calendar,
  Phone,
  MapPin,
  Clock,
  Printer,
  Eye,
  Receipt
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_address?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items_summary?: string;
  payment_proof?: string;
  notes?: string;
  items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useUserStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    // Проверяем, что пользователь админ
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    // Загружаем заказы
    fetchOrders();
  }, [user, isAdmin, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('http://localhost:3001/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const ordersData = await response.json();
        ordersData.forEach((order: Order) => {
          });
        setOrders(ordersData);
      } else {
        setError('Ошибка загрузки заказов');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Обновляем статус в локальном состоянии
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        setError(''); // Очищаем предыдущие ошибки
      } else {
        const errorData = await response.text();
        setError(`Ошибка обновления статуса: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const printReceipt = (order: Order) => {
    // Подсчитываем количество товаров
    const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const itemsText = order.items?.map(item => `${item.product_name} x${item.quantity}`).join(', ') || order.items_summary || 'Детали заказа';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Чек заказа #${order.order_number}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                font-size: 13px; 
                line-height: 1.4;
                margin: 0;
                padding: 15px;
                max-width: 380px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #e53e3e;
                margin-bottom: 5px;
              }
              .company-info {
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
              }
              .order-info {
                margin-bottom: 20px;
                padding: 10px;
                background: #f8f8f8;
                border-radius: 5px;
              }
              .section {
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px dashed #ccc;
              }
              .section-title {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
              }
              .total {
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                padding: 10px;
                background: #e53e3e;
                color: white;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #333;
              }
              .tips-section {
                text-align: center;
                margin-top: 15px;
                padding: 12px;
                background: #f0f8ff;
                border-radius: 8px;
                border: 2px dashed #4a90e2;
              }
              .qr-image {
                width: 100px;
                height: 100px;
                margin: 8px auto;
                display: block;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              }
              .thanks-text {
                background: #fff8e1;
                padding: 12px;
                border-radius: 6px;
                margin: 15px 0;
                border-left: 4px solid #ff9800;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .tips-section { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🍕 Mnogo Rolly</div>
              <div class="company-info">
                ИП Султанкулов Адилет Б<br>
                📍 г. Бишкек, ул. Ахунбаева 182<br>
                📞 +996 709 611 043
              </div>
            </div>

            <div class="order-info">
              <div style="display: flex; justify-content: space-between;">
                <div><strong>Заказ:</strong> #${order.order_number}</div>
                <div><strong>Дата:</strong> ${new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
              </div>
              <div style="text-align: center; margin-top: 5px;">
                <strong>Время:</strong> ${new Date(order.created_at).toLocaleTimeString('ru-RU')}
              </div>
            </div>

            <div class="section">
              <div class="section-title">👤 КЛИЕНТ:</div>
              <div><strong>Имя:</strong> ${order.customer_name}</div>
              <div><strong>Телефон:</strong> ${order.customer_phone}</div>
              <div><strong>Адрес доставки:</strong> ${order.customer_address || order.delivery_address || 'Не указан'}</div>
            </div>

            <div class="section">
              <div class="section-title">🛒 ДЕТАЛИ ЗАКАЗА:</div>
              <div style="background: white; padding: 8px; border-radius: 5px; margin-top: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="border-bottom: 1px solid #ddd;">
                      <th style="text-align: left; padding: 4px; font-weight: bold;">Наименование</th>
                      <th style="text-align: center; padding: 4px; font-weight: bold; width: 40px;">К-во</th>
                      <th style="text-align: right; padding: 4px; font-weight: bold; width: 60px;">Цена</th>
                      <th style="text-align: right; padding: 4px; font-weight: bold; width: 70px;">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items && order.items.length > 0 ? 
                      order.items.map(item => `
                        <tr style="border-bottom: 1px dashed #eee;">
                          <td style="padding: 4px 4px 4px 0; line-height: 1.3;">${item.product_name}</td>
                          <td style="text-align: center; padding: 4px;">${item.quantity}</td>
                          <td style="text-align: right; padding: 4px;">${item.price ? item.price.toLocaleString() : '0'}</td>
                          <td style="text-align: right; padding: 4px; font-weight: bold;">${item.price ? (item.price * item.quantity).toLocaleString() : '0'}</td>
                        </tr>
                      `).join('') : 
                      `<tr><td colspan="4" style="text-align: center; padding: 8px; color: #666;">${order.items_summary || 'Информация о товарах недоступна'}</td></tr>`
                    }
                  </tbody>
                </table>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #ddd;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span><strong>Количество позиций:</strong></span>
                    <span>${itemsCount} шт.</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span><strong>Способ оплаты:</strong></span>
                    <span>${order.payment_method === 'cash' ? 'Наличные' : order.payment_method === 'card' ? 'Карта' : order.payment_method}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span><strong>Статус:</strong></span>
                    <span>${getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="total">
              💰 ИТОГО: ${order.total_amount.toLocaleString()} сом
            </div>

            <div class="thanks-text">
              <div style="font-weight: bold; color: #ff9800; margin-bottom: 8px;">🎉 Спасибо за ваш заказ!</div>
              <div style="font-size: 12px; color: #666;">
                📞 По всем вопросам: +996 709 611 043
              </div>
            </div>



            <div class="footer">
              <div style="font-size: 13px; color: #666; margin-bottom: 10px;">
                ⭐ Оцените нас в социальных сетях!<br>
                📱 Instagram: @mnogo_rolly
              </div>
              <div style="font-size: 12px; color: #999;">
                Приходите к нам снова! До встречи в Mnogo Rolly! 👋
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ status: '', dateFrom: '', dateTo: '', search: '' });
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeOrderDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = (updatedOrder: any) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает' },
    { value: 'preparing', label: 'Готовится' },
    { value: 'ready', label: 'Готов' },
    { value: 'delivering', label: 'В доставке' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменен' }
  ];

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.customer_phone.includes(searchLower)
      );
    }
    if (filters.dateFrom && new Date(order.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(order.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-600 mt-2">Управление заказами клиентов</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError('')}
                className="text-red-600 hover:bg-red-100"
              >
                ✕
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Загрузка заказов...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Список заказов ({filteredOrders.length})
              </h2>
              
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Заказы не найдены</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                #{order.order_number}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {order.customer_name} • {order.customer_phone}
                              </p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Товары:</strong> {order.items_summary || 'Информация о товарах недоступна'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Сумма:</strong> {order.total_amount?.toLocaleString() || 'Не указана'} сом
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Дата:</strong> {new Date(order.created_at).toLocaleDateString('ru-RU')} {new Date(order.created_at).toLocaleTimeString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderDetail(order)}
                          >
                            Подробнее
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printReceipt(order)}
                          >
                            Печать
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={closeOrderDetail}
        onOrderUpdate={handleOrderUpdate}
      />
    </AdminLayout>
  );
};

