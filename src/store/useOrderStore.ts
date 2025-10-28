import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '../types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrdersByUserId: (userId: string) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

// Mock orders for demo
const mockOrders: Order[] = [
  {
    id: '001',
    userId: '1',
    items: [
      {
        id: '1',
        slug: 'cinta-modeladora',
        name: 'Combo Emagrecedor Premium',
        description: 'Kit completo para emagrecimento',
        price: 199.90,
        image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400',
        category: 'Emagrecimento',
        stock: 10,
        quantity: 1,
        badge: 'bestseller',
      },
      {
        id: '2',
        slug: 'cha-natural',
        name: 'Modelador Corporal',
        description: 'Modelador de cintura',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        category: 'Modeladores',
        stock: 5,
        quantity: 1,
      },
    ],
    total: 349.90,
    status: 'delivered',
    shippingAddress: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
    billingAddress: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
    paymentMethod: 'Cartão de Crédito',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-05'),
  },
  {
    id: '002',
    userId: '1',
    items: [
      {
        id: '3',
        slug: 'capsulas',
        name: 'Suplemento Detox Natural',
        description: 'Detox 100% natural',
        price: 89.90,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
        category: 'Emagrecimento',
        stock: 15,
        quantity: 2,
        badge: 'new',
      },
    ],
    total: 179.80,
    status: 'shipped',
    shippingAddress: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
    billingAddress: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
    paymentMethod: 'PIX',
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-09-18'),
  },
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: mockOrders,

      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }));
      },

      getOrdersByUserId: (userId) => {
        return get().orders.filter((order) => order.userId === userId);
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
          ),
        }));
      },
    }),
    {
      name: 'order-storage',
    }
  )
);
