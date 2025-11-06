import axios from 'axios';
import type { AppMaxConfig, Order } from '../types';

const APPMAX_API_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/appmax';

const appmaxApi = axios.create({
  baseURL: APPMAX_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const appmaxService = {
  // Configuração do AppMax
  async getConfig(): Promise<AppMaxConfig> {
    const response = await appmaxApi.get('/config');
    return response.data;
  },

  async updateConfig(config: Partial<AppMaxConfig>): Promise<AppMaxConfig> {
    const response = await appmaxApi.put('/config', config);
    return response.data;
  },

  async testConnection(config: AppMaxConfig): Promise<boolean> {
    try {
      const response = await appmaxApi.post('/test-connection', config);
      return response.data.success;
    } catch (error) {
      console.error('AppMax connection test failed:', error);
      return false;
    }
  },

  // Tracking de Conversão
  async trackConversion(order: Order): Promise<void> {
    await appmaxApi.post('/track/conversion', {
      orderId: order.id,
      total: order.total,
      items: order.items,
    });
  },

  async trackPageView(page: string): Promise<void> {
    await appmaxApi.post('/track/pageview', { page });
  },

  async trackEvent(event: string, data?: Record<string, any>): Promise<void> {
    await appmaxApi.post('/track/event', { event, data });
  },

  // Afiliados
  async getAffiliateLink(productId: string): Promise<string> {
    const response = await appmaxApi.get(`/affiliate/link/${productId}`);
    return response.data.link;
  },

  async getAffiliateStats(): Promise<any> {
    const response = await appmaxApi.get('/affiliate/stats');
    return response.data;
  },

  // Comissões
  async getCommissions(startDate?: Date, endDate?: Date): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const response = await appmaxApi.get(`/commissions?${params.toString()}`);
    return response.data;
  },

  // Webhooks do AppMax
  async handleWebhook(payload: any): Promise<void> {
    await appmaxApi.post('/webhook', payload);
  },

  // Criar pedido no Appmax
  async createOrder(orderData: any): Promise<any> {
    const response = await appmaxApi.post('/orders', orderData);
    return response.data;
  },

  // Tracking de Carrinho Abandonado
  async trackAbandonedCart(customerData: any, items: any[]): Promise<void> {
    try {
      await appmaxApi.post('/abandoned-cart', {
        customerData,
        cartItems: items
      });
    } catch (error) {
      console.error('Erro ao enviar carrinho abandonado:', error);
      // Não lançar erro para não atrapalhar o checkout
    }
  },
};
