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
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'delivering': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
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
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Заказ #{order.orderNumber}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(order.totalAmount)}</p>
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
                              {order.paymentProof && (
                                <Badge variant="primary" className="ml-1 bg-green-600">
                                  Чек загружен
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <p>Способ оплаты: {order.paymentMethod}</p>
                            {order.deliveryAddress && (
                              <p>Адрес: {order.deliveryAddress}</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {!order.paymentProof && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePayOrder(order)}
                                disabled={order.status === 'delivered'}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Оплатить
                              </Button>
                            )}
                            {order.paymentProof && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Показать чек об оплате
                                  const newWindow = window.open('', '_blank');
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>Чек об оплате - Заказ ${order.orderNumber}</title>
                                          <style>
                                            body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
                                            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                            h1 { color: #333; margin-bottom: 20px; }
                                            img { max-width: 100%; height: auto; border-radius: 8px; }
                                            .info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px; }
                                            .info p { margin: 5px 0; color: #666; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="container">
                                            <h1>Чек об оплате</h1>
                                            <img src="${order.paymentProof}" alt="Чек об оплате" />
                                            <div class="info">
                                              <p><strong>Номер заказа:</strong> ${order.orderNumber}</p>
                                              <p><strong>Клиент:</strong> ${order.customerName}</p>
                                              <p><strong>Дата загрузки:</strong> ${order.paymentProofDate ? new Date(order.paymentProofDate).toLocaleString('ru-RU') : 'Не указана'}</p>
                                            </div>
                                          </div>
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Посмотреть чек
                              </Button>
                            )}
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
