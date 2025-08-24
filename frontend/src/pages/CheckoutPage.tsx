import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PaymentMethod } from '../types';
import { createOrder } from '../api/orders';
import { PaymentMethod as PaymentMethodComponent } from '../components/PaymentMethod';

export const CheckoutPage: React.FC = () => {
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

    // Показываем компонент оплаты сразу при отправке формы
    setShowPaymentComponent(true);
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
      
      // Сначала создаем заказ
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
      
      // Проверяем, что заказ создан успешно
      if (!result || !result.orderId) {
        throw new Error('Не удалось получить ID заказа');
      }
      
      setOrderId(result.orderId);

      // Затем отправляем данные о платеже
      const formData = new FormData();
      formData.append('orderId', result.orderId.toString());
      formData.append('paymentMethod', paymentData.method);
      formData.append('amount', paymentData.amount.toString());
      formData.append('note', paymentData.note);
      
      if (paymentData.receipt) {
        formData.append('receiptFile', paymentData.receipt);
      }

      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения чека');
      }

      // Очищаем корзину и перенаправляем на страницу успеха
      clearCart();
      navigate(`/order-success/${result.orderId}`);
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
        return 'Наличными';
      case PaymentMethod.CARD:
        return 'Картой';
      case PaymentMethod.QR:
        return 'QR-код';
      default:
        return 'Неизвестно';
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Перейти к меню
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Оформление заказа</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма заказа */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Данные для доставки</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Имя *"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                
                <Input
                  label="Телефон *"
                  type="tel"
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
                  label="Примечания"
                  value={customerData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />

                {/* Способ оплаты */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Способ оплаты
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(PaymentMethod).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handlePaymentMethodChange(method)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedPaymentMethod === method
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {getPaymentMethodName(method)}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Создание заказа...' : 'Оформить заказ'}
                </Button>
              </form>
            </div>

            {/* Сводка заказа */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Ваш заказ</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.price} ₽</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {item.product.price * item.quantity} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Итого:</span>
                  <span className="text-orange-600">{getTotal()} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Компонент оплаты */}
      {showPaymentComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Оплата заказа</h2>
                <button
                  onClick={() => setShowPaymentComponent(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <PaymentMethodComponent
                totalAmount={getTotal()}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

