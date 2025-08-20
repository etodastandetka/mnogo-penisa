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

  // Функция для получения URL изображения с учетом мобильной версии
  const getImageUrl = (): string | null => {
    // Проверяем, является ли устройство мобильным
    const isMobile = window.innerWidth <= 768;
    
    // Приоритет: мобильное изображение для мобильных устройств, основное для десктопа
    let imageUrl = '';
    
    if (isMobile && product.mobile_image_url) {
      imageUrl = product.mobile_image_url;
      console.log('📱 Используем мобильное изображение для', product.name, ':', imageUrl);
    } else if (product.image_url || product.image) {
      imageUrl = product.image_url || product.image || '';
      console.log('💻 Используем основное изображение для', product.name, ':', imageUrl);
    }
    
    console.log('🖼️ getImageUrl для', product.name, ':', {
      isMobile,
      mobileImage: product.mobile_image_url,
      mainImage: product.image_url || product.image,
      selectedImage: imageUrl,
      trimmed: imageUrl?.trim(),
      notNull: imageUrl !== 'null',
      hasValue: !!imageUrl
    });
    
    // Если есть изображение - используем его
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
      console.log('✅ Изображение найдено для', product.name, ':', imageUrl);
      
      // Простая проверка - если URL выглядит валидно, возвращаем как есть
      // Убираем проблемные оптимизации которые могут ломать загрузку
      if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
        return imageUrl;
      }
    }
    
    console.log('❌ НЕТ изображения для товара:', product.name, 'input:', imageUrl);
    return null; // Нет изображения - покажем эмодзи
  };

  // Функция для получения fallback изображения (если основное не загрузилось)
  const getFallbackImageUrl = (): string | null => {
    // Если мы на мобильном и мобильное изображение не загрузилось, пробуем основное
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && product.mobile_image_url && (product.image_url || product.image)) {
      console.log('🔄 Мобильное изображение не загрузилось, пробуем основное для', product.name);
      return product.image_url || product.image || null;
    }
    
    return null;
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено для товара:', product.name);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const originalUrl = e.currentTarget.src;
    
    console.error('❌ Ошибка загрузки изображения для товара:', product.name);
    console.error('❌ URL:', originalUrl);
    
    // Проверяем, можем ли мы использовать fallback изображение
    const fallbackUrl = getFallbackImageUrl();
    
    if (fallbackUrl && fallbackUrl !== originalUrl) {
      console.log('🔄 Переключаемся на fallback изображение для', product.name, ':', fallbackUrl);
      // Обновляем src изображения
      e.currentTarget.src = fallbackUrl;
      setImageError(false);
      return;
    }
    
    console.log('❌ Fallback изображение недоступно, показываем эмодзи для', product.name);
    setImageError(true);
    // Показываем эмодзи fallback
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

  const imageUrl = getImageUrl();
  
  // Функция для получения эмодзи по категории
  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'rolls': '🍣',
      'pizza': '🍕', 
      'wings': '🍗',
      'snacks': '🍟',
      'drinks': '🥤',
      'sauces': '🥫',
      'sets': '🍱'
    };
    return emojiMap[category] || '🍽️';
  };
  
  // Дополнительное логирование для отладки
  React.useEffect(() => {
    console.log(`📦 ТОВАР: ${product.name}`, {
      image_url: product.image_url,
      image: product.image,
      mobile_image_url: product.mobile_image_url,
      original_image_url: product.original_image_url,
      processedImageUrl: imageUrl,
      category: product.category
    });
  }, [product, imageUrl]);

  // Обработчик изменения размера окна для переключения изображений
  React.useEffect(() => {
    const handleResize = () => {
      // Принудительно пересчитываем изображение при изменении размера окна
      console.log('🔄 Размер окна изменился, пересчитываем изображения для', product.name);
      setImageError(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Дополнительная отладка для мобильных устройств
  React.useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    console.log(`📱/💻 Устройство: ${isMobile ? 'Мобильное' : 'Десктоп'} для товара ${product.name}`, {
      mobileImage: product.mobile_image_url,
      mainImage: product.image_url || product.image,
      selectedImage: imageUrl
    });
  }, [product, imageUrl]);

  // Сброс состояния при смене изображения
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white touch-manipulation">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100 touch-manipulation">
        {imageUrl && !imageError ? (
          <>
            {/* Изображение */}
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-all duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              style={{ 
                objectFit: 'cover'
              }}
            />
            
            {/* Fallback для ошибок изображения */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-2 emoji-font">
                    {getCategoryEmoji(product.category)}
                  </div>
                  <p className="text-xs text-gray-500 px-2 hidden sm:block">Изображение недоступно</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Нет изображения - показываем эмодзи */
          <div className="w-full h-24 sm:h-32 md:h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-2 emoji-font">
                {getCategoryEmoji(product.category)}
              </div>
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

        {/* Временная отладочная информация для мобильных устройств */}
        {window.innerWidth <= 768 && (
          <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs p-1 rounded-br max-w-[120px]">
            <div>📱 Mobile</div>
            <div className="text-[10px]">
              {product.mobile_image_url ? 'Has mobile' : 'No mobile'}
            </div>
            <div className="text-[10px]">
              {imageUrl ? 'Has img' : 'No img'}
            </div>
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
