import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PaymentMethod } from '../types';
import { createOrder } from '../api/orders';
import { FreedomPayCheckout } from '../components/FreedomPayCheckout';
import { apiClient } from '../api/client';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showPaymentComponent, setShowPaymentComponent] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

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
        paymentMethod: selectedPaymentMethod,
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

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      setLoading(true);
      
      // Отправляем данные о платеже
      const formData = new FormData();
      formData.append('orderId', orderId!.toString());
      formData.append('paymentMethod', paymentData.method);
      formData.append('amount', paymentData.amount.toString());
      formData.append('note', paymentData.note || '');
      
      if (paymentData.receipt) {
        formData.append('receiptFile', paymentData.receipt);
      }

      const response = await apiClient.post('/receipts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Очищаем корзину и перенаправляем на страницу успеха
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error: any) {
      console.error('Ошибка сохранения чека:', error);
      alert('Ошибка сохранения чека: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Наличные';
      case PaymentMethod.CARD:
        return 'Банковская карта';
      case PaymentMethod.BANK_TRANSFER:
        return 'Банковский перевод';
      default:
        return 'Не указан';
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Способ оплаты
                  </label>
                  <div className="space-y-2">
                    {Object.values(PaymentMethod).map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={selectedPaymentMethod === method}
                          onChange={() => handlePaymentMethodChange(method)}
                          className="mr-2"
                        />
                        {getPaymentMethodName(method)}
                      </label>
                    ))}
                  </div>
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
                        src={item.product.image || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
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

      {/* Компонент оплаты FreedomPay */}
      {showPaymentComponent && orderId && (
        <FreedomPayCheckout
          totalAmount={getTotal()}
          orderId={orderId}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentComponent(false)}
        />
      )}
    </div>
  );
};

export default CheckoutPage;


