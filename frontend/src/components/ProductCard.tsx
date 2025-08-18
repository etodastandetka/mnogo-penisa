import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, removeItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id.toString());

  // Функция для получения URL изображения с кеш-бастером
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
    }
    
    // Если это base64 изображение, возвращаем как есть
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    
    // Если это URL, добавляем кеш-бастер
    return `${imageUrl}?t=${Date.now()}`;
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col border border-gray-200">
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={getImageUrl(product.image_url || product.image)}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
          }}
          loading="lazy"
        />
        {product.isPopular && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <Badge variant="primary" className="bg-red-500 text-white text-xs sm:text-sm">
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
      
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors text-sm sm:text-base line-clamp-2 min-h-[2rem]">
          {product.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-1 min-h-[2rem]">
          {product.description || 'Описание отсутствует'}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg sm:text-xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 p-0 border border-gray-300"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="font-semibold min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 p-0 border border-gray-300"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              size="sm"
              onClick={handleAddToCart}
              className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 sm:w-8 sm:h-8 p-0 border border-red-600"
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
