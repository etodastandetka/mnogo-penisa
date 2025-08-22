import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';

export const FixedCart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="w-full lg:w-80 h-fit lg:fixed lg:right-8 lg:top-24 lg:z-50">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2">Корзина пуста</h3>
            <p className="text-gray-600 text-xs lg:text-sm">Добавьте товары из меню</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 h-fit lg:fixed lg:right-8 lg:top-24 lg:z-50">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="p-3 lg:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Корзина</h2>
              <Badge variant="primary" className="bg-orange-600 text-white text-xs">
                {getItemCount()} {getItemCount() === 1 ? 'товар' : 'товара'}
              </Badge>
            </div>
          </div>

          <div className="max-h-64 lg:max-h-96 overflow-y-auto">
            {items.map((item) => (
                             <div key={item.product.id} className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image_url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(String(item.product.id), item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs font-bold"
                        disabled={item.quantity <= 1}
                        type="button"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 font-semibold min-w-[1.5rem] text-center text-gray-900 text-xs bg-gray-50 rounded">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(String(item.product.id), item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-xs font-bold"
                        type="button"
                      >
                        +
                      </button>
                      
                      <button
                        onClick={() => removeItem(String(item.product.id))}
                        className="ml-auto p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 lg:gap-3 p-3 lg:p-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-base lg:text-lg font-semibold text-gray-900">Итого:</span>
            <span className="text-xl lg:text-2xl font-bold text-orange-600">
              {formatPrice(getTotal())}
            </span>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 text-xs lg:text-sm"
            >
              Очистить
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-xs lg:text-sm"
              onClick={() => navigate('/checkout')}
            >
              Оформить
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
