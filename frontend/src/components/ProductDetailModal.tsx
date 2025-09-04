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
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Автоматический скролл к началу модального окна при открытии
  React.useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, []);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const getImageUrl = (): string | null => {
    let imageUrl = '';
    
    // Приоритет: мобильное фото везде, затем основное как fallback
    if (product.mobile_image_url && product.mobile_image_url !== 'null' && product.mobile_image_url !== '') {
      imageUrl = product.mobile_image_url;
    } else if (product.image_url && product.image_url !== 'null' && product.image_url !== '') {
      imageUrl = product.image_url;
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

  const imageUrl = getImageUrl();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Заголовок с градиентом */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10 rounded-t-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold truncate mb-1">
                {product.name}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="bg-white bg-opacity-20 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <span>{getCategoryEmoji(product.category)}</span>
                  <span>{getCategoryName(product.category)}</span>
                </span>
                {product.isPopular && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    🔥 Популярный
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 -m-2 touch-manipulation bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Изображение товара */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback если нет изображения */}
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${imageUrl ? 'hidden' : ''}`}>
              <div className="text-center text-gray-400">
                <div className="text-8xl mb-4 opacity-60">{getCategoryEmoji(product.category)}</div>
                <p className="text-lg font-medium">Нет фото</p>
              </div>
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="space-y-6">
            {/* Цена */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Цена</p>
                  <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {product.price} сом
                  </span>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isAvailable ? '✅ В наличии' : '❌ Нет в наличии'}
                  </div>
                </div>
              </div>
            </div>

            {/* Описание */}
            {product.description && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Описание
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                  {product.description}
                </div>
              </div>
            )}
          </div>

          {/* Управление количеством и добавление в корзину */}
          {product.isAvailable && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-gray-700">
                      Количество:
                    </span>
                    <div className="flex items-center space-x-3 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                      <button
                        onClick={decrementQuantity}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Minus className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-bold text-xl text-gray-900 bg-white px-2 py-2 rounded-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Plus className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Итого:</p>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {product.price * quantity} сом
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Добавить в корзину
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
