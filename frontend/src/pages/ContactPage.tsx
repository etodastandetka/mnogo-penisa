import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Фоновые элементы как на главной */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 via-orange-600/90 to-orange-700/90"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-400 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-orange-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          {/* Блики */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-4 h-4 bg-white rounded-full opacity-60 animate-ping"></div>
            <div className="absolute top-40 right-40 w-2 h-2 bg-white rounded-full opacity-80 animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-40 left-1/3 w-3 h-3 bg-white rounded-full opacity-70 animate-ping" style={{animationDelay: '2s'}}></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              <Phone className="w-4 h-4 mr-2" />
              Свяжитесь с нами
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Контакты
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Мы всегда готовы помочь вам с заказом и ответить на любые вопросы
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Свяжитесь с нами</h2>
              <p className="text-lg text-gray-600 mb-8">
                Наша команда готова помочь вам с заказом, ответить на вопросы 
                и сделать ваш опыт заказа максимально приятным.
              </p>
            </div>

            {/* Контактные данные */}
            <div className="space-y-6">
              <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
                      <p className="text-gray-600 mb-1">+996 (709) 611-043</p>
                      <p className="text-sm text-gray-500">Ежедневно с 10:00 до 23:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>



              <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Адрес</h3>
                      <p className="text-gray-600 mb-1">ул. Ахунбаева, 182 Б</p>
                      <p className="text-sm text-gray-500">г. Бишкек, Кыргызстан</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Время работы</h3>
                      <p className="text-gray-600 mb-1">Ежедневно: 10:00 - 23:00</p>
                      <p className="text-sm text-gray-500">Доставка: 30-60 минут</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Социальные сети */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Мы в социальных сетях</h3>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                  onClick={() => window.open('https://www.instagram.com/mnogo_rolly', '_blank')}
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>


        </div>

        {/* FAQ секция */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              ❓ Часто задаваемые вопросы
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ответы на самые популярные вопросы наших клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Сколько времени занимает доставка?
                </h3>
                <p className="text-gray-600">
                  Мы доставляем заказы в течение 30-60 минут в зависимости от расстояния и загруженности.
                </p>
              </CardContent>
            </Card>

            {/* Блок преимуществ */}
            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚚</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Быстрая доставка</h3>
                    <p className="text-gray-600 text-sm">
                      Доставляем заказы в течение 30-60 минут по всему Бишкеку
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💳</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Удобная оплата</h3>
                    <p className="text-gray-600 text-sm">
                      Принимаем онлайн оплату и наличные. Безопасно и быстро
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Качество гарантировано</h3>
                    <p className="text-gray-600 text-sm">
                      Используем только свежие ингредиенты и готовим с любовью
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Какие способы оплаты вы принимаете?
                </h3>
                <p className="text-gray-600">
                  Мы принимаем онлайн оплату через банки и наличные. Заказ начнет готовиться как только деньги получим.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Можно ли отменить заказ?
                </h3>
                <p className="text-gray-600">
                  Заказ можно отменить до начала приготовления. Позвоните нам по телефону, указанному в подтверждении заказа.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;










