import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, Home, Package, Phone } from 'lucide-react';

interface OrderDetails {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Здесь можно загрузить детали заказа, если нужно
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Заголовок успеха */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Заказ успешно оформлен!
            </h1>
            <p className="text-gray-600 text-lg">
              Спасибо за ваш заказ. Мы скоро свяжемся с вами для подтверждения.
            </p>
          </div>

          {/* Информация о заказе */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Детали заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Номер заказа:</span>
                  <p className="text-lg font-mono text-orange-600">#{orderId}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Статус:</span>
                  <p className="text-green-600 font-medium">Оформлен</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Контактная информация:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Мы свяжемся с вами в ближайшее время</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Что дальше */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Что дальше?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Подтверждение заказа</h4>
                    <p className="text-sm text-gray-600">Наш менеджер свяжется с вами для подтверждения деталей</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Приготовление</h4>
                    <p className="text-sm text-gray-600">Повара начнут готовить ваш заказ</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Доставка</h4>
                    <p className="text-sm text-gray-600">Курьер доставит заказ по указанному адресу</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Вернуться в меню
            </Button>
            
            <Button
              onClick={() => navigate('/orders')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Мои заказы
            </Button>
          </div>

          {/* Контактная информация */}
          <div className="text-center mt-8 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Остались вопросы?</h3>
            <p className="text-gray-600 mb-3">
              Свяжитесь с нами любым удобным способом
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>📞 +996 XXX XXX XXX</span>
              <span>📧 info@mnogo-rolly.kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
