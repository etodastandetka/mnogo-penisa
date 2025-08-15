import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface GuestOrderStore {
  orders: GuestOrder[];
  addOrder: (order: GuestOrder) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  getOrderByNumber: (orderNumber: string) => GuestOrder | undefined;
  clearOrders: () => void;
}

export const useGuestOrderStore = create<GuestOrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order: GuestOrder) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },
      
      updateOrderStatus: (orderId: string, status: string) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { ...order, status }
              : order
          ),
        }));
      },
      
      getOrderByNumber: (orderNumber: string) => {
        const { orders } = get();
        return orders.find(order => order.orderNumber === orderNumber);
      },
      
      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'mnogo-rolly-guest-orders',
    }
  )
);

