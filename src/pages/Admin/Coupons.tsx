import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiUpload, FiEye, FiEyeOff, FiTag, FiDownload, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: string; // vem como string do banco
  min_purchase_amount: string;
  max_discount_amount: string | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

interface CouponReport {
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  usage_count: number;
  usage_limit: number | null;
  is_active: number;
  total_orders: number;
  approved_orders: number;
  total_discount_given: string;
  total_revenue: string;
}

export const AdminCoupons = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'report'>('manage');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [report, setReport] = useState<CouponReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filtros de data para o relatório
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: '',
    valid_until: '',
  });

  // CSV state
  const [csvData, setCsvData] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    if (activeTab === 'report') {
      loadReport();
    }
  }, [activeTab]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/coupons`);
      setCoupons(response.data);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      alert('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      setLoadingReport(true);

      // Construir parâmetros de query
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = queryString
        ? `${API_URL}/admin/coupons/report?${queryString}`
        : `${API_URL}/admin/coupons/report`;

      const response = await axios.get(url);
      setReport(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      alert('Erro ao carregar relatório de cupons');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/coupons`, {
        code: formData.code,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_until: formData.valid_until || null,
        is_active: true
      });

      alert('Cupom criado com sucesso!');
      setShowModal(false);
      setFormData({ code: '', description: '', discount_type: 'percentage', discount_value: '', usage_limit: '', valid_until: '' });
      loadCoupons();
    } catch (error: any) {
      console.error('Erro ao criar cupom:', error);
      alert(error.response?.data?.error || 'Erro ao criar cupom');
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse CSV: espera formato "CODIGO,TIPO,VALOR"
      const lines = csvData.trim().split('\n');
      const parsedCoupons = lines.map(line => {
        const [code, type, value] = line.split(',').map(s => s.trim());
        return {
          code,
          discount_type: type || 'percentage',
          discount_value: parseFloat(value)
        };
      }).filter(c => c.code && !isNaN(c.discount_value));

      if (parsedCoupons.length === 0) {
        alert('Nenhum cupom válido encontrado no CSV');
        return;
      }

      const response = await axios.post(`${API_URL}/admin/coupons/import`, {
        coupons: parsedCoupons
      });

      alert(`Importação concluída!\n${response.data.success} cupons criados\n${response.data.duplicates?.length || 0} duplicados\n${response.data.errors?.length || 0} erros`);
      setShowImportModal(false);
      setCsvData('');
      loadCoupons();
    } catch (error: any) {
      console.error('Erro ao importar cupons:', error);
      alert(error.response?.data?.error || 'Erro ao importar cupons');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) return;

    try {
      await axios.delete(`${API_URL}/admin/coupons/${id}`);
      alert('Cupom deletado com sucesso!');
      loadCoupons();
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      alert('Erro ao deletar cupom');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/coupons/${id}/toggle`, {
        is_active: !isActive
      });
      loadCoupons();
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      alert('Erro ao atualizar cupom');
    }
  };

  const downloadCSVTemplate = () => {
    const template = 'CODIGO,TIPO,VALOR\nVERAO10,percentage,10\nBLACKFRIDAY50,fixed,50\nPRIMEIRA15,percentage,15';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-cupons.csv';
    a.click();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cupons de Desconto</h1>
              <p className="text-gray-600 mt-2">Gerencie cupons e acompanhe performance das influencers</p>
            </div>
            {activeTab === 'manage' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <FiUpload size={20} />
                  Importar CSV
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#4a9d4e' }}
                >
                  <FiPlus size={20} />
                  Novo Cupom
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                activeTab === 'manage'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiTag size={18} />
              Gerenciar Cupons
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                activeTab === 'report'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiBarChart2 size={18} />
              Relatório de Influencers
            </button>
          </div>
        </div>

        {/* Manage Cupons Tab */}
        {activeTab === 'manage' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando cupons...</p>
              </div>
            ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Desconto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usos</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Limite</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Válido até</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      <FiTag size={48} className="mx-auto text-gray-300 mb-4" />
                      Nenhum cupom cadastrado
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono font-bold text-gray-900">
                          {coupon.code}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {coupon.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-bold">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `R$ ${parseFloat(coupon.discount_value).toFixed(2)}`
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {coupon.usage_count}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {coupon.usage_limit || 'Ilimitado'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {coupon.valid_until
                          ? new Date(coupon.valid_until).toLocaleDateString('pt-BR')
                          : 'Sem expiração'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {coupon.is_active ? (
                            <>
                              <FiEye size={14} />
                              Ativo
                            </>
                          ) : (
                            <>
                              <FiEyeOff size={14} />
                              Inativo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
            )}
          </>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <>
            {loadingReport ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando relatório...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Filtros de Data */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Filtrar por Período</h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={loadReport}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Aplicar Filtro
                      </button>
                      <button
                        onClick={() => {
                          handleClearFilters();
                          // Recarregar o relatório sem filtros após limpar
                          setTimeout(loadReport, 100);
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  {(startDate || endDate) && (
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Filtro ativo:</strong>{' '}
                      {startDate && `De ${new Date(startDate).toLocaleDateString('pt-BR')}`}
                      {startDate && endDate && ' '}
                      {endDate && `até ${new Date(endDate).toLocaleDateString('pt-BR')}`}
                    </div>
                  )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">Cupons Ativos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {report.filter(r => r.is_active).length}
                        </p>
                      </div>
                      <FiTag size={32} className="text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">Vendas Aprovadas</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {report.reduce((sum, r) => sum + r.approved_orders, 0)}
                        </p>
                      </div>
                      <FiTrendingUp size={32} className="text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">Desconto Total</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          R$ {report.reduce((sum, r) => sum + parseFloat(r.total_discount_given || '0'), 0).toFixed(2)}
                        </p>
                      </div>
                      <FiTag size={32} className="text-orange-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-semibold">Receita Total</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          R$ {report.reduce((sum, r) => sum + parseFloat(r.total_revenue || '0'), 0).toFixed(2)}
                        </p>
                      </div>
                      <FiBarChart2 size={32} className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Report Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Performance por Influencer</h2>
                    <p className="text-sm text-gray-600 mt-1">Resultados de vendas por cupom de desconto</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Cupom</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Desconto</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Pedidos Totais</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">🎉 Vendas Aprovadas</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Desconto Concedido</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">💰 Receita Gerada</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-gray-500">
                              <FiBarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                              Nenhum dado disponível ainda
                            </td>
                          </tr>
                        ) : (
                          report.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <code className="bg-gray-100 px-2 py-1 rounded font-mono font-bold text-gray-900">
                                    {item.code}
                                  </code>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-green-600 font-bold">
                                  {item.discount_type === 'percentage'
                                    ? `${item.discount_value}%`
                                    : `R$ ${parseFloat(item.discount_value).toFixed(2)}`
                                  }
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-gray-700">
                                {item.total_orders}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                  {item.approved_orders}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-orange-600 font-semibold">
                                R$ {parseFloat(item.total_discount_given || '0').toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-green-600">
                                R$ {parseFloat(item.total_revenue || '0').toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.is_active ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Coupon Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Criar Novo Cupom</h2>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Código do Cupom *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: VERAO10"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Descrição (opcional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Desconto de verão"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tipo de Desconto *</label>
                  <select
                    required
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Valor do Desconto * {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.discount_type === 'percentage' ? "100" : undefined}
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? "Ex: 15" : "Ex: 50.00"}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Limite de Usos (opcional)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Deixe vazio para ilimitado"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Válido até (opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#4a9d4e' }}
                  >
                    Criar Cupom
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Importar Cupons via CSV</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Formato esperado:</strong> CODIGO,TIPO,VALOR (uma linha por cupom)
                </p>
                <p className="text-xs text-blue-700 mb-3">
                  Exemplo: VERAO10,percentage,10 (cupom VERAO10 com 10% de desconto)
                  <br />
                  Tipos aceitos: <strong>percentage</strong> (percentual) ou <strong>fixed</strong> (valor fixo)
                </p>
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <FiDownload size={16} />
                  Baixar Modelo CSV
                </button>
              </div>

              <form onSubmit={handleImportCSV} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cole os dados CSV abaixo:</label>
                  <textarea
                    required
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="VERAO10,percentage,10&#10;BLACKFRIDAY50,fixed,50&#10;PRIMEIRA15,percentage,15"
                    rows={10}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Importar Cupons
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
