import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
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
  const { user, isAdmin } = useUserStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Проверяем, что пользователь админ
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    // Загружаем статистику
    fetchStats();
  }, [user, isAdmin, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('http://45.144.221.227:3001/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        const activeOrders = orders.filter((order: any) => 
          order.status !== 'delivered' && order.status !== 'cancelled'
        ).length;

        // Берем последние 5 заказов
        const recent = orders.slice(0, 5);
        setStats({ totalOrders, totalRevenue, activeOrders });
        setRecentOrders(recent);

        // Загружаем популярные товары
        fetchPopularProducts();
      } else {
        setError('Ошибка загрузки статистики');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const fetchPopularProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://45.144.221.227:3001/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const products = await response.json();
        // Берем товары с флагом is_popular или первые 5
        const popular = products.filter((p: any) => p.is_popular).slice(0, 5);
        if (popular.length === 0) {
          setPopularProducts(products.slice(0, 5));
        } else {
          setPopularProducts(popular);
        }
      }
    } catch (error) {
      }
  };



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
                    {loading ? '...' : stats.totalOrders || 0}
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
                    {loading ? '...' : `${stats.totalRevenue.toLocaleString() || 0} сом`}
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
                      {loading ? '...' : `${Math.round((stats.totalRevenue || 0) / Math.max(stats.totalOrders || 1, 1)).toLocaleString()} сом`}
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
                    {loading ? '...' : stats.activeOrders || 0}
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Последние заказы</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/orders')}
                  className="text-xs"
                >
                  Все заказы
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
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
              ) : recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Нет заказов</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="primary" className="text-xs">
                            #{order.order_number || order.id}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer_name || 'Клиент'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer_phone || order.phone || 'Телефон не указан'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {order.total_amount?.toLocaleString() || 0} сом
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : 'Дата не указана'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Популярные товары */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Популярные товары</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/products')}
                  className="text-xs"
                >
                  Все товары
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
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
              ) : popularProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Нет товаров</p>
              ) : (
                <div className="space-y-3">
                  {popularProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category || 'Без категории'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {product.price?.toLocaleString() || 0} сом
                        </p>
                        <Badge 
                          variant={product.is_available ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.is_available ? 'В наличии' : 'Нет в наличии'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
