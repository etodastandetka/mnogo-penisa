import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatPrice } from '../utils/format';
import { useUserStore } from '../store/userStore';
import { productsApi } from '../api/products';
import { Product } from '../types';
import { 
  ShoppingCart, Clock, MapPin, Phone, Star, Truck, Shield, Heart,
  ArrowRight, ChefHat, Utensils, Sparkles, Zap, Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productsApi.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const features = [
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Доставляем за 30-60 минут в любую точку города'
    },
    {
      icon: Shield,
      title: 'Гарантия качества',
      description: 'Свежие ингредиенты и строгий контроль качества'
    },
    {
      icon: Heart,
      title: 'Забота о клиентах',
      description: 'Индивидуальный подход и приятные бонусы'
    }
  ];

  const popularCategories = [
    { name: 'Роллы', count: 15, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop' },
    { name: 'Сеты', count: 8, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop' },
    { name: 'Суши', count: 12, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop' },
    { name: 'Напитки', count: 6, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop' }
  ];

  const quickMenu = products.slice(0, 4);

  const allReviews = [
    {
      id: 1,
      name: 'Айнура Абдыкадырова',
      initial: 'А',
      rating: 5.0,
      text: 'Невероятно вкусные роллы! Доставили за 25 минут, все было свежим и горячим. Обязательно закажу еще!',
      gradient: 'from-red-400 to-orange-400'
    },
    {
      id: 2,
      name: 'Михаил Соколов',
      initial: 'М',
      rating: 5.0,
      text: 'Лучшие роллы в городе! Качество на высоте, порции большие. Рекомендую всем любителям японской кухни.',
      gradient: 'from-orange-400 to-yellow-400'
    },
    {
      id: 3,
      name: 'Айгерим Токтобекова',
      initial: 'А',
      rating: 5.0,
      text: 'Заказываю уже третий раз! Быстрая доставка, отличный сервис. Роллы всегда свежие и вкусные.',
      gradient: 'from-yellow-400 to-red-400'
    }
  ];

  const randomReviews = allReviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/90 via-orange-500/90 to-yellow-500/90"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-red-300 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-300 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-300 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Левая колонка - основной контент */}
            <div className="text-left lg:-ml-16">
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                  🍣 Лучшие роллы в городе
                </Badge>
                <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                  ⚡ Быстрая доставка
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Вкусные роллы
                <span className="block text-yellow-300">с доставкой</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Свежие ингредиенты, оригинальные рецепты и быстрая доставка прямо к вашему столу
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={() => navigate('/menu')}
                  className="bg-white text-red-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Заказать сейчас
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить
                </Button>
              </div>
              
              <div className="flex items-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>30-60 мин</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>По всему городу</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>4.9/5</span>
                </div>
              </div>
            </div>
            
            {/* Правая колонка - отзывы (только на десктопе) */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                {randomReviews.map((review) => (
                  <div key={review.id} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {review.initial}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{review.name}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Мобильные отзывы */}
        <div className="lg:hidden px-4 pb-8">
          <div className="space-y-4">
            {randomReviews.map((review) => (
              <div key={review.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {review.initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">{review.name}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-300 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/90 text-xs leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Menu Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Попробуйте наши лучшие блюда
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите из нашего разнообразного меню свежих роллов, сетов и других блюд японской кухни
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickMenu.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/menu')}>
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image_url || product.image || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
                    }}
                  />
                  {product.isPopular && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary" className="bg-red-500 text-white">
                        Популярное
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/menu');
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Смотреть все меню
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Мы заботимся о качестве каждого блюда и комфорте наших клиентов
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Популярные категории
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите категорию и найдите свои любимые блюда
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/menu')}>
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} блюд</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы заказать вкусные роллы?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Присоединяйтесь к тысячам довольных клиентов и насладитесь лучшими роллами в городе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Заказать сейчас
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-4 rounded-xl"
            >
              <Phone className="w-5 h-5 mr-2" />
              Связаться с нами
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Mnogo Rolly</h3>
              <p className="text-gray-400 mb-4">
                Лучшие роллы с доставкой по всему городу. Свежие ингредиенты и оригинальные рецепты.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Меню</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/menu" className="hover:text-white transition-colors">Роллы</a></li>
                <li><a href="/menu" className="hover:text-white transition-colors">Сеты</a></li>
                <li><a href="/menu" className="hover:text-white transition-colors">Суши</a></li>
                <li><a href="/menu" className="hover:text-white transition-colors">Напитки</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Доставка</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Контакты</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Отзывы</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+996 555 123 456</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>г. Бишкек</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Ежедневно 10:00-23:00</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mnogo Rolly. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
