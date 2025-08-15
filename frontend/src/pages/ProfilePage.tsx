import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
  User, Phone, MapPin, Mail, Edit, Save, X, LogOut, 
  Package, Clock, CheckCircle, Truck, AlertCircle, QrCode
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { formatPrice } from '../utils/format';
import { PaymentQR } from '../components/PaymentQR';
import { PrintReceipt } from '../components/PrintReceipt';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useUserStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Ошибка загрузки заказов:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleSaveProfile = async () => {
    if (token) {
      try {
        const response = await fetch('http://localhost:3001/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editData)
        });

        if (response.ok) {
          updateUser(editData);
          setEditing(false);
          alert('Профиль успешно обновлен!');
        } else {
          alert('Ошибка при обновлении профиля');
        }
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        alert('Ошибка при обновлении профиля');
      }
    }
  };

  const handleLogout = () => {
    logout();
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
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
          <p className="text-gray-600">Управление личными данными и заказами</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Информация о пользователе */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Личные данные</h2>
                  {!editing ? (
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Изменить
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Имя</p>
                    {editing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{user.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    {editing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Адрес</p>
                    {editing ? (
                      <Input
                        value={editData.address}
                        onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{user.address || 'Не указан'}</p>
                    )}
                  </div>
                </div>

                {user.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* История заказов */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">История заказов</h2>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Загрузка заказов...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
                    <p className="text-gray-500 mb-4">Сделайте свой первый заказ!</p>
                    <Button 
                      onClick={() => navigate('/menu')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Перейти к меню
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">Заказ #{order.orderNumber}</h3>
                            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatPrice(order.totalAmount)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product.name} × {item.quantity}</span>
                              <span>{formatPrice(item.product.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                          <PrintReceipt order={order} onClose={() => {}} />
                          {order.status === 'pending' && (
                            <Button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowPayment(true);
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              Оплатить
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
      </div>

      {/* Модальное окно оплаты */}
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

