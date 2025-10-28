import { useState, useEffect } from 'react';
import { FiDownload, FiMail, FiPhone, FiCalendar, FiCheckCircle } from 'react-icons/fi';

interface Lead {
  id: string;
  phone: string;
  email: string;
  acceptMarketing: boolean;
  createdAt: string;
}

export const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_URL}/leads`);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('[AdminLeads] Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) {
      alert('Não há leads para exportar');
      return;
    }

    // CSV header
    const csvContent = [
      ['Data', 'Telefone', 'E-mail', 'Aceita Marketing'].join(','),
      ...leads.map(lead => [
        new Date(lead.createdAt).toLocaleString('pt-BR'),
        lead.phone,
        lead.email,
        lead.acceptMarketing ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `leads-newsletter-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando leads...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Newsletter</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os contatos capturados pelo popup de newsletter
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={leads.length === 0}
            className="flex items-center gap-2 bg-primary-green hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ backgroundColor: leads.length === 0 ? '#9ca3af' : '#84cc16' }}
          >
            <FiDownload size={20} />
            Exportar CSV ({leads.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{leads.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiMail className="text-primary-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceitam Marketing</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {leads.filter(l => l.acceptMarketing).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {leads.filter(l => {
                  const today = new Date().toDateString();
                  const leadDate = new Date(l.createdAt).toDateString();
                  return today === leadDate;
                }).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiCalendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Marketing
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum lead capturado ainda
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiCalendar className="text-gray-400" size={16} />
                        {new Date(lead.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiPhone className="text-gray-400" size={16} />
                        {lead.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FiMail className="text-gray-400" size={16} />
                        {lead.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {lead.acceptMarketing ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiCheckCircle size={14} />
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Não
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
