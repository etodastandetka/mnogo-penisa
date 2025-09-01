import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (orderId) {
      setOrderDetails({
        orderId,
        errorCode,
        errorDescription,
        status: 'failed'
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return 'Недостаточно средств на карте';
      case 'CARD_DECLINED':
        return 'Карта отклонена банком';
      case 'INVALID_CARD':
        return 'Неверные данные карты';
      case 'EXPIRED_CARD':
        return 'Срок действия карты истек';
      case 'TIMEOUT':
        return 'Превышено время ожидания';
      default:
        return 'Произошла ошибка при обработке платежа';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ошибка оплаты
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            К сожалению, не удалось обработать ваш платеж. Пожалуйста, попробуйте еще раз или выберите другой способ оплаты.
          </p>
        </div>

        {orderDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4 text-red-800">Детали ошибки</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-red-700">Номер заказа:</span>
                <span className="font-medium">#{orderDetails.orderId}</span>
              </div>
              
              {orderDetails.errorCode && (
                <div className="flex justify-between">
                  <span className="text-red-700">Код ошибки:</span>
                  <span className="font-medium">{orderDetails.errorCode}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-red-700">Описание:</span>
                <span className="font-medium">
                  {orderDetails.errorDescription || getErrorMessage(orderDetails.errorCode)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Попробовать снова
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Вернуться на главную
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Что делать дальше?</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• Проверьте правильность данных карты</li>
              <li>• Убедитесь, что на карте достаточно средств</li>
              <li>• Попробуйте другую карту</li>
              <li>• Обратитесь в банк, выпустивший карту</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500">
            Если проблема повторяется, свяжитесь с нашей службой поддержки
          </p>
          
          <Button
            onClick={() => navigate('/support')}
            variant="ghost"
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Получить помощь
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailurePage;
