import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  onPaymentComplete: (data: any) => void;
}

interface Bank {
  key: string;
  name: string;
  domain: string;
}

type PaymentMethod = 'card' | 'qr' | 'cash';

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderId,
  amount,
  onPaymentComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('mbank');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Загружаем список банков
  useEffect(() => {
    fetchBanks();
  }, []);

  // Вычисляем сдачу при изменении суммы наличных
  useEffect(() => {
    if (cashAmount && selectedMethod === 'cash') {
      const cash = parseFloat(cashAmount);
      const change = cash - amount;
      setChangeAmount(change >= 0 ? change : 0);
    }
  }, [cashAmount, amount, selectedMethod]);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/payments/banks');
      const data = await response.json();
      
      if (data.success) {
        setBanks(data.banks);
      }
    } catch (error) {
      console.error('Ошибка загрузки банков:', error);
    }
  };

  const generateQRCode = async () => {
    if (!selectedBank) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          bank: selectedBank
        }),
      });

      const data = await response.json();

      if (data.success) {
        setQrUrl(data.qrUrl);
      } else {
        setError(data.message || 'Ошибка генерации QR-кода');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: selectedMethod,
          cashAmount: selectedMethod === 'cash' ? parseFloat(cashAmount) : undefined,
          changeAmount: selectedMethod === 'cash' ? changeAmount : undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        onPaymentComplete({
          orderId,
          paymentMethod: selectedMethod,
          amount,
          cashAmount: selectedMethod === 'cash' ? parseFloat(cashAmount) : undefined,
          changeAmount: selectedMethod === 'cash' ? changeAmount : undefined
        });
      } else {
        setError(data.message || 'Ошибка подтверждения платежа');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CreditCard className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Оплата картой</h3>
              <p className="text-gray-600 mb-4">
                После подтверждения заказа вы будете перенаправлены на страницу оплаты
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💳 Принимаем карты Visa, MasterCard, МИР
                </p>
              </div>
            </div>
            <Button 
              onClick={confirmPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                'Перейти к оплате'
              )}
            </Button>
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Оплата по QR-коду</h3>
              
              {/* Выбор банка */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Выберите банк:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.key}
                      onClick={() => setSelectedBank(bank.key)}
                      className={`p-3 rounded-lg border text-sm ${
                        selectedBank === bank.key
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>

              {qrUrl ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="w-24 h-24 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Отсканируйте QR-код в приложении банка
                      </p>
                      <p className="text-xs text-gray-500">
                        Сумма: {amount} сом
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">
                        После оплаты нажмите кнопку ниже
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Убедитесь, что платеж прошел успешно в приложении банка
                    </p>
                  </div>

                  <Button 
                    onClick={confirmPayment}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Подтверждение...
                      </>
                    ) : (
                      'Я оплатил'
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={generateQRCode}
                  disabled={loading || !selectedBank}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Генерация QR-кода...
                    </>
                  ) : (
                    'Сгенерировать QR-код'
                  )}
                </Button>
              )}
            </div>
          </div>
        );

      case 'cash':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Banknote className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Оплата наличными</h3>
              <p className="text-gray-600 mb-4">
                Укажите сумму, которую дадите курьеру
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Сумма к оплате:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {amount} сом
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Сколько дадите курьеру:
                </label>
                <Input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Введите сумму"
                  min={amount}
                  step="1"
                />
              </div>

              {cashAmount && changeAmount >= 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Сдача:
                  </label>
                  <div className={`p-3 rounded-lg text-center ${
                    changeAmount >= 0 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <span className="text-xl font-bold">
                      {changeAmount >= 0 ? changeAmount : 0} сом
                    </span>
                  </div>
                </div>
              )}

              {cashAmount && parseFloat(cashAmount) < amount && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-800 text-sm">
                      Сумма меньше стоимости заказа
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={confirmPayment}
                disabled={loading || !cashAmount || parseFloat(cashAmount) < amount}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  'Оформить заказ'
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {!selectedMethod ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center mb-6">
            Выберите способ оплаты
          </h3>
          
          <div className="grid gap-4">
            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
              onClick={() => setSelectedMethod('card')}
            >
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">Оплата картой</h4>
                  <p className="text-sm text-gray-600">
                    Visa, MasterCard, МИР
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-300"
              onClick={() => setSelectedMethod('qr')}
            >
              <div className="flex items-center space-x-4">
                <QrCode className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-medium">QR-код</h4>
                  <p className="text-sm text-gray-600">
                    МБанк, Оптима, КИЦБ, Демир
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-300"
              onClick={() => setSelectedMethod('cash')}
            >
              <div className="flex items-center space-x-4">
                <Banknote className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-medium">Наличными курьеру</h4>
                  <p className="text-sm text-gray-600">
                    Укажите сумму для сдачи
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedMethod === 'card' && 'Оплата картой'}
              {selectedMethod === 'qr' && 'Оплата по QR-коду'}
              {selectedMethod === 'cash' && 'Оплата наличными'}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedMethod(null);
                setQrUrl('');
                setCashAmount('');
                setError('');
              }}
            >
              Назад
            </Button>
          </div>

          {renderPaymentMethod()}
        </div>
      )}
    </div>
  );
};
