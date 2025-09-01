import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    
    if (orderId) {
      // Здесь можно загрузить детали заказа
      setOrderDetails({
        orderId,
        paymentId,
        status: 'success'
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Оплата прошла успешно!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Спасибо за ваш заказ. Мы получили подтверждение оплаты и начнем его обработку.
          </p>
        </div>

        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Детали заказа</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Номер заказа:</span>
                <span className="font-medium">#{orderDetails.orderId}</span>
              </div>
              
              {orderDetails.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID платежа:</span>
                  <span className="font-medium">{orderDetails.paymentId}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Статус:</span>
                <span className="text-green-600 font-medium">Оплачен</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Вернуться на главную
          </Button>
          
          {orderDetails?.orderId && (
            <Button
              onClick={() => navigate(`/order-success/${orderDetails.orderId}`)}
              variant="outline"
              className="w-full py-3 text-lg"
            >
              <Receipt className="w-5 h-5 mr-2" />
              Посмотреть заказ
            </Button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Если у вас есть вопросы по заказу, свяжитесь с нашей службой поддержки
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
