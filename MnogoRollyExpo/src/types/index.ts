export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'online';
  createdAt: string;
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface PaymentData {
  amount: number;
  orderNumber: string;
  customerPhone?: string;
  customerName?: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  ONLINE = 'online'
}
