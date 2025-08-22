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
  RefreshCw,
  Clock,
  Calendar,
  Receipt,
  Play,
  Square
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
import { getOrders } from '../api/admin';
import { getTodayStats, TodayStats } from '../api/stats';

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
  
  // Состояние для статистики за сегодня
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchAnalytics();
    fetchTodayStats();
  }, [user, isAdmin, navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const orders = await getOrders();
      
      if (!Array.isArray(orders)) {
        setError('Неверный формат данных');
        return;
      }
      
      const analyticsData = analyzeOrders(orders);
      setAnalytics(analyticsData);
    } catch (error) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Функция для загрузки статистики за сегодня
  const fetchTodayStats = async () => {
    setStatsLoading(true);
    try {
      const response = await getTodayStats();
      setTodayStats(response.stats);
    } catch (error) {
      console.error('Ошибка загрузки статистики за сегодня:', error);
    } finally {
      setStatsLoading(false);
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

        {/* Управление сменами */}
        <div className="mb-8">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Управление сменами
              </h2>
            </CardHeader>
            <CardContent>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Текущая смена */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Текущая смена</h3>
                  
                  {shiftLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : currentShift ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-800">
                          {currentShift.shift_number}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Открыта
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-green-700">
                        <div className="flex justify-between">
                          <span>Открыта:</span>
                          <span>{new Date(currentShift.opened_at).toLocaleString('ru-RU')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Заказов:</span>
                          <span className="font-medium">{currentShift.total_orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Выручка:</span>
                          <span className="font-medium">{currentShift.total_revenue.toLocaleString()} сом</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Наличные:</span>
                          <span>{currentShift.cash_revenue.toLocaleString()} сом</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Карта:</span>
                          <span>{currentShift.card_revenue.toLocaleString()} сом</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleCloseShift}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Закрыть смену
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-4">Смена не открыта</p>
                      <Button
                        onClick={handleOpenShift}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Открыть смену
                      </Button>
                    </div>
                  )}
                </div>

                {/* История смен */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">История смен</h3>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {shiftsHistory.slice(0, 5).map((shift) => (
                      <div
                        key={shift.id}
                        className={`p-3 rounded-lg border ${
                          shift.status === 'open' 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {shift.shift_number}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            shift.status === 'open' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shift.status === 'open' ? 'Открыта' : 'Закрыта'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Заказов:</span>
                            <span>{shift.total_orders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Выручка:</span>
                            <span>{shift.total_revenue.toLocaleString()} сом</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Дата:</span>
                            <span>{new Date(shift.opened_at).toLocaleDateString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {shiftsHistory.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      История смен пуста
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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