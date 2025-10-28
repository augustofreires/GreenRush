export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
  images?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  badge?: 'new' | 'sale' | 'bestseller' | 'combo';
  rating?: number;
  reviews?: number;
  benefits?: string[];
  ingredients?: string[];
  howToUse?: string[];
  whyChoose?: string[];
  faqs?: ProductFAQ[];
  customerReviews?: ProductReview[];
  variants?: ProductVariant[];
  selectedVariant?: string;
  hidden?: boolean;
  customLandingPage?: string; // URL da landing page customizada (ex: /cha, /capsulas, /combos)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

export interface ERPConfig {
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
  syncProducts: boolean;
  syncOrders: boolean;
  syncInterval?: number;
}

export interface AppMaxConfig {
  accessToken: string;
  publicKey: string;
  apiUrl: string;
  enabled: boolean;
  trackingEnabled: boolean;
  conversionPixel?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: Date;
  slug: string;
}

export interface TestimonialVideo {
  id: string;
  title: string;
  creatorName: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  order: number;
}
