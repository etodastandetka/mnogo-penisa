import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Plus, Minus, Image as ImageIcon, Eye } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { Product } from '../types';
import { LazyImage } from './ui/LazyImage';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  // Защита от undefined/null
  if (!product) {
    console.log('❌ ProductCard: product is undefined/null');
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-3"></div>
          <p>Товар не найден</p>
        </div>
      </div>
    );
  }

  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id.toString());
  const [imageError, setImageError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Функция для получения URL изображения - мобильные фото приоритет везде
  const getImageUrl = (): string | null => {
    try {
      let imageUrl = '';
      
      // Приоритет: мобильное фото везде, затем основное как fallback
      if (product.mobile_image_url && product.mobile_image_url !== 'null' && product.mobile_image_url !== '') {
        imageUrl = product.mobile_image_url;
        console.log('📱 Используем мобильное фото для товара:', product.name, imageUrl);
      } else if (product.image_url && product.image_url !== 'null' && product.image_url !== '') {
        imageUrl = product.image_url;
        console.log('🖥️ Используем основное фото для товара:', product.name, imageUrl);
      }
      
      // Если есть изображение - используем его
      if (imageUrl && imageUrl.trim() && imageUrl !== 'null') {
        // Проверяем все типы URL
        if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:image/')) {
          return imageUrl;
        }
      }
      
      console.log('⚠️ Нет изображения для товара:', product.name, {
        mobile_image_url: product.mobile_image_url,
        image_url: product.image_url
      });
      return null; // Нет изображения - покажем эмодзи
    } catch (error) {
      console.error('❌ Ошибка получения URL изображения:', error);
      return null;
    }
  };

  const handleImageLoad = () => {
    try {
      console.log('✅ Изображение загружено для товара:', product.name);
      setImageError(false);
    } catch (error) {
      console.error('❌ Ошибка обработки загрузки изображения:', error);
    }
  };

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    console.log('⚠️ Ошибка загрузки изображения для товара:', product.name);
  };

  const handleAddToCart = useCallback(() => {
    addItem(product);
  }, [addItem, product]);

  const handleRemoveFromCart = useCallback(() => {
    removeItem(product.id.toString());
  }, [removeItem, product.id]);

  const handleUpdateQuantity = useCallback((newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(product.id.toString());
    } else {
      updateQuantity(product.id.toString(), newQuantity);
    }
  }, [removeItem, updateQuantity, product.id]);

  const imageUrl = useMemo(() => getImageUrl(), [product.mobile_image_url, product.image_url]);
  
  // Принудительная загрузка изображений на мобильных устройствах
  useEffect(() => {
    if (imageUrl && window.innerWidth <= 768) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        console.log('✅ Изображение предзагружено для мобильного:', product.name);
      };
      img.onerror = () => {
        console.log('⚠️ Ошибка предзагрузки изображения для мобильного:', product.name);
        setImageError(true);
      };
    }
  }, [imageUrl, product.name]);
  
  // Функция для получения эмодзи по категории
  const getCategoryEmoji = useCallback((category: string) => {
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
  }, []);
  


  // Убираем логику с resize - теперь все изображения показываются одинаково

  // Сброс состояния при смене изображения
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <>
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200 bg-white touch-manipulation">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100 touch-manipulation h-56 sm:h-48 md:h-56">
        {imageUrl && !imageError ? (
          <>
            {/* Изображение */}
            <LazyImage
              src={imageUrl}
              alt={product.name}
              className="w-full h-56 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-all duration-300"
              onError={handleImageError}
            />
            
            {/* Fallback для ошибок изображения */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 h-56 sm:h-48 md:h-56">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-2 emoji-font">
                    {getCategoryEmoji(product.category)}
                  </div>
                  <p className="text-xs text-gray-500 px-2">Изображение недоступно</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Нет изображения - показываем эмодзи */
          <div className="w-full h-56 sm:h-48 md:h-56 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-2 emoji-font">
                {getCategoryEmoji(product.category)}
              </div>
              <p className="text-xs text-gray-500 px-2">Нет фото</p>
            </div>
          </div>
        )}
        

        
        {product.isPopular && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-3 md:left-3">
            <Badge variant="primary" className="bg-orange-500 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1">
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
            <span className="text-sm sm:text-base md:text-lg font-bold text-orange-600">
              {formatPrice(product.price)}
            </span>
            
            {/* Убрана оранжевая кнопка добавления в корзину */}
          </div>
          
          {/* Кнопка "Подробнее" */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetailModal(true)}
            className="w-full text-xs sm:text-sm py-1 sm:py-2 border border-gray-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
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
});
