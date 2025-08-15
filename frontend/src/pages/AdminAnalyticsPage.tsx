import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { adminApi } from '../api/admin';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getAnalytics(period);
        setAnalytics(data);
      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок и фильтры */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Аналитика</h2>
            <p className="text-gray-600 mt-1">Детальная аналитика продаж и клиентов</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-japanese-indigo focus:border-transparent"
            >
              <option value="day">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Экспорт</span>
            </Button>
          </div>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Выручка</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : `₽${Math.round(analytics?.metrics?.revenue || 0).toLocaleString()}`}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{analytics?.changes?.revenue || 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Заказы</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : analytics?.metrics?.orders || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{analytics?.changes?.orders || 0}%
                    </span>
                  </div>
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
                  <p className="text-sm font-medium text-gray-600">Клиенты</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : analytics?.metrics?.customers || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{analytics?.changes?.customers || 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                                      <p className="text-sm font-medium text-gray-600">Средний чек</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '...' : `${Math.round(analytics?.metrics?.averageCheck || 0)} сом`}
                    </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">
                      {analytics?.changes?.averageCheck || 0}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Графики и детальная аналитика */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* График продаж */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Продажи по дням</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-japanese-indigo mx-auto mb-4"></div>
                    <p className="text-gray-500">Загрузка...</p>
                  </div>
                </div>
              ) : analytics?.dailySales?.length > 0 ? (
                <div className="h-64">
                  <div className="grid grid-cols-7 gap-3 h-full items-end">
                    {analytics.dailySales.map((day: any, index: number) => {
                      const maxRevenue = Math.max(...analytics.dailySales.map((d: any) => d.revenue));
                      const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                      const minHeight = 10; // Минимальная высота столбца
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-japanese-indigo to-japanese-indigo/80 rounded-t-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                            style={{ height: `${Math.max(height, minHeight)}%` }}
                            title={`${new Date(day.date).toLocaleDateString('ru-RU')}: ${Math.round(day.revenue)} сом`}
                          >
                            <div className="w-full h-full bg-gradient-to-t from-japanese-indigo to-japanese-indigo/60 rounded-t-lg group-hover:from-japanese-indigo/90 group-hover:to-japanese-indigo/70 transition-all duration-300"></div>
                          </div>
                          <div className="text-xs text-gray-600 mt-3 text-center">
                            <div className="font-medium text-gray-700">
                              {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                            </div>
                            <div className="font-bold text-japanese-indigo">{Math.round(day.revenue)} сом</div>
                            <div className="text-gray-500">{day.orders} зак.</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Нет данных о продажах</p>
                  </div>
                </div>
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
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-japanese-indigo mx-auto mb-4"></div>
                    <p className="text-gray-500">Загрузка...</p>
                  </div>
                </div>
              ) : analytics?.popularProducts?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.popularProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-japanese-indigo/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-japanese-indigo">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">Продаж: {product.sales}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{Math.round(product.revenue)} сом</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Нет данных о продажах</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная аналитика */}
        <div className="mt-8">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Детальная аналитика</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Период</p>
                  <p className="text-sm text-gray-600">
                    {period === 'day' ? 'Сегодня' : 
                     period === 'week' ? 'Неделя' : 
                     period === 'month' ? 'Месяц' : 'Год'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Средний заказ</p>
                  <p className="text-sm text-gray-600">
                    {loading ? '...' : `₽${Math.round(analytics?.metrics?.averageCheck || 0)}`}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Уникальные клиенты</p>
                  <p className="text-sm text-gray-600">
                    {loading ? '...' : analytics?.metrics?.customers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
