import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import { dashboardService } from '../../services/dashboardService';

interface Customer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  numeroContato: string;
  origem: string;
}

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-2">Gerenciar base de clientes da Appmax</p>
          </div>
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Da Appmax</p>
            <p className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.origem === 'Appmax').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Com E-mail</p>
            <p className="text-2xl font-bold text-purple-600">
              {customers.filter(c => c.email && c.email !== 'Não informado').length}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lista de Clientes</h2>
              <input
                type="text"
                placeholder="Buscar clientes..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gasto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                      <p className="text-gray-500">Carregando clientes...</p>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FiUser className="mx-auto mb-2 text-gray-300" size={48} />
                      <p className="text-gray-500">Nenhum cliente encontrado</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary-pink bg-opacity-10 rounded-full flex items-center justify-center">
                            <FiUser className="text-primary-pink" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.nome}
                            </div>
                            <div className="text-xs text-gray-500">{customer.origem}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <FiMail size={14} className="text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiPhone size={14} className="text-gray-400" />
                            {customer.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">-</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">-</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-blue hover:text-primary-pink">
                          Ver Perfil
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
              Mostrando <span className="font-medium">{customers.length}</span> clientes{' '}
              {customers.length > 0 && (
                <>da <span className="font-medium">Appmax</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
