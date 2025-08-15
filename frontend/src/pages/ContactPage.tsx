import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  MessageCircle,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white overflow-hidden pt-16">
        {/* Фоновые элементы как на главной */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 via-orange-500/90 to-yellow-500/90"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-red-300 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-300 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-300 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
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
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-red-600" />
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
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
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
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
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
                  className="w-12 h-12 p-0 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Напишите нам</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тема
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200">
                      <option>Выберите тему</option>
                      <option>Заказ и доставка</option>
                      <option>Качество блюд</option>
                      <option>Жалоба</option>
                      <option>Предложение</option>
                      <option>Другое</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сообщение
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Опишите ваш вопрос или предложение..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Отправить сообщение
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ секция */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-700 border-red-200">
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

            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Есть ли минимальная сумма заказа?
                </h3>
                <p className="text-gray-600">
                  Минимальная сумма заказа составляет 500 рублей. При заказе на меньшую сумму взимается дополнительная плата за доставку.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Какие способы оплаты вы принимаете?
                </h3>
                <p className="text-gray-600">
                  Мы принимаем наличные, банковские карты и электронные платежи. Оплата производится при получении заказа.
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










