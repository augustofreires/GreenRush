import { useState } from 'react';
import { FiPackage, FiUser, FiSearch, FiArrowRight, FiCheckCircle, FiTruck, FiBox, FiClock } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

type SearchType = 'order' | 'cpf';

export function OrderTracking() {
  const [searchType, setSearchType] = useState<SearchType>('order');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      setError('Por favor, preencha o campo de busca');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      if (searchType === 'order') {
        const orderData = await orderService.getById(searchValue);
        setOrder(orderData);
      } else {
        // Busca por CPF
        const orders = await orderService.getByCPF(searchValue);
        if (orders && orders.length > 0) {
          // Pega o pedido mais recente
          setOrder(orders[0]);
        } else {
          setError('Nenhum pedido encontrado para este CPF');
        }
      }
    } catch (err) {
      setError('Pedido não encontrado. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Pedido Recebido', icon: FiClock, color: 'text-yellow-600' };
      case 'processing':
        return { label: 'Em Separação', icon: FiBox, color: 'text-blue-600' };
      case 'shipped':
        return { label: 'Em Transporte', icon: FiTruck, color: 'text-purple-600' };
      case 'delivered':
        return { label: 'Entregue', icon: FiCheckCircle, color: 'text-green-600' };
      case 'cancelled':
        return { label: 'Cancelado', icon: FiCheckCircle, color: 'text-red-600' };
      default:
        return { label: 'Processando', icon: FiClock, color: 'text-gray-600' };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              GreenRush
            </h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
            Consulta de Pedido
          </h2>
          <p className="text-gray-600 text-lg">
            Acompanhe seu pedido de forma simples e rápida
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setSearchType('order');
                setSearchValue('');
                setError('');
                setOrder(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                searchType === 'order'
                  ? 'bg-green-50 text-green-600 border-2 border-green-600'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <FiPackage className="text-xl" />
              ID do Pedido
            </button>
            <button
              onClick={() => {
                setSearchType('cpf');
                setSearchValue('');
                setError('');
                setOrder(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                searchType === 'cpf'
                  ? 'bg-green-50 text-green-600 border-2 border-green-600'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <FiUser className="text-xl" />
              CPF
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                {searchType === 'order' ? (
                  <>
                    <FiPackage className="text-green-600" />
                    ID do Pedido
                  </>
                ) : (
                  <>
                    <FiUser className="text-green-600" />
                    CPF
                  </>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === 'order'
                      ? 'Ex: PED123456789'
                      : 'Ex: 000.000.000-00'
                  }
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                />
                <FiPackage className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              </div>
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <FiCheckCircle className="text-sm" />
                Digite o {searchType === 'order' ? 'ID completo do pedido' : 'CPF do titular'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSearch className="text-xl" />
              {loading ? 'Consultando...' : 'Consultar Pedido'}
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </div>

        {/* Order Result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Pedido #{order.id}
              </h3>
              <p className="text-gray-600">
                Realizado em {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Status */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {(() => {
                  const statusInfo = getStatusInfo(order.status);
                  const Icon = statusInfo.icon;
                  return (
                    <>
                      <Icon className={`text-3xl ${statusInfo.color}`} />
                      <span className={`text-xl font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200"></div>
                <div className="relative flex justify-between">
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const statusInfo = getStatusInfo(status as Order['status']);
                    const Icon = statusInfo.icon;
                    const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;

                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon className="text-lg" />
                        </div>
                        <span className="text-xs text-gray-600 mt-2 text-center max-w-[80px]">
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Endereço de Entrega</h4>
              <p className="text-gray-600">
                {order.shippingAddress.street}, {order.shippingAddress.number}
                {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state}
              </p>
              <p className="text-gray-600">
                CEP: {order.shippingAddress.zipCode}
              </p>
            </div>

            {/* Items */}
            <div className="border-t mt-6 pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Itens do Pedido</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{item.name}</h5>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
