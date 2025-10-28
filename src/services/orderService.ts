import { api } from './api';
import type { Order, CartItem, Address } from '../types';

interface CreateOrderData {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
}

export const orderService = {
  // Criar pedido
  async create(data: CreateOrderData): Promise<Order> {
    console.log('📦 OrderService: Criando pedido...');

    // Criar pedido localmente (sempre usar o endpoint principal)
    try {
      console.log('📡 Enviando para /api/orders');
      const response = await api.post('/orders', data);
      console.log('✅ Resposta recebida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error);
      console.error('Detalhes:', error.response?.data);
      throw error;
    }
  },

  // Buscar pedidos
  async getAll(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async getByUser(userId: string): Promise<Order[]> {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  async getByCPF(cpf: string): Promise<Order[]> {
    const response = await api.get(`/orders/customer/${cpf}`);
    return response.data;
  },

  // Atualizar pedido
  async updateStatus(
    id: string,
    status: Order['status']
  ): Promise<Order> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async update(id: string, data: Partial<Order>): Promise<Order> {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  // Cancelar pedido
  async cancel(id: string): Promise<Order> {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Calcular frete
  async calculateShipping(zipCode: string, items: CartItem[]): Promise<{
    value: number;
    estimatedDays: number;
  }> {
    const response = await api.post('/orders/calculate-shipping', {
      zipCode,
      items,
    });
    return response.data;
  },
};
