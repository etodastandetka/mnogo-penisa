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
  // Защита от undefined/null
  if (!product) {
    console.log('❌ ProductCard: product is undefined/null');
    return null;
  }
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id.toString());
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');

  // Функция для получения URL изображения 
  const getImageUrl = (imageUrl: string): string | null => {
    // Если есть изображение - используем его
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('🖼️ Обрабатываем изображение:', {
        productName: product.name,
        originalUrl: imageUrl,
        isMobile,
        userAgent: navigator.userAgent.substring(0, 50)
      });
      
      // Добавляем timestamp для борьбы с кэшированием на мобильных (только для наших изображений)
      if (!imageUrl.includes('unsplash')) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        const finalUrl = `${imageUrl}${separator}v=${Date.now()}`;
        console.log('🔄 Добавлен timestamp:', finalUrl);
        return finalUrl;
      }
      // Unsplash изображения возвращаем как есть
      console.log('🌐 Unsplash изображение:', imageUrl);
      return imageUrl;
    }
    console.log('❌ Нет изображения для товара:', product.name);
    return null; // Нет изображения - покажем иконку
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено для товара:', product.name);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const originalUrl = e.currentTarget.src;
    console.error('❌ Ошибка загрузки изображения для товара:', product.name);
    console.error('❌ URL:', originalUrl);
    console.error('❌ User Agent:', navigator.userAgent);
    console.error('❌ Is Mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    setImageError(true);
    setImageLoading(false);
    // Показываем категорийную иконку вместо попытки загрузить другое изображение
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

  const imageUrl = getImageUrl(product.image_url || product.image || '');
  
  // Дополнительное логирование для отладки
  React.useEffect(() => {
    console.log(`📦 ТОВАР: ${product.name}`, {
      image_url: product.image_url,
      image: product.image,
      original_image_url: product.original_image_url,
      processedImageUrl: imageUrl,
      category: product.category
    });
  }, [product, imageUrl]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100">
        {imageUrl ? (
          <>
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
              className={`w-full h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              style={{ 
                imageRendering: 'auto',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
            
            {/* Fallback для ошибок изображения - показываем категорийные иконки */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  {product.category === 'rolls' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🍣</div>)}
                  {product.category === 'pizza' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🍕</div>)}
                  {product.category === 'wings' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🍗</div>)}
                  {product.category === 'snacks' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🍟</div>)}
                  {product.category === 'drinks' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🥤</div>)}
                  {product.category === 'sauces' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🥫</div>)}
                  {product.category === 'sets' && (<div className="text-2xl sm:text-4xl md:text-5xl mb-1">🍱</div>)}
                  {!['rolls', 'pizza', 'wings', 'snacks', 'drinks', 'sauces', 'sets'].includes(product.category) && (
                    <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-1" />
                  )}
                  <p className="text-xs text-gray-500 px-2 hidden sm:block">Изображение</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Временно показываем Unsplash вместо смайликов для отладки */
          <img
            src="https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop"
            alt={product.name}
            className="w-full h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
            onLoad={() => console.log('✅ Fallback Unsplash загружен для:', product.name)}
            onError={() => console.error('❌ Даже Unsplash не загрузился для:', product.name)}
          />
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
        <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors text-xs sm:text-sm md:text-base line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem] leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 text-xs mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 flex-1 min-h-[1rem] sm:min-h-[2rem] leading-tight">
          {product.description || 'Описание отсутствует'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 p-0 border border-gray-300 flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-semibold min-w-[1rem] sm:min-w-[1.2rem] text-center text-xs sm:text-sm">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 p-0 border border-gray-300 flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleAddToCart}
              className="bg-red-600 hover:bg-red-700 text-white w-6 h-6 sm:w-7 sm:h-7 p-0 border border-red-600 flex items-center justify-center"
              disabled={product.is_available === false}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
