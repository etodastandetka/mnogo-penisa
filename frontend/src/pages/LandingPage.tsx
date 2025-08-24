import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Star, Clock, MapPin, Phone, Instagram } from 'lucide-react';
import { getAllProducts } from '../api/products';
import { Product } from '../types';


export const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  // 21 отзывов для отображения
  const allReviews = [
    { name: 'Михаил Соколов', rating: 5, text: 'Отличное качество и быстрая доставка. Роллы просто пальчики оближешь!' },
    { name: 'Андрей', rating: 5, text: 'Отличные цены и качество на высоте!' },
    { name: 'Наталья', rating: 5, text: 'Вкусные роллы, всегда свежие. Рекомендую!' },
    { name: 'Дмитрий', rating: 5, text: 'Лучшая доставка суши в городе!' },
    { name: 'Елена', rating: 5, text: 'Очень довольна качеством и скоростью доставки.' },
    { name: 'Сергей', rating: 5, text: 'Попробовал первый раз - теперь заказываю регулярно!' },
    { name: 'Анна', rating: 5, text: 'Отличный сервис, вкусная еда!' },
    { name: 'Владимир', rating: 5, text: 'Быстрая доставка, свежие ингредиенты.' },
    { name: 'Ольга', rating: 5, text: 'Очень вкусно, заказываю уже второй раз!' },
    { name: 'Игорь', rating: 5, text: 'Качество на высоте, рекомендую всем!' },
    { name: 'Мария', rating: 5, text: 'Отличные роллы, быстрая доставка!' },
    { name: 'Алексей', rating: 5, text: 'Попробовал и не пожалел, очень вкусно!' },
    { name: 'Татьяна', rating: 5, text: 'Лучший сервис доставки суши!' },
    { name: 'Павел', rating: 5, text: 'Отличное качество, быстрая доставка!' },
    { name: 'Юлия', rating: 5, text: 'Очень довольна, заказываю регулярно!' },
    { name: 'Роман', rating: 5, text: 'Вкусные роллы, отличный сервис!' },
    { name: 'Кристина', rating: 5, text: 'Лучшая доставка в городе!' },
    { name: 'Артем', rating: 5, text: 'Отличное качество, рекомендую!' },
    { name: 'Алина', rating: 5, text: 'Очень вкусно, быстрая доставка!' },
    { name: 'Максим', rating: 5, text: 'Лучший сервис доставки!' },
    { name: 'Виктория', rating: 5, text: 'Отличные роллы, качество на высоте!' }
  ];

  // Выбираем 3 случайных отзыва
  const randomReviews = allReviews.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Случайные продукты для показа
  const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);

  // Корпоративные услуги
  const corporateServices = [
    {
      title: 'Корпоративные мероприятия',
      description: 'Организуем питание для ваших событий',
      discount: 'Скидка до 15%',
      icon: '🏢'
    },
    {
      title: 'Детские праздники',
      description: 'Особое меню для маленьких гостей',
      discount: 'Скидка до 10%',
      icon: '🎉'
    },
    {
      title: 'Доставка в офис',
      description: 'Быстрая доставка для коллективов',
      discount: 'Скидка до 12%',
      icon: '🚚'
    }
  ];

  // Категории с реальными данными
  const categories = [
    {
      name: 'Роллы',
      icon: '🍣',
      count: products.filter(p => p.category === 'Роллы').length || 25,
      bgImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      description: 'Свежие роллы с лососем, тунцом и авокадо'
    },
    {
      name: 'Пицца',
      icon: '🍕',
      count: products.filter(p => p.category === 'Пицца').length || 18,
      bgImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      description: 'Итальянская пицца с моцареллой и пепперони'
    },
    {
      name: 'Суши',
      icon: '🍱',
      count: products.filter(p => p.category === 'Суши').length || 32,
      bgImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      description: 'Классические суши с рисом и рыбой'
    },
    {
      name: 'Напитки',
      icon: '🥤',
      count: products.filter(p => p.category === 'Напитки').length || 15,
      bgImage: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
      description: 'Освежающие напитки и соки'
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
          <button onClick={loadProducts} className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-6 h-6 bg-orange-300/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-red-300/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-5 h-5 bg-pink-300/20 rounded-full animate-spin"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="space-y-8">
              {/* Promotional Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <span className="text-lg">🍣</span> Лучшие роллы в городе
                </div>
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <span className="text-lg">🚀</span> Быстрая доставка
                </div>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                Вкусные роллы с доставкой
              </h1>
              
              {/* Sub-headline */}
              <p className="text-2xl text-orange-100 leading-relaxed drop-shadow-lg">
                Свежие ингредиенты, оригинальные рецепты и быстрая доставка прямо к вашему столу
              </p>
              
              {/* Emotional CTA */}
              <div>
                <p className="text-lg text-orange-200 mb-4 font-semibold">
                  🚀 Закажите сейчас и получите скидку 10% на первый заказ!
                </p>
                <p className="text-sm text-orange-100 mb-6">
                  ⏰ Ограниченное время! Только сегодня!
                </p>
              </div>
              
              {/* CTA Button */}
              <div>
                <Button 
                  onClick={() => navigate('/menu')}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-400"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Заказать сейчас
                </Button>
              </div>
              
              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-2">
                    <Clock className="w-6 h-6 text-white mx-auto" />
                  </div>
                  <p className="text-white text-sm font-semibold">30-60 мин</p>
                  <p className="text-orange-100 text-xs">Доставка</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-2">
                    <MapPin className="w-6 h-6 text-white mx-auto" />
                  </div>
                  <p className="text-white text-sm font-semibold">Бишкек</p>
                  <p className="text-orange-100 text-xs">Доставляем</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-2">
                    <Star className="w-6 h-6 text-white mx-auto" />
                  </div>
                  <p className="text-white text-sm font-semibold">4.9/5</p>
                  <p className="text-orange-100 text-xs">Рейтинг</p>
                </div>
              </div>
            </div>
            
            {/* Customer Reviews - Right Side */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white text-center mb-8">Отзывы наших клиентов</h2>
              {randomReviews.map((review, index) => (
                <div
                  key={review.name}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2">{review.name}</h3>
                      <div className="flex gap-1 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-orange-100 leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-white py-16 relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-4 h-4 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-yellow-200/30 rounded-full animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Популярные блюда</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Наши самые популярные и вкусные блюда, которые заказывают чаще всего
            </p>
            <p className="text-lg text-orange-600 font-semibold">
              🔥 Хит продаж! Попробуйте прямо сейчас!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {randomProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 group cursor-pointer"
                onClick={() => navigate('/menu')}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {product.price} сом
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
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-16 relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-4 h-4 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 bg-yellow-200/30 rounded-full animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🍽️ Категории блюд</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Выберите категорию и насладитесь нашими лучшими блюдами
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 group cursor-pointer"
                onClick={() => navigate('/menu')}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 group-hover:scale-110 transition-transform duration-500"
                  style={{backgroundImage: `url(${category.bgImage})`}}
                ></div>
                <div className="absolute inset-0 bg-black/20 z-0 group-hover:bg-black/10 transition-all duration-300"></div>

                <div className="relative z-10 p-8 text-center text-white h-48 flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-2 group-hover:text-orange-200 transition-colors">{category.name}</h3>
                  <p className="text-orange-100 font-semibold mb-2">{category.count} блюд</p>
                  <p className="text-orange-50 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.description}
                  </p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                    <span className="text-white font-semibold text-sm">Нажмите для просмотра</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-white py-16 relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-4 h-4 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-yellow-200/30 rounded-full animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">О нас</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Мы создаем лучшие роллы и японскую кухню для вас
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Свежие ингредиенты',
                description: 'Используем только свежие и качественные продукты',
                icon: '🥬'
              },
              {
                title: 'Быстрая доставка',
                description: 'Доставляем за 30-60 минут',
                icon: '🚚'
              },
              {
                title: 'Отличное качество',
                description: 'Гарантируем высокое качество каждого блюда',
                icon: '⭐'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>


        </div>
      </div>



      {/* Corporate Services Section */}
      <div className="bg-gray-50 py-16 relative">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-4 h-4 bg-orange-200/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-red-200/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 bg-yellow-200/30 rounded-full animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Специальные предложения</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Выгодные предложения для ваших мероприятий
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {corporateServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 p-8 text-center group flex flex-col h-full"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">{service.discount.replace('Скидка до ', '')}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <p className="text-gray-500 text-sm mb-6 flex-grow">Закажите сейчас и получите выгодную скидку</p>
                <Button 
                  onClick={() => navigate('/contact')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-auto"
                >
                  Связаться с нами
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Mnogo Rolly</h3>
              <p className="text-gray-400">
                Лучшие роллы и японская кухня в городе
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Контакты</h3>
              <div className="space-y-2 text-gray-400">
                <p>Телефон: +996 (709) 611-043</p>
                <p>Email: info@mnogo-rolly.online</p>
                <p>Адрес: г. Бишкек, ул. Ахунбаева, 182 Б</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Юридическая информация</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>ИП: Султанкулов Адилет Б.</p>
                <p>ИНН: 20504198701431</p>
                <p>Адрес: г. Бишкек, ул. Ахунбаева, 182 Б</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-400">Разработка</h3>
              <p className="text-gray-400 text-sm">
                Нужен такой же сайт?<br />
                Напишите мне: <a href="https://t.me/namekotik" className="text-orange-400 hover:text-orange-300 transition-colors">@namekotik</a>
              </p>
            </div>
          </div>


          
          {/* Copyright */}
          <div className="border-t border-orange-500/30 pt-8 text-center">
            <p className="text-orange-100">
              © 2024 Mnogo Rolly. Все права защищены.
            </p>
          </div>
        </div>
      </footer>


    </div>
  );
};
