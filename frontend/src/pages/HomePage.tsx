import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { productsApi } from '../api/products';
import { ProductCard } from '../components/ProductCard';
import { FixedCart } from '../components/FixedCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCategoryName, getCategoryEmoji } from '../utils/categories';

// Теперь используем утилиты из utils/categories.ts

export const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Загружаем товары...');
      const productsData = await productsApi.getAll();
      
      if (productsData && productsData.length > 0) {
        console.log(`✅ Загружено товаров: ${productsData.length}`);
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        console.log('⚠️ Товары не найдены');
        setProducts([]);
        setFilteredProducts([]);
        setError('Товары не найдены');
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки товаров:', error);
      
      // Улучшенная обработка ошибок для мобильных устройств
      let errorMessage = 'Ошибка загрузки товаров';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
        errorMessage = 'Проблема с интернет-соединением. Проверьте подключение.';
      } else if (error.code === 'TIMEOUT_ERROR' || error.message?.includes('timeout')) {
        errorMessage = 'Превышено время ожидания. Попробуйте еще раз.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Страница не найдена.';
      }
      
      setError(errorMessage);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const filterProducts = () => {
    try {
      let filtered = [...products];

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }

      if (searchQuery.trim()) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    } catch (error) {
      console.error('❌ Ошибка фильтрации товаров:', error);
      // Fallback - показываем все товары если фильтрация не удалась
      setFilteredProducts(products);
    }
  };

  const handleCategoryChange = (category: string | 'all') => {
    try {
      setSelectedCategory(category);
    } catch (error) {
      console.error('❌ Ошибка изменения категории:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchQuery(e.target.value);
    } catch (error) {
      console.error('❌ Ошибка изменения поиска:', error);
    }
  };

  const handleRetry = () => {
    try {
      setLoading(true);
      setError('');
      
      // Пытаемся очистить кеш перед повторной попыткой
      clearPageCache();
      
      fetchProducts();
    } catch (error) {
      console.error('❌ Ошибка повторной попытки:', error);
      setError('Не удалось повторить попытку');
    }
  };

  // Функция очистки кеша страницы
  const clearPageCache = async () => {
    try {
      console.log('🧹 Очищаем кеш страницы...');
      
      // Очищаем sessionStorage
      sessionStorage.clear();
      
      // Пытаемся очистить кеш браузера
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('🧹 Кеш браузера очищен');
        } catch (e) {
          console.log('⚠️ Не удалось очистить кеш браузера:', e);
        }
      }
      
      // Очищаем localStorage если много ошибок
      if (retryCount > 2) {
        localStorage.clear();
        console.log('🧹 localStorage очищен');
      }
      
    } catch (error) {
      console.error('❌ Ошибка при очистке кеша:', error);
    }
  };

  // Автоматическое восстановление при критических ошибках
  useEffect(() => {
    if (error && retryCount > 3) {
      console.log('🔄 Много ошибок - пытаемся автоматически восстановить...');
      
      // Показываем уведомление
      showAutoFixNotification();
      
      // Автоматически очищаем кеш и перезагружаем через 5 секунд
      setTimeout(() => {
        console.log('🔄 Автоматическое восстановление...');
        clearPageCache();
        window.location.reload();
      }, 5000);
    }
  }, [error, retryCount]);

  // Показ уведомления об автоматическом исправлении
  const showAutoFixNotification = () => {
    try {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        text-align: center;
      `;
      notification.innerHTML = `
        <div>🔄 Автоматически исправляем проблему...</div>
        <div style="font-size: 12px; margin-top: 4px;">Страница перезагрузится через 5 секунд</div>
      `;
      
      document.body.appendChild(notification);
      
      // Убираем уведомление через 5 секунд
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    } catch (e) {
      console.error('Не удалось показать уведомление:', e);
    }
  };

  // Fallback для случаев когда данные не загрузились
  if (!loading && !error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Товары не найдены</h2>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить товары. Возможно, проблема с сервером.
          </p>
          <button
            onClick={handleRetry}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Загружаем меню...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-orange-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-gray-500 mb-4 text-xs sm:text-sm">
            Попыток: {retryCount}
          </p>
          <button
            onClick={handleRetry}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Попробовать снова
          </button>
          <div className="mt-4 text-xs text-gray-500">
            Если проблема повторяется, попробуйте обновить страницу
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
        {/* Заголовок и поиск */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Наше меню</h1>
          
          {/* Отладочная информация - только в development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                Всего товаров: {products.length} | Показано: {filteredProducts.length}
              </p>
            </div>
          )}
          
          <Input
            type="text"
            placeholder="Поиск блюд..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-md w-full text-sm sm:text-base"
          />
        </div>

        {/* Фильтры категорий */}
        <div className="mb-4 sm:mb-6 lg:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              onClick={() => handleCategoryChange('all')}
              className="flex-shrink-0 whitespace-nowrap text-sm px-4 py-2 rounded-full"
            >
              Все
            </Button>
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                onClick={() => handleCategoryChange(category)}
                className="flex-shrink-0 whitespace-nowrap text-sm px-4 py-2 rounded-full flex items-center gap-1"
              >
                <span>{getCategoryEmoji(category)}</span>
                <span>{getCategoryName(category)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Двухколоночный макет: меню + корзина */}
        <div className="flex gap-6 lg:gap-8">
          {/* Левая колонка - меню товаров */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
                  {searchQuery ? 'Ничего не найдено по вашему запросу' : 'В данной категории пока нет блюд'}
                </p>
              </div>
            )}
          </div>

          {/* Правая колонка - sticky корзина */}
          <div className="hidden lg:block self-start">
            <FixedCart />
          </div>
        </div>

        {/* Мобильная корзина - показывается внизу на мобильных */}
        <div className="lg:hidden mt-6">
          <FixedCart />
        </div>
      </div>
    </div>
  );
};

export const HomePage = MenuPage;
export default MenuPage;