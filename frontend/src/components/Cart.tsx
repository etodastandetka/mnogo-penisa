import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Корзина пуста</h3>
          <p className="text-gray-600 mb-6">Добавьте товары из меню, чтобы оформить заказ</p>
          <Button 
            onClick={() => navigate('/menu')}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Перейти к меню
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Корзина</h2>
            <Badge variant="primary" className="bg-red-600 text-white">
              {getItemCount()} {getItemCount() === 1 ? 'товар' : 'товара'}
            </Badge>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-start gap-3 p-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={item.product.image_url || item.product.image || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop';
                  }}
                />
                {item.product.isPopular && (
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="primary" className="bg-red-500 text-white text-xs px-1 py-0">
                      Поп
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-xs">
                  {item.product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatPrice(item.product.price)} × {item.quantity}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center border border-gray-200 rounded-md bg-white">
                  <button
                    onClick={() => updateQuantity(item.product.id.toString(), item.quantity - 1)}
                    className="px-1.5 py-0.5 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors rounded-l-md text-xs"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-2 py-0.5 font-semibold min-w-[1.5rem] text-center text-gray-900 text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id.toString(), item.quantity + 1)}
                    className="px-1.5 py-0.5 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors rounded-r-md text-xs"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.product.id.toString())}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between w-full">
          <span className="text-lg font-semibold text-gray-900">Итого:</span>
          <span className="text-2xl font-bold text-red-600">
            {formatPrice(getTotal())}
          </span>
        </div>
        
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={clearCart}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Очистить
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
            onClick={() => navigate('/checkout')}
          >
            Оформить заказ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
