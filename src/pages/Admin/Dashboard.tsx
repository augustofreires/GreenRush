import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiDollarSign, FiUsers, FiTrendingUp, FiPackage, FiSettings, FiAlertCircle } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardService, type DashboardStats, type RecentOrder, type StockAlert, type SalesChartData } from '../../services/dashboardService';

export const AdminDashboard = () => {

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os dados em paralelo
      const [statsData, ordersData, stockData, chartData] = await Promise.all([
        dashboardService.getStats().catch(() => ({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, pendingOrders: 0 })),
        dashboardService.getRecentOrders().catch(() => []),
        dashboardService.getStockAlerts().catch(() => []),
        dashboardService.getSalesChart().catch(() => []),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData);
      setStockAlerts(stockData);
      setSalesChartData(chartData);
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Produtos', icon: FiPackage, to: '/admin/produtos', color: 'bg-blue-500' },
    { title: 'Pedidos', icon: FiShoppingBag, to: '/admin/pedidos', color: 'bg-green-500' },
    { title: 'Clientes', icon: FiUsers, to: '/admin/clientes', color: 'bg-purple-500' },
    { title: 'Integrações', icon: FiSettings, to: '/admin/integracoes', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Visão geral do seu e-commerce</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiUsers className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FiTrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Vendas */}
        {salesChartData.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Vendas nos Últimos 30 Dias</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: number, name: string) => {
                    if (name === 'receita') {
                      return [`R$ ${value.toFixed(2)}`, 'Receita'];
                    }
                    return [value, 'Vendas'];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                  name="Receita (R$)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="vendas"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                  name="Quantidade de Vendas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Gerenciar {item.title.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>

        {/* Alertas de Estoque Baixo */}
        {stockAlerts.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FiAlertCircle className="text-yellow-600 mr-2" size={24} />
              <h2 className="text-xl font-semibold text-yellow-800">Alertas de Estoque Baixo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockAlerts.map((product) => (
                <div key={product.id} className="bg-white rounded p-4 border border-yellow-300">
                  <h3 className="font-semibold text-gray-900">{product.nome}</h3>
                  <p className="text-sm text-gray-600">Código: {product.codigo}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-red-600 font-bold">Estoque: {product.estoque}</span>
                    <span className="text-gray-700">R$ {product.preco.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
            {!loading && recentOrders.length > 0 && (
              <button
                onClick={loadDashboardData}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Atualizar
              </button>
            )}
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <p>Carregando pedidos...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <FiAlertCircle size={48} className="mx-auto mb-4" />
                <p>{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Tentar novamente
                </button>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FiShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Nenhum pedido recente para exibir</p>
                <p className="text-sm mt-2">Configure suas integrações para ver os dados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origem
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={`${order.origem}-${order.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.situacao.includes('Atendido') || order.situacao.includes('approved') || order.situacao.includes('completed')
                              ? 'bg-green-100 text-green-800'
                              : order.situacao.includes('Cancelado') || order.situacao.includes('cancelled')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.situacao}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.origem === 'Bling' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {order.origem}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
