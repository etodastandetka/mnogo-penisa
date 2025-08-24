import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Clock, MapPin, Star, ArrowRight } from 'lucide-react';
import { getAllProducts } from '../api/products';
import { ErrorFixButton } from '../components/ErrorFixButton';
import type { Product } from '../types';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Ошибка загрузки товаров:', err);
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRetry = () => {
    loadProducts();
  };

  const allReviews = [
    { name: 'Анна', rating: 5, text: 'Отличные роллы! Быстрая доставка.' },
    { name: 'Михаил', rating: 5, text: 'Вкусная пицца, заказываю регулярно.' },
    { name: 'Елена', rating: 5, text: 'Свежие ингредиенты, рекомендую!' },
    { name: 'Дмитрий', rating: 4, text: 'Хорошее качество, но можно быстрее.' },
    { name: 'Ольга', rating: 5, text: 'Лучшие роллы в городе!' },
    { name: 'Сергей', rating: 5, text: 'Отличный сервис и вкусная еда.' },
    { name: 'Айнура Абдыкадырова', rating: 5, text: 'Невероятно вкусные роллы! Доставили за 25 минут, все было свежим и горячим. Обязательно закажу еще!' },
    { name: 'Михаил Соколов', rating: 5, text: 'Отличное качество и быстрая доставка. Роллы просто пальчики оближешь!' },
    { name: 'Айгерим Токтобекова', rating: 5, text: 'Лучшие роллы в городе! Заказываю регулярно, всегда довольна качеством.' },
    { name: 'Александр', rating: 5, text: 'Превосходное качество блюд и быстрая доставка!' },
    { name: 'Мария', rating: 5, text: 'Очень вкусно! Заказываю каждый день.' },
    { name: 'Иван', rating: 4, text: 'Хорошие роллы, доставка быстрая.' },
    { name: 'Екатерина', rating: 5, text: 'Лучший сервис доставки в городе!' },
    { name: 'Андрей', rating: 5, text: 'Отличные цены и качество на высоте!' },
    { name: 'Наталья', rating: 5, text: 'Очень довольна сервисом и едой!' },
    { name: 'Павел', rating: 4, text: 'Хорошо, но можно добавить больше соусов.' },
    { name: 'Юлия', rating: 5, text: 'Превосходно! Рекомендую всем!' },
    { name: 'Владимир', rating: 5, text: 'Отличный выбор и быстрая доставка!' },
    { name: 'Татьяна', rating: 5, text: 'Очень вкусно и красиво оформлено!' },
    { name: 'Артем', rating: 4, text: 'Хорошее качество, заказываю регулярно.' },
    { name: 'Светлана', rating: 5, text: 'Лучший сервис доставки еды!' }
  ];

  const randomReviews = allReviews.sort(() => 0.5 - Math.random()).slice(0, 3);

  const categories = [
    { name: 'Роллы', emoji: '🍣', count: products.filter(p => p.category === 'Роллы').length, bgImage: '/images/rolls-bg.jpg' },
    { name: 'Пицца', emoji: '🍕', count: products.filter(p => p.category === 'Пицца').length, bgImage: '/images/pizza-bg.jpg' },
    { name: 'Суши', emoji: '🍱', count: products.filter(p => p.category === 'Суши').length, bgImage: '/images/sushi-bg.jpg' },
    { name: 'Напитки', emoji: '🥤', count: products.filter(p => p.category === 'Напитки').length, bgImage: '/images/drinks-bg.jpg' }
  ];

  // Рандомные товары для показа
  const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 6);

  const corporateServices = [
    {
      title: 'Корпоративные обеды',
      description: 'Питание для вашей команды с доставкой в офис',
      discount: '15%',
      features: ['Меню на выбор', 'Доставка к определенному времени', 'Скидка от 10 заказов']
    },
    {
      title: 'Детские праздники',
      description: 'Вкусные и красивые блюда для детских мероприятий',
      discount: '12%',
      features: ['Детское меню', 'Красивое оформление', 'Скидка от 5 заказов']
    },
    {
      title: 'Свадебные банкеты',
      description: 'Элитное меню для вашего особенного дня',
      discount: '10%',
      features: ['Премиум ингредиенты', 'Профессиональное оформление', 'Скидка от 20 заказов']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Загружаем...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <ErrorFixButton onFix={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-300/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-300/20 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-1/3 w-24 h-24 bg-pink-300/20 rounded-full animate-spin"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-purple-300/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-blue-300/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-green-300/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-indigo-300/20 rounded-full animate-spin"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content - Left Side */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Promotional Badges */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="bg-orange-200/80 backdrop-blur-sm border-2 border-orange-300 rounded-full px-6 py-3 text-orange-800 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  🍣 Лучшие роллы в городе
                </div>
                <div className="bg-orange-200/80 backdrop-blur-sm border-2 border-orange-300 rounded-full px-6 py-3 text-orange-800 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  🚀 Быстрая доставка
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up drop-shadow-2xl" style={{animationDelay: '0.4s'}}>
                Вкусные роллы с доставкой
              </h1>

              {/* Sub-headline */}
              <p className="text-xl sm:text-2xl text-orange-100 leading-relaxed animate-fade-in-up drop-shadow-lg" style={{animationDelay: '0.6s'}}>
                Свежие ингредиенты, оригинальные рецепты и быстрая доставка прямо к вашему столу
              </p>

              {/* CTA Button */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <Button 
                  onClick={() => navigate('/menu')}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Заказать сейчас
                </Button>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-6 pt-4 animate-fade-in-up" style={{animationDelay: '1s'}}>
                <div className="text-center group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 transition-all duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold group-hover:text-orange-200 transition-colors">30-60 мин</p>
                </div>
                <div className="text-center group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 transition-all duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold group-hover:text-orange-200 transition-colors">По всему городу</p>
                </div>
                <div className="text-center group">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 group-hover:bg-white/30 transition-all duration-300">
                    <Star className="w-6 h-6 text-yellow-300" />
                  </div>
                  <p className="text-white font-semibold group-hover:text-orange-200 transition-colors">4.9/5</p>
                </div>
              </div>
            </div>

            {/* Customer Reviews - Right Side */}
            <div className="space-y-6 animate-fade-in-left" style={{animationDelay: '0.5s'}}>
              <h2 className="text-3xl font-bold text-white text-center mb-8 drop-shadow-lg">Отзывы наших клиентов</h2>
              {randomReviews.map((review, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up hover:bg-white/20"
                  style={{animationDelay: `${0.7 + index * 0.2}s`}}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2">{review.name}</h3>
                      <div className="flex gap-1 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-orange-100 text-sm leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 bg-orange-200/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-200/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              🍣 Популярные блюда
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Наши самые популярные и вкусные блюда, которые заказывают чаще всего
            </p>
          </div>

          {/* Random Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomProducts.map((product, index) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up border border-orange-100 group"
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {product.price} ₸
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-semibold text-white text-lg">{product.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <Button 
                    onClick={() => navigate('/menu')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🚀 Заказать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-200/20 rounded-full animate-spin"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              🍽️ Категории блюд
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Выберите категорию и насладитесь нашими лучшими блюдами
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up group"
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/80 to-red-500/80 z-0"></div>
                <div className="absolute inset-0 bg-black/20 z-0"></div>
                
                {/* Content */}
                <div className="relative z-10 p-8 text-center text-white h-48 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-orange-100 font-semibold">{category.count} блюд</p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-red-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-5"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-200/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200/20 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              🍣 О нас
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Мы создаем лучшие роллы и пиццу в городе с использованием свежих ингредиентов и оригинальных рецептов
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🍣', title: 'Свежие ингредиенты', description: 'Используем только качественные и свежие продукты' },
              { icon: '🚀', title: 'Быстрая доставка', description: 'Доставляем за 30-60 минут по всему городу' },
              { icon: '⭐', title: 'Лучшее качество', description: 'Гарантируем высокое качество всех наших блюд' }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up border border-orange-100"
                style={{animationDelay: `${0.3 + index * 0.2}s`}}
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-200/20 rounded-full animate-spin"></div>
          <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-pink-200/20 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-200/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/4 left-1/2 w-24 h-24 bg-blue-200/20 rounded-full animate-spin"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 mobile-heading">
              🎉 Специальные предложения
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Корпоративное питание и мероприятия со скидками
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {corporateServices.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up border border-orange-100"
                style={{animationDelay: `${0.3 + index * 0.2}s`}}
              >
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-3xl font-bold text-white">{service.discount}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🚀 Связаться с нами
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 mobile-heading">
            Попробуйте наши лучшие блюда
          </h2>
          <p className="text-xl text-gray-600 mb-8 mobile-subheading">
            Выберите из нашего разнообразного меню свежих роллов, сетов и других блюд японской кухни
          </p>
          <Button 
            onClick={() => navigate('/menu')}
            className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700 mobile-btn mobile-btn-lg"
          >
            Смотреть все меню
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 footer relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-500/10 rounded-full animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 footer-grid">
            <div className="footer-section">
              <h3 className="text-xl font-semibold mb-4 footer-title">Mnogo Rolly</h3>
              <p className="text-gray-400 footer-content">
                Лучшие роллы и японская кухня в городе
              </p>
            </div>
            <div className="footer-section">
              <h3 className="text-xl font-semibold mb-4 footer-title">Контакты</h3>
              <div className="space-y-2 text-gray-400 footer-content">
                <p>Телефон: +7 (747) 123-45-67</p>
                <p>Email: info@mnogo-rolly.online</p>
                <p>IP: 147.45.141.113</p>
              </div>
            </div>
            <div className="footer-section">
              <h3 className="text-xl font-semibold mb-4 footer-title">Социальные сети</h3>
              <div className="flex space-x-4 footer-social">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {/* Instagram icon */}
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h3 className="text-xl font-semibold mb-4 footer-title">Разработка</h3>
              <p className="text-gray-400 footer-content text-sm">
                Нужен такой же сайт?<br />
                Напишите мне: <a href="https://t.me/namekotik" className="text-orange-400 hover:text-orange-300 transition-colors">@namekotik</a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 footer-copyright">
            <p>&copy; 2024 Mnogo Rolly. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
