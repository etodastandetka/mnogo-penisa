import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
  User, Phone, MapPin, Mail, Edit, Save, X, LogOut, 
  Package, Clock, CheckCircle, Truck, AlertCircle, QrCode,
  ShoppingBag, CreditCard
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { formatPrice } from '../utils/format';
import { PaymentQR } from '../components/PaymentQR';
import { ordersApi } from '../api/orders';
import { client } from '../api/client';


export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearUser, setUser } = useUserStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const handlePayOrder = (order: any) => {
    setSelectedOrder(order);
  };
  
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Обновляем editData когда user загружается
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const data = await ordersApi.getUserOrders();
          setOrders(data);
        } catch (error) {
          // Игнорируем ошибку
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSaveProfile = async () => {
    if (user) {
      try {
        const response = await client.put('/users/profile', editData);
        
        if (response.status === 200) {
          setEditing(false);
          // Обновляем данные в store
          if (user) {
            const updatedUser = {
              ...user,
              name: editData.name,
              phone: editData.phone,
              address: editData.address
            };
            setUser(updatedUser);
            
            // Обновляем локальное состояние editData
            setEditData({
              name: editData.name,
              phone: editData.phone,
              address: editData.address
            });
          }
          alert('Профиль успешно обновлен!');
        } else {
          alert('Ошибка при обновлении профиля');
        }
      } catch (error) {
        alert('Ошибка при обновлении профиля');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Очищаем store пользователя
    clearUser();
    // Перенаправляем на главную страницу
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'delivering': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Необходима авторизация</h2>
            <p className="text-gray-600 mb-6">Войдите в систему, чтобы просмотреть профиль</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {user ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
              <p className="text-gray-600 mt-2">Управляйте вашими заказами и настройками</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Информация профиля</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Имя</label>
                    <p className="text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Телефон</label>
                    <p className="text-lg">{user.phone || 'Не указан'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Роль</label>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Администратор' : 'Пользователь'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Мои заказы</h2>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Загрузка заказов...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>У вас пока нет заказов</p>
                      <Button 
                        onClick={() => navigate('/menu')}
                        className="mt-4"
                      >
                        Перейти к меню
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Заказ #{order.order_number}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{order.total_amount} сом</p>
                              <Badge variant={
                                order.status === 'pending' ? 'secondary' :
                                order.status === 'preparing' ? 'default' :
                                order.status === 'ready' ? 'default' :
                                order.status === 'delivered' ? 'default' : 'secondary'
                              }>
                                {order.status === 'pending' ? 'Ожидает' :
                                 order.status === 'preparing' ? 'Готовится' :
                                 order.status === 'ready' ? 'Готов' :
                                 order.status === 'delivered' ? 'Доставлен' : order.status}
                              </Badge>
                              {order.paymentStatus && (
                                <Badge variant="secondary" className="ml-1">
                                  {order.paymentStatus}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <p>Способ оплаты: {order.payment_method}</p>
                            {order.items_summary && (
                              <p>Товары: {order.items_summary}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePayOrder(order)}
                              disabled={order.status === 'delivered'}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Оплатить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Необходима авторизация</h2>
            <p className="text-gray-600 mb-8">Войдите в систему чтобы просмотреть профиль</p>
            <Button onClick={() => navigate('/auth')}>
              Войти
            </Button>
          </div>
        )}
      </div>

      {showPayment && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentQR
            order={selectedOrder}
            onPaymentComplete={() => {
              setShowPayment(false);
              setSelectedOrder(null);
              // Обновляем список заказов
              window.location.reload();
            }}
            onClose={() => {
              setShowPayment(false);
              setSelectedOrder(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
