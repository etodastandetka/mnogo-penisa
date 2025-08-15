import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Clock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, error, fetchStats } = useAdminStore();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userStr = localStorage.getItem('adminUser');
    if (userStr && userStr !== 'undefined') {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Ошибка парсинга adminUser:', error);
        localStorage.removeItem('adminUser');
      }
    }

    // Загружаем статистику
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (!adminUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок и кнопки */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Дашборд</h2>
            <p className="text-gray-600 mt-1">Обзор статистики и активности</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate('/admin/orders')}
              className="bg-japanese-indigo hover:bg-japanese-indigo/90 flex items-center space-x-2"
            >
              <span>Управление заказами</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </Button>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Общее количество заказов */}
          <Card className="border-0 shadow-soft hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : stats?.totalOrders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Общая выручка */}
          <Card className="border-0 shadow-soft hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : `${stats?.totalRevenue?.toLocaleString() || 0} сом`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Средний чек */}
          <Card className="border-0 shadow-soft hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                                      <p className="text-sm font-medium text-gray-600">Средний чек</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '...' : `${stats?.averageOrderValue?.toLocaleString() || 0} сом`}
                    </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Активные заказы */}
          <Card className="border-0 shadow-soft hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">В обработке</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : stats?.recentOrders?.filter(o => o.status === 'preparing').length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Последние заказы и популярные товары */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Последние заказы */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Последние заказы</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentOrders?.length ? (
                <div className="space-y-4">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-japanese-indigo/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-japanese-indigo" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{order.totalAmount} сом</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Нет заказов</p>
              )}
            </CardContent>
          </Card>

          {/* Популярные товары */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Популярные товары</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.popularProducts?.length ? (
                <div className="space-y-4">
                  {stats.popularProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-japanese-red/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-japanese-red" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">Продаж: {product.salesCount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          Популярный
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Нет данных</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

// Вспомогательные функции
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'preparing': return 'bg-blue-100 text-blue-800';
    case 'ready': return 'bg-green-100 text-green-800';
    case 'delivering': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'preparing': return 'Готовится';
    case 'ready': return 'Готов';
    case 'delivering': return 'В доставке';
    case 'delivered': return 'Доставлен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
}
