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
      setError(null);
      console.log('📱 Загружаем товары для меню...');
      const productsData = await productsApi.getAll();
      console.log('📱 Загружено товаров:', productsData.length);
      console.log('📱 Первый товар:', productsData?.[0]);
      console.log('📱 User Agent:', navigator.userAgent);
      
      if (productsData && Array.isArray(productsData)) {
        setProducts(productsData);
        setFilteredProducts(productsData);
        setRetryCount(0); // Сбрасываем счетчик попыток при успехе
        
        // Извлекаем уникальные категории из товаров
        const categories = [...new Set(productsData.map(p => p.category))].sort();
        setAvailableCategories(categories);
        console.log('📂 Найденные категории:', categories);
      } else {
        console.error('Неверный формат данных:', productsData);
        setError('Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      setError('Не удалось загрузить меню');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchProducts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const filterProducts = () => {
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
  };

  const handleCategoryChange = (category: string | 'all') => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRetry = () => {
    setLoading(true);
    fetchProducts();
  };

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
          <p className="text-orange-600 mb-4 text-sm sm:text-base">{error}</p>
          <p className="text-gray-500 mb-4 text-xs sm:text-sm">
            Попыток: {retryCount}
          </p>
          <Button onClick={handleRetry} className="w-full sm:w-auto">
            Попробовать снова
          </Button>
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

          {/* Правая колонка - фиксированная корзина */}
          <div className="hidden lg:block">
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