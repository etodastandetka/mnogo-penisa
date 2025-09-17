import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ODengiPayment } from './ODengiPayment';
import { 
  Banknote, 
  QrCode,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SimplePaymentSelectorProps {
  orderId: string;
  amount: number;
  customerPhone?: string;
  onPaymentComplete: (data: any) => void;
}

type PaymentMethod = 'cash' | 'qr';

export const SimplePaymentSelector: React.FC<SimplePaymentSelectorProps> = ({
  orderId,
  amount,
  customerPhone,
  onPaymentComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Вычисляем сдачу при изменении суммы наличных
  React.useEffect(() => {
    if (cashAmount && selectedMethod === 'cash') {
      const cash = parseFloat(cashAmount);
      const change = cash - amount;
      setChangeAmount(change >= 0 ? change : 0);
    }
  }, [cashAmount, amount, selectedMethod]);

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      // Просто подтверждаем оплату наличными
      onPaymentComplete({
        orderId,
        paymentMethod: 'cash',
        amount,
        cashAmount: parseFloat(cashAmount),
        changeAmount: changeAmount
      });
    } catch (error) {
      console.error('Ошибка подтверждения оплаты:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'cash':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Banknote className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Оплата наличными</h3>
              <p className="text-gray-600 mb-6">
                Укажите сумму, которую дадите курьеру
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма к оплате:
                </label>
                <span className="text-3xl font-bold text-gray-800">
                  {amount} сом
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сколько дадите курьеру:
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Введите сумму"
                  min={amount}
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                />
              </div>

              {cashAmount && changeAmount >= 0 && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сдача:
                  </label>
                  <span className="text-2xl font-bold text-green-800">
                    {changeAmount} сом
                  </span>
                </div>
              )}

              {cashAmount && parseFloat(cashAmount) < amount && (
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-red-800 font-medium">
                      Сумма меньше стоимости заказа
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCashPayment}
                disabled={loading || !cashAmount || parseFloat(cashAmount) < amount}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  'Подтвердить заказ'
                )}
              </Button>
            </div>
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Оплата через QR-код</h3>
              <p className="text-gray-600 mb-6">
                Быстрая и безопасная оплата через мобильное приложение
              </p>
            </div>

            <ODengiPayment
              orderId={orderId}
              amount={amount}
              description={`Заказ #${orderId}`}
              customerPhone={customerPhone}
              onPaymentComplete={onPaymentComplete}
              onClose={() => setSelectedMethod(null)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        {!selectedMethod ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Выберите способ оплаты
              </h2>
              <p className="text-gray-600">
                Заказ на сумму <span className="font-semibold">{amount} сом</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100"
                onClick={() => setSelectedMethod('cash')}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <Banknote className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Наличными курьеру</h3>
                    <p className="text-gray-600">
                      Укажите сумму для сдачи
                    </p>
                  </div>
                  <div className="text-orange-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100"
                onClick={() => setSelectedMethod('qr')}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">QR-код</h3>
                    <p className="text-gray-600">
                      Оплата через мобильное приложение
                    </p>
                  </div>
                  <div className="text-blue-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedMethod === 'cash' && 'Оплата наличными'}
                {selectedMethod === 'qr' && 'Оплата QR-кодом'}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedMethod(null);
                  setCashAmount('');
                  setChangeAmount(0);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Назад
              </Button>
            </div>

            {renderPaymentMethod()}
          </div>
        )}
      </Card>
    </div>
  );
};
