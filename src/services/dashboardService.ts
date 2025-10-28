import axios from 'axios';

const DASHBOARD_API_URL = (import.meta.env.VITE_API_BASE_URL || '/api') + '/dashboard';

const dashboardApi = axios.create({
  baseURL: DASHBOARD_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
}

export interface RecentOrder {
  id: number;
  numero: string;
  data: string;
  cliente: string;
  total: number;
  situacao: string;
  itens: number;
  origem: string;
}

export interface StockAlert {
  id: number;
  nome: string;
  codigo: string;
  estoque: number;
  preco: number;
}

export interface SalesChartData {
  data: string;
  vendas: number;
  receita: number;
}

export const dashboardService = {
  /**
   * Busca estatísticas gerais do dashboard (vendas, receitas, clientes, pedidos)
   */
  async getStats(): Promise<DashboardStats> {
    const response = await dashboardApi.get('/stats');
    return response.data;
  },

  /**
   * Busca os pedidos mais recentes
   */
  async getRecentOrders(): Promise<RecentOrder[]> {
    const response = await dashboardApi.get('/recent-orders');
    return response.data;
  },

  /**
   * Busca alertas de produtos com estoque baixo
   */
  async getStockAlerts(): Promise<StockAlert[]> {
    const response = await dashboardApi.get('/stock-alerts');
    return response.data;
  },

  /**
   * Busca dados para o gráfico de vendas dos últimos 30 dias
   */
  async getSalesChart(): Promise<SalesChartData[]> {
    const response = await dashboardApi.get('/sales-chart');
    return response.data;
  },

  /**
   * Busca lista de clientes da Appmax
   */
  async getCustomers(): Promise<any[]> {
    const response = await dashboardApi.get('/customers');
    return response.data;
  },
};
