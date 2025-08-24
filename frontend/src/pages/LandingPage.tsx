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
    { name: 'Сергей', rating: 5, text: 'Отличный сервис и вкусная еда.' }
  ];

  const randomReviews = allReviews.sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 mobile-heading">
              Попробуйте наши лучшие блюда
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto mobile-subheading">
              Выберите из нашего разнообразного меню свежих роллов, сетов и других блюд японской кухни
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/menu')}
                className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700 mobile-btn mobile-btn-lg"
              >
                Смотреть все меню
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="text-lg px-8 py-4 mobile-btn"
              >
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center feature-card">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 feature-icon">
                  <feature.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 feature-title">{feature.title}</h3>
                <p className="text-gray-600 feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50 categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mobile-heading">
              Популярные категории
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Выберите любимую категорию блюд
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 category-grid">
            {popularCategories.map((category, index) => (
              <div key={index} className="text-center category-card">
                <div className="text-4xl mb-3 category-emoji">{category.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 category-name">{category.name}</h3>
                <p className="text-sm text-gray-600 category-count">{category.count} блюд</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Menu */}
      <section className="py-16 bg-white quick-menu-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mobile-heading">
              Быстрое меню
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Популярные блюда для быстрого заказа
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 quick-menu-grid">
            {quickMenu.map((item, index) => (
              <div key={index} className="text-center quick-menu-item">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 mx-auto mb-3 rounded-lg object-cover quick-menu-image"
                />
                <h3 className="font-semibold text-gray-900 mb-1 quick-menu-name">{item.name}</h3>
                <p className="text-orange-600 font-bold quick-menu-price">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mobile-heading">
              Популярные блюда
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Наши самые любимые клиентами блюда
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow mobile-card">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url || (product as any).mobile_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 mobile-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/logo.svg';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate('/menu')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Заказать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/menu')}
              className="text-lg px-8 py-4 bg-orange-600 hover:bg-orange-700 mobile-btn mobile-btn-lg"
            >
              Смотреть все меню
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white reviews-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 mobile-heading">
              Отзывы наших клиентов
            </h2>
            <p className="text-xl text-gray-600 mobile-subheading">
              Что говорят о нас довольные клиенты
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reviews-grid">
            {randomReviews.map((review, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center review-card">
                <div className="flex justify-center mb-4 review-stars">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic review-text">"{review.text}"</p>
                <p className="font-semibold text-gray-900 review-author">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 mobile-heading">
            Свяжитесь с нами
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 contact-grid">
            <div className="text-center contact-item">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 contact-icon">
                <Phone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 contact-title">Телефон</h3>
              <p className="text-gray-600 contact-info">+7 (XXX) XXX-XX-XX</p>
            </div>
            <div className="text-center contact-item">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 contact-icon">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 contact-title">Адрес</h3>
              <p className="text-gray-600 contact-info">ул. Примерная, д. 123</p>
            </div>
            <div className="text-center contact-item">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 contact-icon">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 contact-title">Время работы</h3>
              <p className="text-gray-600 contact-info">24/7</p>
            </div>
          </div>
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
                <p>Телефон: +7 (XXX) XXX-XX-XX</p>
                <p>Email: info@mnogo-rolly.online</p>
                <p>Адрес: ул. Примерная, д. 123</p>
              </div>
            </div>
            <div className="footer-section">
              <h3 className="text-xl font-semibold mb-4 footer-title">Социальные сети</h3>
              <div className="flex space-x-4 footer-social">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
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
