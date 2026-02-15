// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  stock: number;
  status: "active" | "low-stock" | "out-of-stock";
  badge?: string;
  features: ProductFeature[];
  ingredients: Ingredient[];
}

export interface ProductFeature {
  icon: string;
  title: string;
  description?: string;
}

export interface Ingredient {
  symbol: string;
  name: string;
  dosage: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  isBestSeller?: boolean;
  savings?: number;
  image?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shippingThreshold: number;
}

// Order Types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
}

// Admin Types
export interface AdminStats {
  revenue: number;
  orders: number;
  visitors: number;
}

export interface AdminContent {
  headline: string;
  announcement: string;
}

export type AdminTab = "dashboard" | "products" | "orders" | "content";

// Review Types
export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
}

// FAQ Types
export interface FAQ {
  question: string;
  answer: string;
}
