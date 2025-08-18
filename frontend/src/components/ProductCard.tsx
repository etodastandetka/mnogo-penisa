import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id.toString());
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  // Функция для получения URL изображения с кеш-бастером
  const getImageUrl = (imageUrl: string | undefined) => {
    console.log('🖼️ Обработка изображения для товара:', product.name, 'URL:', imageUrl);
    
    if (!imageUrl || imageUrl === '') {
      console.log('❌ Нет изображения, используем placeholder');
      return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
    }
    
    // Если это base64 изображение, возвращаем как есть
    if (imageUrl.startsWith('data:image/')) {
      console.log('✅ Base64 изображение');
      return imageUrl;
    }
    
    // Если это относительный путь, добавляем базовый URL
    if (imageUrl.startsWith('/uploads/')) {
      const fullUrl = `https://45.144.221.227:3443${imageUrl}`;
      console.log('🔗 Относительный путь, полный URL:', fullUrl);
      return `${fullUrl}?t=${Date.now()}`;
    }
    
    // Если это полный URL, добавляем кеш-бастер
    console.log('🔗 Полный URL с кеш-бастером');
    return `${imageUrl}?t=${Date.now()}`;
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено для товара:', product.name);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Ошибка загрузки изображения для товара:', product.name, 'URL:', e.currentTarget.src);
    setImageError(true);
    setImageLoading(false);
    
    // Пробуем загрузить placeholder
    const target = e.target as HTMLImageElement;
    if (target.src !== 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop') {
      console.log('🔄 Пробуем загрузить placeholder...');
      target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
    }
  };

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleRemoveFromCart = () => {
    removeItem(product.id.toString());
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(product.id.toString());
    } else {
      updateQuantity(product.id.toString(), newQuantity);
    }
  };

  const imageUrl = getImageUrl(product.image_url || product.image);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100">
        {/* Индикатор загрузки */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
        
        {/* Изображение */}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          crossOrigin="anonymous"
        />
        
        {/* Fallback для ошибок изображения */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Фото недоступно</p>
            </div>
          </div>
        )}
        
        {/* Отладочная информация (только в development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-0 right-0 bg-black/50 text-white text-xs p-1 rounded-bl">
            {product.image_url ? 'Has img' : 'No img'}
          </div>
        )}
        
        {product.isPopular && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-3 md:left-3">
            <Badge variant="primary" className="bg-red-500 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1">
              Популярное
            </Badge>
          </div>
        )}
        {product.is_available === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="bg-gray-600 text-white text-xs sm:text-sm">
              Недоступно
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors text-sm sm:text-base line-clamp-2 min-h-[2rem] leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1 min-h-[2rem] leading-tight">
          {product.description || 'Описание отсутствует'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <span className="text-base sm:text-lg md:text-xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 border border-gray-300 flex items-center justify-center"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="font-semibold min-w-[1.2rem] sm:min-w-[1.5rem] md:min-w-[2rem] text-center text-xs sm:text-sm md:text-base">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 border border-gray-300 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleAddToCart}
              className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 border border-red-600 flex items-center justify-center"
              disabled={product.is_available === false}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
