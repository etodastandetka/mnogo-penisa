// Статусы заказов
export enum OrderStatus {
  PENDING = 0,
  PREPARING = 1,
  DELIVERING = 2,
  DELIVERED = 3,
}

// Категории товаров
export enum ProductCategory {
  ROLLS = 'rolls', // Роллы
  SETS = 'sets',
  WINGS = 'wings', // Крылья
  PIZZA = 'pizza', // Пицца
  DRINKS = 'drinks',
  SAUCES = 'sauces',
  SNACKS = 'snacks', // Снэки
}

// Способы оплаты
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  QR = 'qr',
}

// Продукт
export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image?: string; // для совместимости
  category: ProductCategory | string;
  ingredients?: string[];
  weight?: number;
  calories?: number;
  is_available?: boolean;
  isAvailable?: boolean; // для совместимости
  isPopular?: boolean;
  created_at?: string;
}

// Позиция в корзине
export interface CartItem {
  product: Product;
  quantity: number;
}

// Заказ
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  notes?: string;
  items_summary?: string; // for backend compatibility
  payment_proof?: string;
  payment_proof_date?: string;
}

export interface OrderDetail extends Order {
  items_summary?: string;
  payment_proof?: string;
  payment_proof_date?: string;
}

// Пользователь
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  token?: string;
  isAdmin?: boolean;
}

// Аналитика
export interface Analytics {
  totalOrders: number;
  averageOrderValue: number;
  popularProducts: Product[];
  revenueByPeriod: {
    period: string;
    revenue: number;
  }[];
}

// API ответы
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}



