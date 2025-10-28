import { useState, useEffect } from 'react';
import { FiShoppingBag, FiEye, FiRefreshCw } from 'react-icons/fi';
import { dashboardService } from '../../services/dashboardService';

interface Order {
  id: string;
  numero: string;
  cliente: string;
  data: string;
  total: number;
  situacao: string;
  itens: number;
  origem: string;
}

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getRecentOrders();
      setOrders(data);

      // Calcular estatísticas
      const statsCalc = {
        total: data.length,
        pending: data.filter(o => o.situacao?.toLowerCase().includes('pendente')).length,
        processing: data.filter(o => o.situacao?.toLowerCase().includes('processando') || o.situacao?.toLowerCase().includes('aberto')).length,
        shipped: data.filter(o => o.situacao?.toLowerCase().includes('enviado')).length,
        delivered: data.filter(o => o.situacao?.toLowerCase().includes('entregue') || o.situacao?.toLowerCase().includes('aprovado')).length,
      };
      setStats(statsCalc);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pendente') || statusLower.includes('aguardando')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('processando') || statusLower.includes('aberto')) return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('enviado')) return 'bg-purple-100 text-purple-800';
    if (statusLower.includes('entregue') || statusLower.includes('aprovado')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('cancelado')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-2">Gerenciar todos os pedidos da Appmax</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Processando</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Enviados</p>
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Entregues</p>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Pedidos</h2>
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue">
                  <option>Todos os status</option>
                  <option>Pendente</option>
                  <option>Processando</option>
                  <option>Enviado</option>
                  <option>Entregue</option>
                  <option>Cancelado</option>
                </select>
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                      <p className="text-gray-500">Carregando pedidos...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <FiShoppingBag className="mx-auto mb-2 text-gray-300" size={48} />
                      <p className="text-gray-500">Nenhum pedido encontrado</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary-blue bg-opacity-10 rounded flex items-center justify-center">
                            <FiShoppingBag className="text-primary-blue" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.numero}
                            </div>
                            <div className="text-xs text-gray-500">{order.origem}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.cliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.data)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.situacao)}`}>
                          {order.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-blue hover:text-primary-pink inline-flex items-center gap-1">
                          <FiEye size={18} />
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{orders.length}</span> pedidos{' '}
              {orders.length > 0 && (
                <>da <span className="font-medium">Appmax</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
