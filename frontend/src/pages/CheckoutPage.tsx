import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, QrCode, Banknote } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { useGuestOrderStore } from '../store/guestOrderStore';
import { PaymentMethod } from '../types';
import { PaymentQR } from '../components/PaymentQR';
import { formatPrice } from '../utils/format';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, token } = useUserStore();
  const { addOrder } = useGuestOrderStore();
  
  const [customerData, setCustomerData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [orderId, setOrderId] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      let response;
      
      if (isAuthenticated && user && token) {
        // Заказ для авторизованного пользователя
        response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            customer: customerData,
            items: items,
            total: getTotal(),
            paymentMethod: paymentMethod,
            notes: customerData.notes,
            userId: user.id
          })
        });
      } else {
        // Заказ для гостя
        response = await fetch(`${import.meta.env.VITE_API_URL}/orders/guest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: customerData.name,
            customerPhone: customerData.phone,
            deliveryAddress: customerData.address,
            items: items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            })),
            totalAmount: getTotal()
          })
        });
      }

      const result = await response.json();

      if (result.success) {
        const orderId = result.order?.id || result.data?.orderId;
        setOrderId(orderId.toString());
        
        // Сохраняем заказ гостя локально
        if (!isAuthenticated && result.order) {
          addOrder(result.order);
        }
        
        // Если выбран QR-код, показываем экран оплаты
        if (paymentMethod === PaymentMethod.QR) {
          setShowPayment(true);
        } else {
          // Для других способов оплаты - стандартная логика
          console.log('Заказ оформлен:', result);
          clearCart();
          alert(`Заказ успешно оформлен! Номер заказа: ${result.order?.orderNumber || result.data?.orderNumber}`);
        }
      } else {
        alert('Ошибка при создании заказа: ' + result.message);
      }
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error);
      alert('Ошибка при создании заказа. Попробуйте еще раз.');
    }
  };

  const handlePaymentComplete = () => {
    console.log('Оплата завершена для заказа:', orderId);
    clearCart();
    setShowPayment(false);
    alert('Заказ успешно оплачен и оформлен!');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full shadow-soft border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h2>
            <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к меню
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Оформление заказа
            </h1>
            <p className="text-xl text-white/90">
              Заполните данные для доставки и выберите способ оплаты
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Форма заказа */}
          <div>
            <Card className="shadow-soft border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Данные для доставки</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Имя *"
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Телефон *"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Адрес доставки *"
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Примечания к заказу"
                    value={customerData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Дополнительные пожелания..."
                  />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Способ оплаты</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={PaymentMethod.CASH}
                          checked={paymentMethod === PaymentMethod.CASH}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <Banknote className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900">Наличными при получении</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={PaymentMethod.QR}
                          checked={paymentMethod === PaymentMethod.QR}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <QrCode className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900">Онлайн оплата</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 rounded-xl"
                  >
                    Оформить заказ
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Корзина */}
          <div>
            <Card className="shadow-soft border-0 sticky top-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ваш заказ</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image_url || item.product.image || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop';
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Итого:</span>
                    <span className="text-2xl text-red-600">{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Модальное окно оплаты */}
      {showPayment && orderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentQR
            order={{ id: orderId }}
            onPaymentComplete={handlePaymentComplete}
            onClose={() => setShowPayment(false)}
          />
        </div>
      )}
    </div>
  );
};

