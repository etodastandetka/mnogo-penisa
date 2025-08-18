import React from 'react';
import { useUserStore } from '../store/userStore';
import { ordersApi } from '../api/orders';
import { useState, useEffect } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { user } = useUserStore();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const checkActiveOrders = async () => {
      if (user) {
        try {
          const orders = await ordersApi.getUserOrders();
          if (orders.length > 0) {
            const latestOrder = orders[0];
            const active = latestOrder.status !== 'delivered' && latestOrder.status !== 'cancelled';
            setHasActiveOrder(active);
          }
        } catch (error) {
          console.error('Ошибка получения заказов:', error);
        }
      }
    };

    checkActiveOrders();
  }, [user]);

  return (
    <div className={`min-h-screen ${hasActiveOrder ? 'pt-20 sm:pt-16' : ''}`}>
      {children}
    </div>
  );
};
