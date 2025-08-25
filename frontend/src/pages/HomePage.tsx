import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ErrorFixButton } from '../components/ErrorFixButton';
import { getAllProducts } from '../api/products';
import { Product } from '../types';
import { FixedCart } from '../components/FixedCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCategoryName, getCategoryEmoji, sortProductsByCategory } from '../utils/categories';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Загружаем товары...');
      const data = await getAllProducts();
      
      if (data && data.length > 0) {
        console.log(`✅ Загружено товаров: ${data.length}`);
        // Сортируем товары по категориям (роллы и пицца первыми)
        const sortedProducts = sortProductsByCategory(data);
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
        
        // Получаем уникальные категории для фильтра
        const categories = [...new Set(sortedProducts.map(p => p.category))];
        setAvailableCategories(categories);
      } else {
        console.log('⚠️ Товары не найдены');
        setProducts([]);
        setFilteredProducts([]);
        setError('Товары не найдены');
      }
    } catch (err: any) {
      console.error('❌ Ошибка загрузки товаров:', err);
      setError(err.message || 'Ошибка загрузки товаров');
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
    let filtered = products;

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем меню...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Попробовать снова
            </Button>
            <ErrorFixButton onFix={handleRetry} error={error || undefined} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mobile-heading">Меню</h1>
              <p className="text-gray-600 mobile-subheading">Выберите из нашего разнообразного меню</p>
            </div>
            <div className="flex gap-2">
              <ErrorFixButton onFix={handleRetry} error={error || undefined} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full search-input"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 category-filters">
              <Button
                variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                onClick={() => handleCategoryChange('all')}
                className="whitespace-nowrap category-filter-btn"
              >
                Все ({products.length})
              </Button>
              {availableCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  onClick={() => handleCategoryChange(category)}
                  className="whitespace-nowrap category-filter-btn"
                >
                  {getCategoryEmoji(category)} {getCategoryName(category)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Products and Cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : 'В данной категории пока нет товаров'}
                </p>
                <Button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700 mobile-btn">
                  Попробовать снова
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-96 lg:flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden sticky top-4">
              <FixedCart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;