import React from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { getCategoryName, getCategoryEmoji } from '../utils/categories';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const addToCart = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) {
      return '';
    }
    
    // Если это внешний URL, возвращаем как есть
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Если это локальный файл, добавляем базовый URL
    if (imageUrl.startsWith('/uploads/')) {
      return imageUrl; // Nginx отдаст файл
    }
    
    // Если это base64, возвращаем как есть
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    
    return '';
  };

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Изображение товара */}
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback если нет изображения */}
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${imageUrl ? 'hidden' : ''}`}>
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Нет фото</p>
              </div>
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="space-y-4">
            {/* Цена */}
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">
                {product.price} сом
              </span>
              {product.isPopular && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  🔥 Популярный
                </span>
              )}
            </div>

            {/* Описание */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Описание
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}

            {/* Категория */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Категория:</span>
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>{getCategoryEmoji(product.category)}</span>
                <span>{getCategoryName(product.category)}</span>
              </span>
            </div>

            {/* Доступность */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Статус:</span>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                product.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.isAvailable ? '✅ В наличии' : '❌ Нет в наличии'}
              </span>
            </div>
          </div>

          {/* Управление количеством и добавление в корзину */}
          {product.isAvailable && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    Количество:
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementQuantity}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-lg font-bold text-gray-900">
                  {product.price * quantity} сом
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Добавить в корзину
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
