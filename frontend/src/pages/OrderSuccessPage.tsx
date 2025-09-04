import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const paymentData = location.state as {
    paymentMethod?: string;
    amount?: number;
    cashAmount?: number;
    changeAmount?: number;
  };

  const getPaymentMethodName = (method?: string): string => {
    switch (method) {
      case 'card':
        return 'Банковская карта';
      case 'qr':
        return 'QR-код';
      case 'cash':
        return 'Наличными курьеру';
      default:
        return 'Не указан';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center">
          {/* Иконка успеха */}
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Заказ оформлен успешно!
          </h1>

          {/* Информация о заказе */}
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Номер заказа</p>
              <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
            </div>

            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Способ оплаты</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getPaymentMethodName(paymentData.paymentMethod)}
                </p>
              </div>
            )}

            {paymentData?.amount && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Сумма заказа</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentData.amount} сом
                </p>
              </div>
            )}

            {/* Информация о наличных платежах */}
            {paymentData?.paymentMethod === 'cash' && paymentData.cashAmount && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800 mb-2">Информация для курьера:</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Сумма к получению:</span> {paymentData.amount} сом
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Дадите курьеру:</span> {paymentData.cashAmount} сом
                  </p>
                  {paymentData.changeAmount && paymentData.changeAmount > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Сдача:</span> {paymentData.changeAmount} сом
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Информация о QR-платеже */}
            {paymentData?.paymentMethod === 'qr' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 mb-2">
                  💡 После оплаты по QR-коду в приложении банка, 
                  курьер получит уведомление о поступлении средств
                </p>
              </div>
            )}

            {/* Информация о карте */}
            {paymentData?.paymentMethod === 'card' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  💳 Платеж по карте будет обработан автоматически
                </p>
              </div>
            )}
          </div>

          {/* Информация о доставке */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Доставка</span>
            </div>
            <p className="text-sm text-blue-700">
              Курьер свяжется с вами в течение 15-30 минут для уточнения времени доставки
            </p>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Button>
            
            <Button 
              onClick={() => navigate('/orders')}
              variant="outline"
              className="w-full"
            >
              Мои заказы
            </Button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Если у вас есть вопросы по заказу, свяжитесь с нами по телефону:
              <br />
              <span className="font-medium">+996 555 002 029</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;