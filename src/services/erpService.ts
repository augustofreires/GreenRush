import { api } from './api';
import type { ERPConfig, Product, Order } from '../types';

export const erpService = {
  // Configuração do ERP
  async getConfig(): Promise<ERPConfig> {
    const response = await api.get('/erp/config');
    return response.data;
  },

  async updateConfig(config: Partial<ERPConfig>): Promise<ERPConfig> {
    const response = await api.put('/erp/config', config);
    return response.data;
  },

  async testConnection(config: ERPConfig): Promise<boolean> {
    try {
      const response = await api.post('/erp/test-connection', config);
      return response.data.success;
    } catch (error) {
      console.error('ERP connection test failed:', error);
      return false;
    }
  },

  // Sincronização de Produtos
  async syncProducts(): Promise<Product[]> {
    const response = await api.post('/erp/sync/products');
    return response.data;
  },

  async getProducts(): Promise<Product[]> {
    const response = await api.get('/erp/products');
    return response.data;
  },

  async updateProductStock(productId: string, stock: number): Promise<void> {
    await api.put(`/erp/products/${productId}/stock`, { stock });
  },

  // Sincronização de Pedidos
  async syncOrder(orderId: string): Promise<Order> {
    const response = await api.post(`/erp/sync/orders/${orderId}`);
    return response.data;
  },

  async syncAllOrders(): Promise<Order[]> {
    const response = await api.post('/erp/sync/orders');
    return response.data;
  },

  async getOrderStatus(orderId: string): Promise<string> {
    const response = await api.get(`/erp/orders/${orderId}/status`);
    return response.data.status;
  },

  // Webhooks do ERP
  async registerWebhook(event: string, url: string): Promise<void> {
    await api.post('/erp/webhooks', { event, url });
  },

  async removeWebhook(webhookId: string): Promise<void> {
    await api.delete(`/erp/webhooks/${webhookId}`);
  },
};
