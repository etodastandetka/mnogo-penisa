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
import { OrderStatus } from '../types';
import { formatPrice } from '../utils/format';
import { getOrders, updateOrderStatus, AdminOrder } from '../api/admin';


export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useUserStore();
  
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    hasPaymentProof: ''
  });

  useEffect(() => {
    // Проверяем, что пользователь админ
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    // Загружаем заказы
    fetchOrders();

    // Автоматическое обновление заказов каждые 30 секунд
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    // Очистка интервала при размонтировании
    return () => clearInterval(interval);
  }, [user, isAdmin, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      setError('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);
      
      // Обновляем статус в локальном состоянии
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      setError(''); // Очищаем предыдущие ошибки
    } catch (error) {
      setError('Ошибка обновления статуса');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const printReceipt = (order: AdminOrder) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Чек заказа ${order.orderNumber || order.id || 'N/A'}</title>
          <style>
            body {
              font-family: 'Arial', 'Helvetica', 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 10px;
              width: 80mm;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-info {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .order-info {
              margin-bottom: 10px;
            }
            .order-number {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .order-date {
              margin-bottom: 5px;
            }
            .customer-info {
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .items-table {
              width: 100%;
              margin-bottom: 10px;
            }
            .items-table th {
              text-align: left;
              border-bottom: 1px solid #000;
              padding: 2px 0;
            }
            .items-table td {
              padding: 2px 0;
              vertical-align: top;
            }
            .item-name {
              width: 60%;
            }
            .item-quantity {
              width: 15%;
              text-align: center;
            }
            .item-price {
              width: 25%;
              text-align: right;
            }
            .total-section {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-bottom: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .total-final {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 15px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .tax-info {
              margin-bottom: 5px;
            }
            .qr-code {
              text-align: center;
              margin: 10px 0;
            }
            @media print {
              body {
                width: 80mm;
                margin: 0;
                padding: 5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">MNOGO ROLLY</div>
            <div class="company-info">Доставка суши и роллов</div>
            <div class="company-info">ИП: Султанкулов А.Б.</div>
            <div class="company-info">ИНН: 20504198701431</div>
            <div class="company-info">Адрес: г. Бишкек, ул. Ахунбаева, 182 Б</div>
            <div class="company-info">Тел: +996 (709) 611-043</div>
            <div class="company-info">Касса: ККТ-001</div>
          </div>

          <div class="order-info">
            <div class="order-number">Заказ №${order.orderNumber || order.id || 'N/A'}</div>
            <div class="order-date">Дата: ${new Date(order.createdAt || new Date()).toLocaleDateString('ru-RU')}</div>
            <div class="order-date">Время: ${new Date(order.createdAt || new Date()).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          <div class="customer-info">
            <div>Клиент: ${order.customerName || 'Гость'}</div>
            <div>Телефон: ${order.customerPhone || 'Не указан'}</div>
            <div>Адрес: ${order.deliveryAddress || 'Не указан'}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">Товар</th>
                <th class="item-quantity">Кол-во</th>
                <th class="item-price">Цена</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item: any) => `
                <tr>
                  <td class="item-name">${item.productName || 'Товар'}</td>
                  <td class="item-quantity">${item.quantity || 1}</td>
                  <td class="item-price">${item.price || 0} сом</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Подытог:</span>
              <span>${order.totalAmount || 0} сом</span>
            </div>
            <div class="total-row">
              <span>Доставка:</span>
              <span>0 сом</span>
            </div>
            <div class="total-row total-final">
              <span>ИТОГО:</span>
              <span>${order.totalAmount || 0} сом</span>
            </div>
          </div>

          <div class="footer">
            <div class="tax-info">Спасибо за заказ!</div>
            <div class="tax-info">Приятного аппетита!</div>
            <div class="tax-info">С уважением, команда Mnogo Rolly</div>
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
    setFilters({ status: '', dateFrom: '', dateTo: '', search: '', hasPaymentProof: '' });
  };

  const openOrderDetail = (order: AdminOrder) => {
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

  const getStatusColor = (status: string | OrderStatus) => {
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

  const getStatusText = (status: string | OrderStatus) => {
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
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(searchLower)
      );
    }
    if (filters.dateFrom && new Date(order.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(order.createdAt) > new Date(filters.dateTo)) return false;
    
    // Фильтр по наличию чека об оплате
    if (filters.hasPaymentProof === 'with' && !order.paymentProof) return false;
    if (filters.hasPaymentProof === 'without' && order.paymentProof) return false;
    
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Заказы</h1>
              <p className="text-gray-600 mt-2">
                Управление заказами клиентов • 
                <span className="text-green-600 font-medium ml-1">
                  {orders.filter(o => o.paymentProof).length} с чеками
                </span>
                <span className="text-gray-500 ml-1">
                  из {orders.length} заказов
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{loading ? 'Обновление...' : 'Обновить'}</span>
            </Button>
          </div>
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

        {/* Фильтры */}
        <Card className="border-0 shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Номер заказа, клиент..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата от
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата до
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Чек об оплате
                </label>
                <select 
                  value={filters.hasPaymentProof}
                  onChange={(e) => handleFilterChange('hasPaymentProof', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Все заказы</option>
                  <option value="with">С чеком</option>
                  <option value="without">Без чека</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-gray-600 hover:bg-gray-50"
              >
                Очистить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

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
                                #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {order.customerName} • {order.customerPhone}
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
                              <strong>Товары:</strong> {order.items?.map((item: any) => `${item.productName} x${item.quantity}`).join(', ') || 'Информация о товарах недоступна'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Сумма:</strong> {order.totalAmount?.toLocaleString() || 'Не указана'} сом
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Дата:</strong> {new Date(order.createdAt).toLocaleDateString('ru-RU')} {new Date(order.createdAt).toLocaleTimeString('ru-RU')}
                            </p>
                            {/* Информация о чеке об оплате */}
                            {order.paymentProof && (
                              <div className="mt-2 flex items-center space-x-2">
                                <Receipt className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  Чек об оплате прикреплен
                                </span>
                                {order.paymentProofDate && (
                                  <span className="text-xs text-gray-500">
                                    ({new Date(order.paymentProofDate).toLocaleDateString('ru-RU')})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Быстрые кнопки изменения статуса */}
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              disabled={updatingOrderId === order.id}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              {updatingOrderId === order.id ? '...' : 'Готовится'}
                            </Button>
                          )}
                          
                          {order.status === 'preparing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                              disabled={updatingOrderId === order.id}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              {updatingOrderId === order.id ? '...' : 'Готов'}
                            </Button>
                          )}
                          
                          {order.status === 'ready' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivering')}
                              disabled={updatingOrderId === order.id}
                              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            >
                              {updatingOrderId === order.id ? '...' : 'В доставке'}
                            </Button>
                          )}
                          
                          {order.status === 'delivering' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              disabled={updatingOrderId === order.id}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              {updatingOrderId === order.id ? '...' : 'Доставлен'}
                            </Button>
                          )}
                          
                          {(order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              disabled={updatingOrderId === order.id}
                              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                            >
                              {updatingOrderId === order.id ? '...' : 'Отменить'}
                            </Button>
                          )}
                          
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
                          {/* Кнопка просмотра чека об оплате */}
                          {order.paymentProof && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (order.paymentProof?.startsWith('data:image')) {
                                  // Если это base64 изображение, открываем в новом окне
                                  const newWindow = window.open();
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>Чек об оплате - Заказ #${order.orderNumber}</title></head>
                                        <body style="margin: 0; padding: 20px; background: #f5f5f5;">
                                          <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                                            <h2 style="color: #333; margin-bottom: 20px;">Чек об оплате - Заказ #${order.orderNumber}</h2>
                                            <img src="${order.paymentProof}" style="max-width: 100%; height: auto; border-radius: 4px;" alt="Чек об оплате" />
                                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
                                              <p><strong>Клиент:</strong> ${order.customerName}</p>
                                              <p><strong>Дата:</strong> ${order.paymentProofDate ? new Date(order.paymentProofDate).toLocaleDateString('ru-RU') : 'Не указана'}</p>
                                            </div>
                                          </div>
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }
                                } else {
                                  // Если это URL, открываем как есть
                                  window.open(order.paymentProof, '_blank');
                                }
                              }}
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <Receipt className="w-4 h-4 mr-1" />
                              Чек
                            </Button>
                          )}
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
        order={selectedOrder ? {
          id: selectedOrder.id,
          order_number: selectedOrder.orderNumber,
          customer_name: selectedOrder.customerName,
          customer_phone: selectedOrder.customerPhone,
          delivery_address: selectedOrder.deliveryAddress,
          total_amount: selectedOrder.totalAmount,
          status: selectedOrder.status,
          payment_method: selectedOrder.paymentMethod,
          payment_status: selectedOrder.paymentStatus,
          created_at: selectedOrder.createdAt,
          items: selectedOrder.items?.map(item => ({
            id: item.id,
            product_name: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.totalPrice,
            product_id: item.id
          })),
          payment_proof: selectedOrder.paymentProof,
          payment_proof_date: selectedOrder.paymentProofDate,
          notes: selectedOrder.notes
        } : null}
        isOpen={isDetailModalOpen}
        onClose={closeOrderDetail}
        onOrderUpdate={handleOrderUpdate}
      />
    </AdminLayout>
  );
};

