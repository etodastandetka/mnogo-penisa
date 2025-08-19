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
  const [retryCount, setRetryCount] = useState(0);

  // Функция для получения URL изображения 
  const getImageUrl = (imageUrl: string): string | null => {
    console.log('🖼️ getImageUrl для', product.name, ':', {
      input: imageUrl,
      trimmed: imageUrl?.trim(),
      notNull: imageUrl !== 'null',
      hasValue: !!imageUrl
    });
    
    // Если есть изображение - используем его
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('✅ Изображение найдено для', product.name, ':', {
        originalUrl: imageUrl,
        isMobile,
        userAgent: navigator.userAgent.substring(0, 50)
      });
      
      // Для мобильных устройств улучшаем загрузку изображений
      if (isMobile) {
        // Добавляем параметры для оптимизации на мобильных
        const separator = imageUrl.includes('?') ? '&' : '?';
        const mobileOptimizations = `${separator}mobile=1&w=400&q=80&f=webp&t=${Date.now()}`;
        const finalUrl = `${imageUrl}${mobileOptimizations}`;
        console.log('📱 Оптимизировано для мобильного:', product.name, ':', finalUrl);
        return finalUrl;
      }
      
      // Для десктопа - обычная загрузка с cache busting только для локальных изображений
      if (!imageUrl.includes('unsplash') && !imageUrl.includes('cdn.')) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        const finalUrl = `${imageUrl}${separator}v=${Date.now()}`;
        console.log('🔄 Добавлен timestamp для', product.name, ':', finalUrl);
        return finalUrl;
      }
      
      // Внешние CDN изображения возвращаем как есть
      console.log('🌐 Внешнее изображение для', product.name, ':', imageUrl);
      return imageUrl;
    }
    console.log('❌ НЕТ изображения для товара:', product.name, 'input:', imageUrl);
    return null; // Нет изображения - покажем иконку
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено для товара:', product.name);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const originalUrl = e.currentTarget.src;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.error('❌ Ошибка загрузки изображения для товара:', product.name);
    console.error('❌ URL:', originalUrl);
    console.error('❌ Попытка №:', retryCount + 1);
    console.error('❌ User Agent:', navigator.userAgent);
    console.error('❌ Is Mobile:', isMobile);
    
    // На мобильных делаем 1 попытку пересоздать URL с другими параметрами
    if (isMobile && retryCount < 1 && originalUrl.includes('mobile=1')) {
      setRetryCount(prev => prev + 1);
      setImageLoading(true);
      
      // Пробуем без WebP и с меньшим качеством
      const baseUrl = originalUrl.split('?')[0];
      const fallbackUrl = `${baseUrl}?mobile=1&w=300&q=60&t=${Date.now()}`;
      
      console.log('🔄 Повторная попытка загрузки:', fallbackUrl);
      e.currentTarget.src = fallbackUrl;
      return;
    }
    
    setImageError(true);
    setImageLoading(false);
    // Показываем категорийную иконку вместо изображения
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

  // Сброс счетчика ошибок при смене изображения
  React.useEffect(() => {
    setRetryCount(0);
    setImageError(false);
    setImageLoading(true);
  }, [imageUrl]);

  // Предзагрузка изображения для мобильных устройств
  React.useEffect(() => {
    if (imageUrl && typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        const img = new Image();
        img.onload = () => {
          console.log('✅ Предзагрузка завершена для:', product.name);
        };
        img.onerror = () => {
          console.log('❌ Ошибка предзагрузки для:', product.name);
        };
        img.src = imageUrl;
      }
    }
  }, [imageUrl, product.name]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white touch-manipulation">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100 touch-manipulation">
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
              className={`w-full h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-300 mobile-image-optimization ${
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
                userSelect: 'none',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'cover',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
              }}
            />
            
            {/* Fallback для ошибок изображения - показываем категорийные иконки */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  {product.category === 'rolls' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🍣
                    </div>
                  )}
                  {product.category === 'pizza' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🍕
                    </div>
                  )}
                  {product.category === 'wings' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🍗
                    </div>
                  )}
                  {product.category === 'snacks' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🍟
                    </div>
                  )}
                  {product.category === 'drinks' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🥤
                    </div>
                  )}
                  {product.category === 'sauces' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🥫
                    </div>
                  )}
                  {product.category === 'sets' && (
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                      🍱
                    </div>
                  )}
                  {!['rolls', 'pizza', 'wings', 'snacks', 'drinks', 'sauces', 'sets'].includes(product.category) && (
                    <div className="fallback-emoji">
                      <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-1" />
                      <span className="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-sm emoji-font">
                        🍽️
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 px-2 hidden sm:block">Изображение</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Нет изображения - показываем категорийные иконки */
          <div className="w-full h-24 sm:h-32 md:h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              {product.category === 'rolls' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🍣
                </div>
              )}
              {product.category === 'pizza' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🍕
                </div>
              )}
              {product.category === 'wings' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🍗
                </div>
              )}
              {product.category === 'snacks' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🍟
                </div>
              )}
              {product.category === 'drinks' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🥤
                </div>
              )}
              {product.category === 'sauces' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🥫
                </div>
              )}
              {product.category === 'sets' && (
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 filter drop-shadow-sm emoji-font">
                  🍱
                </div>
              )}
              {!['rolls', 'pizza', 'wings', 'snacks', 'drinks', 'sauces', 'sets'].includes(product.category) && (
                <div className="fallback-no-image">
                  <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-1" />
                </div>
              )}
              <p className="text-xs text-gray-500 px-2 hidden sm:block">Нет фото</p>
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
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 p-0 border border-gray-300 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="font-semibold min-w-[1.2rem] sm:min-w-[1.5rem] text-center text-sm sm:text-base">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 p-0 border border-gray-300 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleAddToCart}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white w-7 h-7 sm:w-8 sm:h-8 p-0 border border-red-600 flex items-center justify-center touch-manipulation active:scale-95 transition-all"
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
