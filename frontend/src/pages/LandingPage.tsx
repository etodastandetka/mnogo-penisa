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
  ArrowRight, ChefHat, Utensils, Sparkles, Zap, Award, Instagram
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobile(isMobile);
      
      // Специальная проверка для iPhone Safari
      const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isIPhone && isSafari) {
        console.log('🍎 Обнаружен iPhone Safari - применяем специальные настройки');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        console.log('🔄 Загружаем товары...');
        
        // Специальная проверка для мобильных устройств
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          console.log('📱 Мобильное устройство обнаружено');
          console.log('📱 User-Agent:', navigator.userAgent);
          console.log('📱 Размер экрана:', window.innerWidth, 'x', window.innerHeight);
          console.log('📱 API Base URL: https://147.45.141.113:3444/api');
          console.log('📱 Полный URL для товаров: https://147.45.141.113:3444/api/products');
        }
        
        const productsData = await productsApi.getAll();
        setProducts(productsData);
        console.log(`✅ Товары загружены: ${productsData.length}`);
      } catch (error: any) {
        console.error('❌ Ошибка загрузки продуктов:', error);
        
        // Детальная диагностика для мобильных
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          console.log('📱 Детали ошибки на мобильном:');
          console.log('📱 Код ошибки:', error.code);
          console.log('📱 Сообщение:', error.message);
          console.log('📱 Тип ошибки:', error.name);
          if (error.response) {
            console.log('📱 Статус ответа:', error.response.status);
            console.log('📱 Данные ответа:', error.response.data);
          }
        }
        
        setError(error.message || 'Ошибка загрузки данных');
        
        // Fallback: используем базовые данные
        console.log('🔄 Используем fallback данные...');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    
    // Простая задержка для стабильности
    const timer = setTimeout(() => {
      loadProducts();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Fallback данные для случаев, когда API недоступен
  const fallbackProducts: Product[] = [
    {
      id: 'fallback-1',
      name: 'Филадельфия ролл',
      description: 'Классический ролл с лососем, сливочным сыром и огурцом',
      price: 1200,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
      mobile_image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
      isAvailable: true,
      isPopular: true
    },
    {
      id: 'fallback-2',
      name: 'Калифорния ролл',
      description: 'Нежный ролл с крабом, авокадо и огурцом',
      price: 1100,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop',
      mobile_image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&h=200&fit=crop',
      isAvailable: true,
      isPopular: true
    },
    {
      id: 'fallback-3',
      name: 'Унаги ролл',
      description: 'Ролл с угрем, огурцом и соусом унаги',
      price: 1400,
      category: 'rolls',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      mobile_image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      isAvailable: true,
      isPopular: true
    }
  ];

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
    { name: 'Пицца', count: 12, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop' },
    { name: 'Напитки', count: 6, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop' }
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

  // Показываем загрузку пока данные не загружены
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Загружаем...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку если что-то пошло не так
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
          <p className="text-lg mb-6 text-white/90">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Fallback для старых браузеров */}
        <div className="absolute inset-0 bg-orange-500"></div>
        
        {/* Современные градиенты с fallback */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-400 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-orange-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Дополнительные блики */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-white/40 rounded-full opacity-50 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-white/30 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-white/50 rounded-full opacity-70 animate-ping" style={{animationDelay: '0.8s'}}></div>
            <div className="absolute top-3/4 right-1/2 w-4 h-4 bg-white/40 rounded-full opacity-60 animate-pulse" style={{animationDelay: '2.5s'}}></div>
            <div className="absolute top-1/6 left-1/2 w-4 h-4 bg-white/30 rounded-full opacity-50 animate-ping" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-white/40 rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Левая колонка - основной контент */}
            <div className="text-left lg:-ml-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
                <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                  🍣 Лучшие роллы
                </Badge>
                <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                  ⚡ Быстрая доставка
                </Badge>
              </div>
              
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Вкусные роллы
                <span className="block text-yellow-300">с доставкой</span>
            </h1>
              
              <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
                Свежие ингредиенты, оригинальные рецепты и быстрая доставка прямо к вашему столу
            </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Button 
                onClick={() => navigate('/menu')}
                  className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 border-white/20"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Заказать сейчас
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = 'tel:+996709611043'}
                  className="bg-white/10 border-2 border-white/30 text-white hover:bg-white hover:text-orange-600 font-bold text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105 hover:-translate-y-1 border-2 border-white/20"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:w-6 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Связаться с нами</span>
                  <span className="sm:hidden">Позвонить</span>
              </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-white/80 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>30-60 мин</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>По всему городу</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
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
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Попробуйте наши лучшие блюда
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Выберите из нашего разнообразного меню свежих роллов, сетов и других блюд японской кухни
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickMenu.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/menu')}>
                <div className="relative overflow-hidden rounded-t-xl">
                  {(product.image_url || product.mobile_image_url || product.image) ? (
                    <img
                      src={product.image_url || product.mobile_image_url || product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div class="text-center">
                                <div class="w-16 h-16 text-gray-400 mx-auto mb-2">📷</div>
                                <p class="text-sm text-gray-500">Нет фото</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-16 h-16 text-gray-400 mx-auto mb-2">📷</div>
                        <p className="text-sm text-gray-500">Нет фото</p>
                      </div>
                    </div>
                  )}
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

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Смотреть все меню
              <ArrowRight className="w-6 h-6 ml-3" />
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
      <section className="relative py-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Fallback для старых браузеров */}
        <div className="absolute inset-0 bg-orange-500"></div>
        
        {/* Фоновые элементы */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-orange-400 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-orange-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Готовы заказать вкусные роллы?
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-white/90">
            Присоединяйтесь к тысячам довольных клиентов и насладитесь лучшими роллами в городе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Button 
              onClick={() => navigate('/menu')}
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border-2 border-white/20"
            >
              <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
              Заказать сейчас
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'tel:+996709611043'}
              className="bg-white/10 border-2 border-white/40 text-white hover:bg-white hover:text-orange-600 font-bold text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 shadow-2xl hover:shadow-[0_25px_60px_rg-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transform hover:scale-110 hover:-translate-y-2"
            >
              <Phone className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Связаться с нами</span>
              <span className="sm:hidden">Позвонить</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Events & Corporate Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Доставка еды для мероприятий
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Организуем питание для любых событий: от детских праздников до корпоративных мероприятий
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-white">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Детские праздники
              </h3>
              <div className="mb-3 text-center">
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
                  🎉 Скидка 10%
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
                Вкусные роллы и пицца для детских дней рождения, выпускных и других праздников
              </p>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Связаться с нами
              </Button>
            </div>
            
            <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-white">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5h2zm0 4h2v2H7V9h2zm0 4h2v2H7v-2z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Корпоративы
              </h3>
              <div className="mb-3 text-center">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-medium">
                  🏢 Скидка 12%
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
                Питание для офисных мероприятий, встреч с клиентами и корпоративных обедов
              </p>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-2 rounded-lg transition-all duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Связаться с нами
              </Button>
            </div>
            
            <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-white">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Свадьбы и торжества
              </h3>
              <div className="mb-3 text-center">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-medium">
                  💒 Скидка 15%
                </Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
                Элегантные наборы роллов и пиццы для свадеб, юбилеев и других торжественных событий
              </p>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-medium py-2 rounded-lg transition-all duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Связаться с нами
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Заказать питание для мероприятия
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                Свяжитесь с нами для обсуждения деталей, расчета стоимости и составления индивидуального меню
              </p>
              <div className="flex justify-center mb-4">
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 text-sm font-bold px-4 py-2">
                  🎉 Скидки 10-15% на все мероприятия!
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Телефон для заказа</p>
                    <p className="text-orange-600 font-bold text-lg">+996 (709) 611-043</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Время работы</p>
                    <p className="text-gray-600">Ежедневно 10:00-23:00</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Доставка</p>
                    <p className="text-gray-600">По всему городу, время согласовывается</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Заказать для мероприятия
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Менеджер свяжется с вами в течение 15 минут
                </p>
              </div>
            </div>
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
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <button 
                  onClick={() => window.open('https://www.instagram.com/mnogo_rolly', '_blank')}
                  className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Меню</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/menu" className="hover:text-white transition-colors">Роллы</a></li>
                <li><a href="/menu" className="hover:text-white transition-colors">Сеты</a></li>
                <li><a href="/menu" className="hover:text-white transition-colors">Роллы</a></li>
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
                  <span>+996 (709) 611-043</span>
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
