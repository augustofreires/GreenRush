import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiLogOut, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiCheck, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useAddressStore, type AddressWithMeta } from '../../store/useAddressStore';
import { ReviewForm } from '../../components/Review/ReviewForm';

type TabType = 'profile' | 'orders' | 'addresses';

export const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuthStore();
  const { getOrdersByUserId, fetchOrdersByEmail } = useOrderStore();
  const { getAddressesByUserId, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Review form state
  const [reviewingProduct, setReviewingProduct] = useState<{ productId: string; productName: string } | null>(null);

  // Carregar pedidos da API quando o componente montar
  useEffect(() => {
    if (user?.email) {
      console.log('📧 AccountPage: Carregando pedidos para', user.email);
      fetchOrdersByEmail(user.email);
    }
  }, [user?.email, fetchOrdersByEmail]);

  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<AddressWithMeta, 'id' | 'userId'>>({
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    isDefault: false,
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const orders = getOrdersByUserId(user.email);
  const addresses = getAddressesByUserId(user.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAddress = () => {
    if (!addressForm.label || !addressForm.street || !addressForm.number || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
      setEditingAddressId(null);
    } else {
      addAddress(user.id, addressForm);
    }

    setIsAddingAddress(false);
    setAddressForm({
      label: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
      isDefault: false,
    });
  };

  const handleEditAddress = (address: AddressWithMeta) => {
    setAddressForm(address);
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm({
      label: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
      isDefault: false,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações e pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: '#4a9d4e' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'profile' ? { backgroundColor: '#e8f5e8', color: '#4a9d4e' } : {}}
                >
                  <FiUser size={18} />
                  <span>Informações Pessoais</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'orders' ? { backgroundColor: '#e8f5e8', color: '#4a9d4e' } : {}}
                >
                  <FiPackage size={18} />
                  <span>Meus Pedidos</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'addresses'
                      ? 'font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'addresses' ? { backgroundColor: '#e8f5e8', color: '#4a9d4e' } : {}}
                >
                  <FiMapPin size={18} />
                  <span>Endereços</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6 pt-6 border-t"
                >
                  <FiLogOut size={18} />
                  <span>Sair</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        <FiEdit2 size={16} />
                        Editar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                          style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                        >
                          <FiSave size={16} />
                          Salvar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                        >
                          <FiX size={16} />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="(00) 00000-0000"
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                            isEditing ? 'bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Welcome Discount Banner */}
                <div className="p-6 rounded-xl text-center shadow-lg" style={{ background: 'linear-gradient(to right, #4a9d4e, #2c5f2d)', color: '#ffffff' }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>🎉 Cupom Especial!</h3>
                  <p className="text-sm mb-3" style={{ color: '#ffffff' }}>
                    Use o cupom abaixo e ganhe 10% OFF na sua próxima compra
                  </p>
                  <div className="font-bold text-lg py-3 px-6 rounded-lg inline-block shadow-md" style={{ backgroundColor: '#ffffff', color: '#4a9d4e' }}>
                    BEMVINDO10
                  </div>
                </div>
              </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Meus Pedidos</h2>

                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">Pedido #{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Items */}
                        <div className="space-y-3 mb-4 pb-4 border-b">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 mb-2">
                                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                </p>
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={() => setReviewingProduct({ productId: item.id, productName: item.name })}
                                    className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
                                    style={{ color: '#4a9d4e' }}
                                  >
                                    <FiStar size={14} />
                                    Avaliar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pagamento:</span>
                            <span className="text-gray-900 font-medium">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Endereço:</span>
                            <span className="text-gray-900 font-medium">
                              {order.shippingAddress.street}, {order.shippingAddress.number}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-bold text-gray-900">Total:</span>
                            <span className="font-bold text-xl" style={{ color: '#4a9d4e' }}>
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                    >
                      Começar a Comprar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Meus Endereços</h2>
                  {!isAddingAddress && (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                    >
                      <FiPlus size={16} />
                      Adicionar
                    </button>
                  )}
                </div>

                {/* Add/Edit Address Form */}
                {isAddingAddress && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Identificação *
                        </label>
                        <input
                          type="text"
                          name="label"
                          value={addressForm.label}
                          onChange={handleAddressChange}
                          placeholder="Ex: Casa, Trabalho"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={addressForm.zipCode}
                          onChange={handleAddressChange}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rua *
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={addressForm.street}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          name="number"
                          value={addressForm.number}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          name="complement"
                          value={addressForm.complement}
                          onChange={handleAddressChange}
                          placeholder="Apto, Sala, etc"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          name="neighborhood"
                          value={addressForm.neighborhood}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="SP"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        {editingAddressId ? 'Salvar' : 'Adicionar'}
                      </button>
                      <button
                        onClick={handleCancelAddress}
                        className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Address List */}
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 ${
                          address.isDefault ? 'border-2' : 'border-gray-200'
                        }`}
                        style={address.isDefault ? { borderColor: '#4a9d4e' } : {}}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{address.label}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: '#e8f5e8', color: '#4a9d4e' }}>
                                Padrão
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.neighborhood} - {address.city}/{address.state}
                        </p>
                        <p className="text-sm text-gray-600">CEP: {address.zipCode}</p>
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(user.id, address.id)}
                            className="mt-3 text-sm font-semibold hover:opacity-80 transition-opacity"
                            style={{ color: '#4a9d4e' }}
                          >
                            <FiCheck size={14} className="inline mr-1" />
                            Definir como padrão
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  !isAddingAddress && (
                    <div className="text-center py-12">
                      <FiMapPin size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">Nenhum endereço cadastrado</p>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        Adicionar Endereço
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Avaliar: {reviewingProduct.productName}</h2>
              <button
                onClick={() => setReviewingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <ReviewForm
                productId={reviewingProduct.productId}
                userId={user.id}
                userName={user.name}
                userEmail={user.email}
                onSuccess={() => setReviewingProduct(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
