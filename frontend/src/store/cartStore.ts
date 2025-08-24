import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product: {
    id: string | number;
    name: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: any, quantity: number = 1) => {
        try {
          console.log('🛒 Adding item to cart:', { product, quantity });
          const { items } = get();
          const existingItem = items.find(item => String(item.product.id) === String(product.id));
          
          if (existingItem) {
            console.log('🛒 Updating existing item quantity');
            const updatedItems = items.map(item =>
              String(item.product.id) === String(product.id)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            set({ items: updatedItems });
          } else {
            console.log('🛒 Adding new item to cart');
            const newItem: CartItem = {
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url
              },
              quantity
            };
            const updatedItems = [...items, newItem];
            set({ items: updatedItems });
          }
          console.log('🛒 Cart updated, new items:', get().items);
        } catch (error) {
          console.error('❌ Error adding item to cart:', error);
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        try {
          console.log('🛒 Updating quantity:', { productId, quantity });
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }
          
          const { items } = get();
          const updatedItems = items.map(item =>
            String(item.product.id) === productId
              ? { ...item, quantity }
              : item
          );
          set({ items: updatedItems });
          console.log('🛒 Quantity updated, new items:', get().items);
        } catch (error) {
          console.error('❌ Error updating quantity:', error);
        }
      },

      removeItem: (productId: string) => {
        try {
          console.log('🛒 Removing item:', productId);
          const { items } = get();
          const updatedItems = items.filter(item => String(item.product.id) !== productId);
          set({ items: updatedItems });
          console.log('🛒 Item removed, new items:', get().items);
        } catch (error) {
          console.error('❌ Error removing item:', error);
        }
      },

      clearCart: () => {
        try {
          console.log('🛒 Clearing cart');
          set({ items: [] });
          console.log('🛒 Cart cleared');
        } catch (error) {
          console.error('❌ Error clearing cart:', error);
        }
      },

      getTotal: () => {
        try {
          const { items } = get();
          const total = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
          console.log('🛒 Getting total:', { items: items.length, total });
          return total;
        } catch (error) {
          console.error('❌ Error getting total:', error);
          return 0;
        }
      },

      getItemCount: () => {
        try {
          const { items } = get();
          const count = items.reduce((count, item) => count + item.quantity, 0);
          console.log('🛒 Getting item count:', { items: items.length, count });
          return count;
        } catch (error) {
          console.error('❌ Error getting item count:', error);
          return 0;
        }
      },

      getItemQuantity: (productId: string) => {
        try {
          const { items } = get();
          const item = items.find(item => String(item.product.id) === productId);
          const quantity = item ? item.quantity : 0;
          console.log('🛒 Getting item quantity:', { productId, quantity, found: !!item });
          return quantity;
        } catch (error) {
          console.error('❌ Error getting item quantity:', error);
          return 0;
        }
      },
    }),
    {
      name: 'mnogo-rolly-cart',
      onRehydrateStorage: () => (state) => {
        console.log('🛒 Cart store rehydrated:', state);
      },
    }
  )
);
