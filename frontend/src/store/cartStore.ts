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
          const { items } = get();
          const existingItem = items.find(item => String(item.product.id) === String(product.id));
          
          if (existingItem) {
            const updatedItems = items.map(item =>
              String(item.product.id) === String(product.id)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            set({ items: updatedItems });
            } else {
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
        } catch (error) {
          }
      },

      updateQuantity: (productId: string, quantity: number) => {
        try {
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
          } catch (error) {
          }
      },

      removeItem: (productId: string) => {
        try {
          const { items } = get();
          const updatedItems = items.filter(item => String(item.product.id) !== productId);
          set({ items: updatedItems });
          } catch (error) {
          }
      },

      clearCart: () => {
        try {
          set({ items: [] });
          } catch (error) {
          }
      },

      getTotal: () => {
        try {
          const { items } = get();
          const total = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
          return total;
        } catch (error) {
          return 0;
        }
      },

      getItemCount: () => {
        try {
          const { items } = get();
          const count = items.reduce((count, item) => count + item.quantity, 0);
          return count;
        } catch (error) {
          return 0;
        }
      },

      getItemQuantity: (productId: string) => {
        try {
          const { items } = get();
          const item = items.find(item => String(item.product.id) === productId);
          const quantity = item ? item.quantity : 0;
          return quantity;
        } catch (error) {
          return 0;
        }
      },
    }),
    {
      name: 'mnogo-rolly-cart',
      onRehydrateStorage: () => (state) => {
        },
    }
  )
);
