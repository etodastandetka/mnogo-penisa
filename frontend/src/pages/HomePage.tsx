import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { productsApi } from '../api/products';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Search, Filter } from 'lucide-react';

const categoryLabels = {
  [ProductCategory.ROLLS]: 'Роллы',
  [ProductCategory.SETS]: 'Сеты',
  [ProductCategory.SUSHI]: 'Суши',
  [ProductCategory.DRINKS]: 'Напитки',
  [ProductCategory.SAUCES]: 'Соусы',
};

export const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { getItemCount } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем меню...</p>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Меню
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-100 to-orange-100 bg-clip-text text-transparent">
                Mnogo Rolly
              </span>
            </h1>
            <p className="text-xl text-white/90">Свежие суши и роллы с доставкой за 30 минут</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Корзина слева - постоянно видимая */}
          <div className="lg:w-80 lg:sticky lg:top-24 lg:h-fit">
            <Cart />
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            {/* Поиск */}
            <div className="mb-6 bg-white rounded-2xl p-4 shadow-soft">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск блюд..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Категории */}
            <div className="mb-8 bg-white rounded-2xl p-4 sm:p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Filter className="w-5 h-5 text-red-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Категории</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('all')}
                  className={`text-xs sm:text-sm ${
                    selectedCategory === 'all' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  Все
                </Button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(key as ProductCategory)}
                    className={`text-xs sm:text-sm ${
                      selectedCategory === key ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Результаты поиска */}
            {searchQuery && (
              <div className="mb-6">
                <p className="text-gray-600 text-sm sm:text-base">
                  Найдено {filteredProducts.length} {filteredProducts.length === 1 ? 'блюдо' : 'блюд'} по запросу "{searchQuery}"
                </p>
              </div>
            )}

            {/* Сетка продуктов */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-base sm:text-lg">
                  {searchQuery 
                    ? `По запросу "${searchQuery}" ничего не найдено`
                    : 'В данной категории пока нет блюд'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
