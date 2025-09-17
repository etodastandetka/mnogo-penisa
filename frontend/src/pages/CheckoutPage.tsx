import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { createOrder } from '../api/orders';
import { Card } from '../components/ui/Card';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [showPaymentComponent, setShowPaymentComponent] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      // Создаем заказ
      const orderData = {
        items: items.map(item => ({
          product: {
            id: item.product.id,
            price: item.product.price
          },
          quantity: item.quantity
        })),
        customer: customerData,
        total: getTotal(),
        paymentMethod: 'pending', // Будет определен при выборе способа оплаты
        notes: customerData.notes
      };

      const result = await createOrder(orderData);
      
      if (!result || !result.orderId) {
        throw new Error('Не удалось получить ID заказа');
      }
      
      setOrderId(result.orderId);
      setShowPaymentComponent(true);
    } catch (error: any) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка создания заказа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      setLoading(true);
      
      // Очищаем корзину и перенаправляем на страницу успеха
      clearCart();
      navigate(`/order-success/${orderId}`, {
        state: {
          paymentMethod: paymentData.paymentMethod,
          amount: paymentData.amount,
          cashAmount: paymentData.cashAmount,
          changeAmount: paymentData.changeAmount
        }
      });
    } catch (error: any) {
      console.error('Ошибка завершения заказа:', error);
      alert('Ошибка завершения заказа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createQRCode = async () => {
    if (!orderId) return;
    
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/odengi/create-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId.toString(),
          amount: getTotal(),
          description: `Заказ #${orderId}`,
          customerPhone: customerData.phone
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQrData({
          qrUrl: data.qrUrl,
          invoiceId: data.invoiceId,
          amount: data.amount
        });
      } else {
        alert('Ошибка создания QR-кода: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка создания QR-кода:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      
      // Очищаем корзину и перенаправляем на страницу успеха
      clearCart();
      navigate(`/order-success/${orderId}`, {
        state: {
          paymentMethod: 'cash',
          amount: getTotal()
        }
      });
    } catch (error: any) {
      console.error('Ошибка завершения заказа:', error);
      alert('Ошибка завершения заказа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };



  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Вернуться к покупкам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Заголовок */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Оформление заказа</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Форма заказа */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Данные для доставки</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя * <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон * <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+996 XXX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес доставки * <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Улица, дом, квартира"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительные заметки
                  </label>
                  <textarea
                    value={customerData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Особенности доставки, пожелания..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>



                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  {loading ? 'Создание заказа...' : 'Оформить заказ'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Корзина */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.image_url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.product.price} сом × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{item.product.price * item.quantity} сом</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Итого:</span>
                  <span>{getTotal()} сом</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Способы оплаты */}
      {showPaymentComponent && orderId && (
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Выберите способ оплаты</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Наличные */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100"
                onClick={handleCashPayment}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Наличными курьеру</h3>
                  <p className="text-gray-600 text-sm">Оплата при получении заказа</p>
                </div>
              </Card>

              {/* QR-код */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100"
                onClick={() => {
                  setSelectedPaymentMethod('qr');
                  createQRCode();
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">QR-код</h3>
                  <p className="text-gray-600 text-sm">Оплата через мобильное приложение</p>
                </div>
              </Card>
            </div>

            {/* QR-код отображение */}
            {selectedPaymentMethod === 'qr' && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-center">Оплата через QR-код</h3>
                
                {paymentLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Создание QR-кода...</p>
                  </div>
                ) : qrData ? (
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4 inline-block">
                      <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <img 
                          src={qrData.qrUrl} 
                          alt="QR код для оплаты"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        Отсканируйте QR-код в приложении O!Dengi
                      </p>
                      <p className="text-sm text-gray-600">
                        Сумма: {getTotal()} сом
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-green-500 mr-2">✅</span>
                        <span className="font-medium text-green-800">
                          После оплаты заказ будет автоматически подтвержден
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setSelectedPaymentMethod(null)}
                        variant="outline"
                        className="px-6"
                      >
                        ← Назад
                      </Button>
                      <Button
                        onClick={handlePaymentComplete}
                        className="px-6 bg-green-600 hover:bg-green-700"
                      >
                        Я оплатил
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Нажмите на карточку QR-кода выше для создания</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;


