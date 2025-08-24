import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Truck, Shield, Clock, Star, MapPin, Phone, Mail, ArrowRight, ShoppingCart, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../api/products';
import { sortProductsByCategory } from '../utils/categories';
import { formatPrice } from '../utils/format';
import { ErrorFixButton } from '../components/ErrorFixButton';
import type { Product } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  // Fallback данные для красивого отображения
  const fallbackProducts = [
    {
      id: 1,
      name: 'Филадельфия ролл',
      description: 'Лосось, сливочный сыр, огурец',
      price: 450,
      category: 'Роллы',
      image_url: '/images/chai.png'
    },
    {
      id: 2,
      name: 'Калифорния ролл',
      description: 'Краб, авокадо, огурец',
      price: 380,
      category: 'Роллы',
      image_url: '/images/chai.png'
    },
    {
      id: 3,
      name: 'Пицца Маргарита',
      description: 'Томатный соус, моцарелла, базилик',
      price: 650,
      category: 'Пицца',
      image_url: '/images/chai.png'
    },
    {
      id: 4,
      name: 'Пицца Пепперони',
      description: 'Пепперони, моцарелла, томатный соус',
      price: 750,
      category: 'Пицца',
      image_url: '/images/chai.png'
    }
  ];

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      // Сортируем товары по категориям (роллы и пицца первыми)
      const sortedProducts = sortProductsByCategory(data);
      setProducts(sortedProducts);
    } catch (err: any) {
      console.error('❌ Ошибка загрузки товаров:', err);
      // При ошибке используем fallback данные
      setProducts(fallbackProducts);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRetry = () => {
    loadProducts();
  };

  // Показываем только первые 8 товаров для красивого отображения
  const featuredProducts = products.length > 0 ? products.slice(0, 8) : fallbackProducts;

  const features = [
    {
      icon: Truck,
      title: 'Быстрая доставка',
      description: 'Доставляем за 30-60 минут по всему городу'
    },
    {
      icon: Shield,
      title: 'Качественные ингредиенты',
      description: 'Используем только свежие и качественные продукты'
    },
    {
      icon: Clock,
      title: 'Работаем 24/7',
      description: 'Заказывайте в любое время дня и ночи'
    }
  ];

  const popularCategories = [
    { name: 'Роллы', emoji: '🍣', count: 25 },
    { name: 'Пицца', emoji: '🍕', count: 15 },
    { name: 'Сеты', emoji: '🍱', count: 20 },
    { name: 'Напитки', emoji: '🥤', count: 12 }
  ];

  const quickMenu = [
    { name: 'Филадельфия', price: '450₽', image: '/images/chai.png' },
    { name: 'Калифорния', price: '380₽', image: '/images/chai.png' },
    { name: 'Маргарита', price: '650₽', image: '/images/chai.png' },
    { name: 'Пепперони', price: '750₽', image: '/images/chai.png' }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-salmon-400 via-salmon-500 to-salmon-600 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content - Left Side */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Promotional Badges */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 text-black font-semibold text-sm">
                  Лучшие роллы в городе
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 text-black font-semibold text-sm">
                  Быстрая доставка
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-tight animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                Вкусные роллы с доставкой
              </h1>

              {/* Sub-headline */}
              <p className="text-xl sm:text-2xl text-black/80 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                Свежие ингредиенты, оригинальные рецепты и быстрая доставка прямо к вашему столу
              </p>

              {/* CTA Button */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <Button 
                  onClick={() => navigate('/menu')}
                  className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Заказать сейчас
                </Button>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-6 pt-4 animate-fade-in-up" style={{animationDelay: '1s'}}>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-black font-semibold">30-60 мин</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-black font-semibold">По всему городу</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-black font-semibold">4.9/5</p>
                </div>
              </div>
            </div>

            {/* Customer Reviews - Right Side */}
            <div className="space-y-6 animate-fade-in-left" style={{animationDelay: '0.5s'}}>
              <h2 className="text-3xl font-bold text-black text-center mb-8">Отзывы наших клиентов</h2>
              {randomReviews.map((review, index) => (
                <div 
                  key={index} 
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                  style={{animationDelay: `${0.7 + index * 0.2}s`}}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center text-black font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-lg mb-2">{review.name}</h3>
                      <div className="flex gap-1 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-black/80 text-sm leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Services Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mobile-heading">
              Специальные предложения
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Корпоративное питание и мероприятия со скидками
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {corporateServices.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center mb-6">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">{service.discount}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Связаться с нами
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
      <footer className="bg-gray-900 text-white py-12 footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 footer-grid">
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
