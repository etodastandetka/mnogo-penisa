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
import { PaymentProofUpload } from '../components/PaymentProofUpload';
import { formatPrice } from '../utils/format';


export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useUserStore();
  const { addOrder } = useGuestOrderStore();
  
  const [customerData, setCustomerData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
    paymentProof: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        paymentProof: ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
  };

  const getBankName = (bankCode: string): string => {
    const banks = {
      'megapay': 'Megapay',
      'balance': 'Balance.kg',
      'demirbank': 'Demirbank',
      'odengi': 'O!Dengi',
      'bakai': 'Bakai',
      'companion': 'Companion',
      'mbank': 'M-Bank'
    };
    return banks[bankCode as keyof typeof banks] || bankCode;
  };

  const handlePaymentRedirect = (paymentSystem: string) => {
    const paymentUrls = {
      'megapay': 'https://megapay.kg/get#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'balance': 'https://balance.kg/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'demirbank': 'https://apps.demirbank.kg/ib/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'odengi': 'https://api.dengi.o.kg/ru/qr/00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'bakai': 'https://bakai24.app/#00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'companion': 'https://payqr.kg/qr/00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a',
      'mbank': 'https://app.mbank.kg/qr/00020101021132590015qr.demirbank.kg01047001101611800003478401861202111302125204482953034175909DEMIRBANK63049e3a'
    };

    const url = paymentUrls[paymentSystem as keyof typeof paymentUrls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      let response;
      
      if (user) {
        // Заказ для авторизованного пользователя
        const token = localStorage.getItem('token');
        if (token) {
          response = await fetch(`http://localhost:3001/api/orders`, {
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
              paymentProof: customerData.paymentProof,
              userId: user.id
            })
          });
        }
      } else {
        // Заказ для гостя
        response = await fetch(`http://localhost:3001/api/orders/guest`, {
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
            totalAmount: getTotal(),
            paymentProof: customerData.paymentProof
          })
        });
      }

      if (!response) {
        throw new Error('Не удалось создать заказ');
      }
      
      const result = await response.json();

      if (result.success) {
        const orderId = result.order?.id || result.data?.orderId;
        console.log('Заказ создан успешно:', {
          orderId,
          orderNumber: result.order?.orderNumber || result.data?.orderNumber,
          result
        });
        
        console.log('Устанавливаем orderId:', orderId.toString());
        setOrderId(orderId.toString());
        
        // Проверяем, что orderId установился
        setTimeout(() => {
          console.log('orderId после установки:', orderId.toString());
        }, 100);
        
        // Сохраняем заказ гостя локально
        if (!user && result.order) {
          addOrder(result.order);
        }
        
        // Если выбран QR-код, показываем экран оплаты
        if (paymentMethod === PaymentMethod.QR) {
          setShowPayment(true);
        } else {
          // Для других способов оплаты - стандартная логика
          clearCart();
          alert(`Заказ успешно оформлен! Номер заказа: ${result.order?.orderNumber || result.data?.orderNumber}`);
        }
      } else {
        alert('Ошибка при создании заказа: ' + result.message);
      }
    } catch (error) {
      alert('Ошибка при создании заказа. Попробуйте еще раз.');
    }
  };

  const handlePaymentComplete = () => {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="shadow-soft border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Информация для доставки</h2>
                <div className="space-y-4">
                  <Input
                    label="Имя"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ваше имя"
                    required
                  />
                  <Input
                    label="Телефон"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+996 XXX XXX XXX"
                    required
                  />
                  <Input
                    label="Адрес доставки"
                    value={customerData.address}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Улица, дом, квартира"
                    required
                  />
                  
                  {/* Способ оплаты */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Способ оплаты</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === PaymentMethod.CASH}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Наличными</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === PaymentMethod.CARD}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Картой</span>
                      </label>
                    </div>
                    
                    {/* Платежные системы для онлайн оплаты */}
                    {paymentMethod === PaymentMethod.CARD && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">Выберите способ оплаты:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleBankSelect('megapay')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-blue-600">Megapay</div>
                            <div className="text-xs text-gray-600">Электронный кошелек</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('balance')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-green-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-green-600">Balance.kg</div>
                            <div className="text-xs text-gray-600">Электронный кошелек</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('demirbank')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-blue-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-blue-600">Demirbank</div>
                            <div className="text-xs text-gray-600">Мобильное приложение</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('odengi')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-orange-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-orange-600">O!Dengi</div>
                            <div className="text-xs text-gray-600">Мобильный банк</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('bakai')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-purple-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-purple-600">Bakai</div>
                            <div className="text-xs text-gray-600">Мобильное приложение</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('companion')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-indigo-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-indigo-600">Companion</div>
                            <div className="text-xs text-gray-600">QR-платежи</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBankSelect('mbank')}
                            className="p-3 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-yellow-50 transition-colors text-center"
                          >
                            <div className="text-lg font-bold text-yellow-600">M-Bank</div>
                            <div className="text-xs text-gray-600">Мобильный банк</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Комментарии к заказу */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Комментарии к заказу</label>
                    <textarea
                      value={customerData.notes}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Дополнительные пожелания, время доставки и т.д."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Кнопки для онлайн оплаты */}
                {paymentMethod === PaymentMethod.CARD && selectedBank && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 mb-3">
                      Выбран способ: <strong>{getBankName(selectedBank)}</strong>
                    </p>
                    <div className="space-y-3">
                      {/* Кнопка перехода к платежной системе */}
                      <Button
                        onClick={() => handlePaymentRedirect(selectedBank)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        🔗 Перейти к оплате
                      </Button>
                      
                      {/* Кнопка "Я оплатил" */}
                      <Button
                        onClick={() => setShowProofUpload(true)}
                        disabled={!orderId || orderId === 'temp'}
                        className={`w-full ${
                          orderId && orderId !== 'temp' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-400 cursor-not-allowed text-gray-200'
                        }`}
                      >
                        {orderId && orderId !== 'temp' 
                          ? '📸 Загрузить чек об оплате' 
                          : 'Сначала оформите заказ'
                        }
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={!customerData.name || !customerData.phone || !customerData.address || loading}
                  className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  {loading ? 'Оформление...' : 'Оформить заказ'}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="shadow-soft border-0 sticky top-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ваш заказ</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image_url || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop'}
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
            order={{
              id: orderId,
              totalAmount: getTotal(),
              orderNumber: `MR-${Date.now()}-${orderId}`,
              customerPhone: customerData.phone,
              customerName: customerData.name
            }}
            onPaymentComplete={handlePaymentComplete}
            onClose={() => setShowPayment(false)}
          />
        </div>
      )}

      {/* Модальное окно загрузки фото чека */}
      {showProofUpload && orderId && orderId !== 'temp' && (
        <PaymentProofUpload
          orderId={orderId}
          orderNumber={`#MR-${orderId}`}
          onClose={() => setShowProofUpload(false)}
          onUploadComplete={(proofUrl) => {
            console.log('Фото чека загружено:', proofUrl);
            console.log('Детали загрузки:', {
              orderId,
              orderNumber: `#MR-${orderId}`,
              proofUrl
            });
            setShowProofUpload(false);
            // Обновляем URL изображения в форме
            setCustomerData(prev => ({ ...prev, paymentProof: proofUrl }));
          }}
        />
      )}
    </div>
  );
};

