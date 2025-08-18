import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  ordersByDay: { date: string; orders: number; revenue: number }[];
}

export const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useUserStore();
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    ordersByDay: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user, isAdmin, navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден');
        return;
      }

      const response = await fetch('https://45.144.221.227:3443/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        
        if (!Array.isArray(orders)) {
          setError('Неверный формат данных');
          return;
        }
        
        const analyticsData = analyzeOrders(orders);
        setAnalytics(analyticsData);
      } else {
        setError(`Ошибка загрузки данных: ${response.status}`);
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const analyzeOrders = (orders: any[]): AnalyticsData => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        ordersByDay: []
      };
    }
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    // Группируем заказы по дням
    const dailyData: { [key: string]: { orders: number; revenue: number } } = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('ru-RU');
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0 };
      }
      dailyData[date].orders += 1;
      dailyData[date].revenue += order.total_amount || 0;
    });
    
    const ordersByDay = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Последние 30 дней
    
    return {
      totalOrders,
      totalRevenue,
      ordersByDay
    };
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
              <p className="text-gray-600 mt-2">Подробная статистика и анализ данных</p>
            </div>
            <Button
              onClick={fetchAnalytics}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.totalRevenue.toLocaleString()} сом
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* График заказов */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Заказы по дням</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.ordersByDay.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3B82F6" name="Заказы" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* График выручки */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Выручка по дням</h3>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.ordersByDay.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} сом`, 'Выручка']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Выручка" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Таблица с данными */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Данные по дням</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказы</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Выручка</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.ordersByDay.slice(-7).reverse().map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{day.revenue.toLocaleString()} сом</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};