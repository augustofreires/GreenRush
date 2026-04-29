import { create } from 'zustand';
import type { Order } from '../types';
import { orderService } from '../services/orderService';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrdersByUserId: (userId: string) => Order[];
  fetchOrdersByEmail: (email: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],

  addOrder: (order) => {
    set((state) => ({
      orders: [...state.orders, order],
    }));
  },

  getOrdersByUserId: (userId) => {
    return get().orders.filter((order) => order.userId === userId);
  },

  fetchOrdersByEmail: async (email) => {
    try {
      console.log('🔍 Store: Buscando pedidos por email:', email);
      const orders = await orderService.getByEmail(email);
      console.log('📦 Store: Pedidos recebidos:', orders.length);
      
      // Substituir pedidos completamente (não acumular)
      set({ orders });
    } catch (error) {
      console.error('❌ Store: Erro ao buscar pedidos:', error);
      set({ orders: [] });
    }
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      ),
    }));
  },
}));
