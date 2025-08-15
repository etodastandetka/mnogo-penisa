export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
}

export interface Order {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: string;
  delivery_address: string;
  phone: string;
  notes: string | null;
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface DatabaseOrder {
  id: number;
  user_id: number | null;
  total_amount: number;
  status: string;
  delivery_address: string;
  phone: string;
  notes: string | null;
  payment_method: string;
  created_at: string;
}
