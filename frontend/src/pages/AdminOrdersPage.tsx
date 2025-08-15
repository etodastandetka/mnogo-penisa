import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Calendar,
  User,
  MapPin,
  Phone,
  Package
} from 'lucide-react';
import { PrintReceipt } from '../components/PrintReceipt';

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    orders, 
    selectedOrder, 
    loading, 
    error, 
    fetchOrders, 
    fetchOrder, 
    updateOrderStatus,
    setSelectedOrder 
  } = useAdminStore();
  
  const [adminUser, setAdminUser] = useState<any>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Автоматическое применение фильтров при изменении
  useEffect(() => {
    // Пропускаем первый рендер
    const isInitialRender = !filters.search && !filters.status && !filters.dateFrom && !filters.dateTo;
    if (isInitialRender) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      console.log('Автоматическое применение фильтров:', filters);
      fetchOrders(filters);
    }, 500); // Задержка 500мс

    return () => clearTimeout(timeoutId);
  }, [filters, fetchOrders]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    console.log('Применяем фильтры:', filters);
    // Фильтры применяются автоматически через useEffect
  };

  const handleClearFilters = () => {
    setFilters({ status: '', dateFrom: '', dateTo: '', search: '' });
    setCurrentPage(1);
    // После очистки фильтров загружаем все заказы
    fetchOrders();
  };

  // Функции для пагинации
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  
  // Отладочная информация
  console.log('Пагинация:', {
    totalOrders: orders.length,
    itemsPerPage,
    currentPage,
    totalPages,
    currentOrdersCount: currentOrders.length,
    indexOfFirstItem,
    indexOfLastItem
  });

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    await fetchOrder(orderId);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setStatusError(null);
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      setStatusError('Ошибка обновления статуса заказа');
      // Автоматически скрываем ошибку через 3 секунды
      setTimeout(() => setStatusError(null), 3000);
    }
  };

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает оплаты' },
    { value: 'paid', label: 'Оплачен' },
    { value: 'preparing', label: 'Готовится' },
    { value: 'ready', label: 'Готов' },
    { value: 'delivering', label: 'В доставке' },
    { value: 'delivered', label: 'Доставлен' },
    { value: 'cancelled', label: 'Отменен' }
  ];

  if (!adminUser) {
    return <div>Загрузка...</div>;
  }

  // Обработка ошибок - предотвращаем белый экран
  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Произошла ошибка</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700"
            >
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок и кнопки */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Заказы</h2>
            <p className="text-gray-600 mt-1">Управление всеми заказами</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </Button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Ошибка статуса */}
        {statusError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{statusError}</p>
          </div>
        )}

        {/* Фильтры */}
        <Card className="border-0 shadow-soft mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Фильтры
                  {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Активны
                    </span>
                  )}
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                size="sm"
                className={`border-gray-300 hover:bg-gray-50 text-gray-600 transition-all duration-200 ${
                  (filters.search || filters.status || filters.dateFrom || filters.dateTo) 
                    ? 'border-red-300 text-red-600 hover:bg-red-50 hover:scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Очистить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Статус */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Дата от */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата от
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
                />
              </div>

              {/* Дата до */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата до
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
                />
              </div>

              {/* Поиск */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Номер заказа, клиент..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end mt-4">
              <Button
                onClick={handleApplyFilters}
                className="bg-japanese-indigo hover:bg-japanese-indigo/90 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                Применить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Список заказов */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Список заказов ({orders.length})
            </h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-japanese-indigo mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка заказов...</p>
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Заказы не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-japanese-indigo text-white rounded-full p-2">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Заказ #{order.orderNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            order.status === 'delivering' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status === 'pending' ? 'Ожидает оплаты' :
                           order.status === 'paid' ? 'Оплачен' :
                           order.status === 'preparing' ? 'Готовится' :
                           order.status === 'ready' ? 'Готов' :
                           order.status === 'delivering' ? 'В доставке' :
                           order.status === 'delivered' ? 'Доставлен' :
                           'Отменен'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Просмотр</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {order.customerName || 'Гость'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {order.customerPhone || 'Не указан'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {order.items?.length || 0} товар(ов)
                        </span>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">
                        {order.totalAmount} сом
                      </div>
                      <div className="flex items-center space-x-2">
                                                 <PrintReceipt order={order} onClose={() => {}} />
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
                        >
                          {statusOptions.slice(1).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Пагинация */}
            {orders.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, orders.length)} из {orders.length} заказов (страница {currentPage} из {totalPages})
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">На странице:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Назад
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно деталей заказа */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Заказ #{selectedOrder.orderNumber}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Информация о клиенте */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Информация о клиенте</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {selectedOrder.customerName || 'Гость'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          {selectedOrder.customerPhone || 'Не указан'}
                        </span>
                      </div>
                      {selectedOrder.deliveryAddress && (
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{selectedOrder.deliveryAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Товары */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Товары</h4>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.price} сом</p>
                            <p className="text-sm text-gray-600">Итого: {item.price * item.quantity} сом</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Фото чека */}
                  {(selectedOrder as any).paymentProof && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Фото чека</h4>
                      <div className="space-y-2">
                        <img
                          src={(selectedOrder as any).paymentProof}
                          alt="Фото чека"
                          className="w-full rounded-lg border border-gray-300"
                          onError={(e) => {
                            console.error('Ошибка загрузки фото чека:', (selectedOrder as any).paymentProof);
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjc3NDhCIj5GdG90byBjaGVrYSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                          }}
                        />
                        <p className="text-xs text-gray-600">
                          Загружено: {new Date((selectedOrder as any).paymentProofDate || selectedOrder.createdAt).toLocaleString('ru-RU')}
                        </p>
                        <p className="text-xs text-gray-500">
                          URL: {(selectedOrder as any).paymentProof}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Отладочная информация */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">Отладочная информация</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Payment Proof: {(selectedOrder as any).paymentProof || 'Не загружено'}</p>
                      <p>Payment Proof Date: {(selectedOrder as any).paymentProofDate || 'Не указано'}</p>
                      <p>Order ID: {selectedOrder.id}</p>
                      <p>Order Number: {selectedOrder.orderNumber}</p>
                    </div>
                  </div>

                  {/* Итого */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Итого:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {selectedOrder.totalAmount} сом
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
