import React from 'react';
import { Cart } from '../components/Cart';

export const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mobile-heading">
            Корзина
          </h1>
          <p className="text-xl text-gray-600 mobile-subheading">
            Ваши выбранные товары
          </p>
        </div>
        
        <Cart />
      </div>
    </div>
  );
};

export default CartPage;
