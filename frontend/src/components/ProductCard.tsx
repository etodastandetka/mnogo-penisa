import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Plus, Minus, Image as ImageIcon, Eye } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

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
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Функция для получения URL изображения с приоритетом мобильных фото на мобильных устройствах
  const getImageUrl = (): string | null => {
    // Определяем, мобильное ли устройство
    const isMobile = window.innerWidth <= 768;
    
    let imageUrl = '';
    
    if (isMobile && product.mobile_image_url && product.mobile_image_url !== 'null' && product.mobile_image_url !== '') {
      // На мобильных устройствах приоритет мобильному фото
      imageUrl = product.mobile_image_url;
    } else if (product.image_url && product.image_url !== 'null' && product.image_url !== '') {
      // На десктопе или если нет мобильного фото - основное фото
      imageUrl = product.image_url;
    } else if (product.mobile_image_url && product.mobile_image_url !== 'null' && product.mobile_image_url !== '') {
      // Fallback на мобильное фото, если основного нет
      imageUrl = product.mobile_image_url;
    }
    
    // Если есть изображение - используем его
    if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
      // Проверяем все типы URL
      if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:image/')) {
        return imageUrl;
      }
    }
    
    return null; // Нет изображения - покажем эмодзи
  };

  const handleImageLoad = () => {
    console.log('✅ Изображение загружено для товара:', product.name);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
  


  // Убираем логику с resize - теперь все изображения показываются одинаково

  // Сброс состояния при смене изображения и обновление при изменении размера окна
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Обработчик изменения размера окна для обновления изображений
  React.useEffect(() => {
    const handleResize = () => {
      // Принудительно обновляем изображение при изменении размера
      setImageError(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white touch-manipulation">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100 touch-manipulation h-40 sm:h-48 md:h-56">
        {imageUrl && !imageError ? (
          <>
            {/* Изображение */}
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-40 sm:h-48 md:h-56 object-contain group-hover:scale-110 transition-all duration-300"
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
          <div className="w-full h-40 sm:h-48 md:h-56 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-2 emoji-font">
                {getCategoryEmoji(product.category)}
              </div>
              <p className="text-xs text-gray-500 px-2 hidden sm:block">Нет фото</p>
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
        
        <div className="mt-auto pt-1 sm:pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 p-0 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 flex items-center justify-center touch-manipulation active:scale-95 transition-all duration-200 rounded-full"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <span className="font-bold min-w-[2rem] sm:min-w-[2.5rem] text-center text-sm sm:text-base text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-9 sm:h-9 p-0 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 flex items-center justify-center touch-manipulation active:scale-95 transition-all duration-200 rounded-full"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            ) : (
              <Button 
                size="sm"
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white w-8 h-8 sm:w-9 sm:h-9 p-0 border-0 shadow-lg hover:shadow-xl flex items-center justify-center touch-manipulation active:scale-95 transition-all duration-200 rounded-full"
                disabled={product.is_available === false}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </div>
          
          {/* Кнопка "Подробнее" */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetailModal(true)}
            className="w-full text-xs sm:text-sm py-1 sm:py-2 border border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Подробнее
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Модальное окно с подробной информацией */}
    {showDetailModal && (
      <ProductDetailModal
        product={product}
        onClose={() => setShowDetailModal(false)}
      />
    )}
    </>
  );
};
