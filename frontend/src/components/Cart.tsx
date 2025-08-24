import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import './Cart.css';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore();
  
  // Отладочная информация
  useEffect(() => {
    console.log('🛒 Cart component mounted, items:', items);
    console.log('🛒 Cart store functions:', { updateQuantity, removeItem, clearCart, getTotal, getItemCount });
  }, [items, updateQuantity, removeItem, clearCart, getTotal, getItemCount]);

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
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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
            <Badge variant="primary" className="bg-orange-600 text-white">
              {getItemCount()} {getItemCount() === 1 ? 'товар' : 'товара'}
            </Badge>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.map((item) => {
            return (
              <div key={item.product.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image_url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          try {
                            const newQuantity = item.quantity - 1;
                            if (newQuantity >= 0 && typeof updateQuantity === 'function') {
                              updateQuantity(String(item.product.id), newQuantity);
                            }
                          } catch (error) {
                            }
                        }}
                        className="cart-button px-1.5 py-0.5 text-gray-600 rounded-l-md text-xs"
                        disabled={item.quantity <= 1}
                        type="button"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-semibold min-w-[1.5rem] text-center text-gray-900 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          try {
                            const newQuantity = item.quantity + 1;
                            if (typeof updateQuantity === 'function') {
                              updateQuantity(String(item.product.id), newQuantity);
                            }
                          } catch (error) {
                            }
                        }}
                        className="cart-button px-1.5 py-0.5 text-gray-600 rounded-r-md text-xs"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        try {
                          if (typeof removeItem === 'function') {
                            removeItem(String(item.product.id));
                          }
                        } catch (error) {
                          }
                      }}
                      className="cart-delete-button p-1 text-gray-400 rounded text-xs"
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
            onClick={() => {
              try {
                if (typeof clearCart === 'function') {
                  clearCart();
                }
              } catch (error) {
                }
            }}
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            Очистить
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
            onClick={() => {
              try {
                if (typeof navigate === 'function') {
                  navigate('/checkout');
                }
              } catch (error) {
                }
            }}
          >
            Оформить заказ
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
