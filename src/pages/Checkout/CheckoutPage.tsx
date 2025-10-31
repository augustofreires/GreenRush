import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiLock, FiPackage, FiTruck, FiCheck, FiTag, FiX, FiUser } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddressStore } from '../../store/useAddressStore';
import { orderService } from '../../services/orderService';
import axios from 'axios';
import type { Address } from '../../types';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { getAddressesByUserId } = useAddressStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'contact' | 'shipping' | 'payment'>('contact');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const pixSectionRef = useRef<HTMLDivElement>(null);

  const userAddresses = user ? getAddressesByUserId(user.id) : [];
  const [useExistingAddress, setUseExistingAddress] = useState(userAddresses.length > 0);
  const [selectedAddressId, setSelectedAddressId] = useState(
    userAddresses.find(a => a.isDefault)?.id || userAddresses[0]?.id || ''
  );

  // Estado separado para informações de contato
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [installments, setInstallments] = useState(1);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Cupom state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = getTotal();
  const shipping = 0; // Frete grátis sempre
  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.discount_percent / 100) : 0;
  const totalDiscount = pixDiscount + couponDiscount;
  const total = subtotal + shipping - totalDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await axios.get(`${API_URL}/coupons/validate/${couponCode.trim()}`);

      setAppliedCoupon({
        code: response.data.code,
        discount_percent: response.data.discount_percent
      });
      setCouponCode('');
    } catch (error: any) {
      setCouponError(error.response?.data?.error || 'Cupom inválido');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Scroll automático quando o PIX for gerado
  useEffect(() => {
    if (createdOrder && createdOrder.pixData && pixSectionRef.current) {
      pixSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [createdOrder]);

  // Validação da etapa de contato
  const validateContactStep = () => {
    if (!contactInfo.name.trim()) {
      alert('Por favor, preencha seu nome completo.');
      return false;
    }
    if (!contactInfo.email.trim()) {
      alert('Por favor, preencha seu e-mail.');
      return false;
    }
    if (!contactInfo.phone.trim() || contactInfo.phone.length < 10) {
      alert('Por favor, preencha um telefone válido.');
      return false;
    }
    if (!contactInfo.cpf.trim() || contactInfo.cpf.length !== 11) {
      alert('Por favor, preencha um CPF válido.');
      return false;
    }
    return true;
  };

  // Validação da etapa de endereço
  const validateShippingStep = () => {
    let finalAddress = shippingAddress;

    if (useExistingAddress && selectedAddressId) {
      const selectedAddr = userAddresses.find(a => a.id === selectedAddressId);
      if (selectedAddr) {
        return true; // Endereço salvo já está validado
      }
    }

    if (!finalAddress.zipCode || !finalAddress.street || !finalAddress.number ||
        !finalAddress.neighborhood || !finalAddress.city || !finalAddress.state) {
      alert('Por favor, preencha todos os campos obrigatórios do endereço.');
      return false;
    }
    return true;
  };

  // Navegação entre etapas
  const handleContinueToShipping = () => {
    if (validateContactStep()) {
      setCurrentStep('shipping');
    }
  };

  const handleContinueToPayment = () => {
    if (validateShippingStep()) {
      setCurrentStep('payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🛒 Iniciando checkout...');
    console.log('Items:', items);
    console.log('Contato:', contactInfo);
    console.log('Endereço:', shippingAddress);
    console.log('Método de pagamento:', paymentMethod);

    setLoading(true);

    try {
      let finalAddress = shippingAddress;

      if (useExistingAddress && selectedAddressId) {
        const selectedAddr = userAddresses.find(a => a.id === selectedAddressId);
        if (selectedAddr) {
          finalAddress = {
            street: selectedAddr.street,
            number: selectedAddr.number,
            complement: selectedAddr.complement,
            neighborhood: selectedAddr.neighborhood,
            city: selectedAddr.city,
            state: selectedAddr.state,
            zipCode: selectedAddr.zipCode,
            country: selectedAddr.country,
          };
        }
      }

      // Validar endereço
      if (!finalAddress.street || !finalAddress.number || !finalAddress.city || !finalAddress.state || !finalAddress.zipCode) {
        alert('Por favor, preencha todos os campos obrigatórios do endereço.');
        setLoading(false);
        return;
      }

      console.log('📦 Criando pedido...');

      // Aplicar cupom (incrementar contador)
      if (appliedCoupon) {
        try {
          await axios.post(`${API_URL}/coupons/apply`, { code: appliedCoupon.code });
        } catch (error) {
          console.error('Erro ao aplicar cupom:', error);
        }
      }

      const orderData = {
        items,
        shippingAddress: {
          ...finalAddress,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          cpf: contactInfo.cpf,
        },
        billingAddress: {
          ...finalAddress,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          cpf: contactInfo.cpf,
        },
        paymentMethod,
        userId: user?.id,
        installments,
        ...(paymentMethod === 'credit_card' && {
          cardData: {
            number: cardNumber.replace(/\s/g, ''),
            name: cardName,
            expiry: cardExpiry,
            cvv: cardCvv,
          }
        })
      };

      console.log('Dados do pedido:', orderData);

      const order = await orderService.create(orderData);

      console.log('✅ Pedido criado:', order);

      // Salvar o pedido criado no estado
      setCreatedOrder(order);

      // Se for PIX e tiver dados do PIX, não redirecionar ainda
      if (paymentMethod === 'pix' && order.pixData) {
        console.log('💰 Mostrando dados do PIX...');
        // Não limpar o carrinho ainda
      } else {
        // Para outros métodos de pagamento, redirecionar normalmente
        console.log('🚀 Redirecionando para confirmação...');
        navigate(`/pedido/${order.id}/confirmacao`, { replace: true });

        // Limpar carrinho após um pequeno delay
        setTimeout(() => {
          clearCart();
          console.log('🛒 Carrinho limpo');
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error);
      console.error('Response:', error.response?.data);
      alert(`Erro ao criar pedido: ${error.response?.data?.error || error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleZipCodeBlur = async () => {
    const zipCode = shippingAddress.zipCode.replace(/\D/g, '');
    if (zipCode.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setShippingAddress({
            ...shippingAddress,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    }
  };

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  const paymentOptions = [
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Em até 12x sem juros',
      icon: FiCreditCard,
      badge: null,
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Aprovação imediata',
      icon: FiCheck,
      badge: '5% OFF',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiLock size={16} />
            <span>Compra 100% segura e protegida</span>
          </div>
        </div>

        {/* Progress Steps - 3 etapas */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-3xl mx-auto">
            {/* Step 1: Contato */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'contact' ? 'bg-[#4a9d4e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`font-medium ${currentStep === 'contact' ? 'text-gray-900' : 'text-gray-400'}`}>
                Contato
              </span>
            </div>

            {/* Linha */}
            <div className="flex-1 h-0.5 bg-gray-200" />

            {/* Step 2: Frete */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'shipping' ? 'bg-[#4a9d4e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`font-medium ${currentStep === 'shipping' ? 'text-gray-900' : 'text-gray-400'}`}>
                Frete
              </span>
            </div>

            {/* Linha */}
            <div className="flex-1 h-0.5 bg-gray-200" />

            {/* Step 3: Pagamento */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'payment' ? 'bg-[#4a9d4e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`font-medium ${currentStep === 'payment' ? 'text-gray-900' : 'text-gray-400'}`}>
                Pagamento
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ETAPA 1 - CONTATO */}
              {currentStep === 'contact' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="p-6 border-b flex items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)'
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: '#4a9d4e' }}
                    >
                      <FiUser size={24} style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Informações de Contato</h2>
                      <p className="text-sm text-gray-600">Como podemos entrar em contato com você?</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Nome Completo */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactInfo.name}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              name: e.target.value,
                            })
                          }
                          placeholder="Seu nome completo"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactInfo.email}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              email: e.target.value,
                            })
                          }
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactInfo.phone}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              phone: e.target.value.replace(/\D/g, '').slice(0, 11),
                            })
                          }
                          placeholder="(00) 00000-0000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                        />
                      </div>

                      {/* CPF */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CPF *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactInfo.cpf}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              cpf: e.target.value.replace(/\D/g, '').slice(0, 11),
                            })
                          }
                          placeholder="000.000.000-00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Botão Continuar */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleContinueToShipping}
                        className="w-full py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        Continuar para Endereço
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 2 - FRETE/ENDEREÇO */}
              {currentStep === 'shipping' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="p-6 border-b flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: '#4a9d4e' }}
                      >
                        <FiTruck size={24} style={{ color: '#ffffff' }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Endereço de Entrega</h2>
                        <p className="text-sm text-gray-600">Para onde devemos enviar seu pedido?</p>
                      </div>
                    </div>
                    <span
                      className="px-4 py-2 text-sm font-bold rounded-full shadow-sm"
                      style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                    >
                      FRETE GRÁTIS
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Use Saved Address */}
                    {userAddresses.length > 0 && (
                      <div className="mb-6">
                        <label className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={useExistingAddress}
                            onChange={(e) => setUseExistingAddress(e.target.checked)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: '#4a9d4e' }}
                          />
                          <span className="font-medium text-gray-700">Usar um endereço salvo</span>
                        </label>

                        {useExistingAddress && (
                          <div className="space-y-3">
                            {userAddresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                  selectedAddressId === addr.id
                                    ? 'border-2'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={selectedAddressId === addr.id ? { borderColor: '#4a9d4e', backgroundColor: '#f8fdf9' } : {}}
                              >
                                <input
                                  type="radio"
                                  name="saved-address"
                                  value={addr.id}
                                  checked={selectedAddressId === addr.id}
                                  onChange={(e) => setSelectedAddressId(e.target.value)}
                                  className="mt-1"
                                  style={{ accentColor: '#4a9d4e' }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{addr.label}</span>
                                    {addr.isDefault && (
                                      <span
                                        className="px-2 py-0.5 text-xs font-semibold rounded"
                                        style={{ backgroundColor: '#e8f5e8', color: '#4a9d4e' }}
                                      >
                                        Padrão
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {addr.street}, {addr.number}
                                    {addr.complement && ` - ${addr.complement}`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {addr.neighborhood}, {addr.city}/{addr.state} - CEP: {addr.zipCode}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* New Address Form */}
                    {(!useExistingAddress || userAddresses.length === 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CEP *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.zipCode}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                zipCode: e.target.value,
                              })
                            }
                            onBlur={handleZipCodeBlur}
                            placeholder="00000-000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rua *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.street}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                street: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Número *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.number}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                number: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.complement}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                complement: e.target.value,
                              })
                            }
                            placeholder="Apto, Bloco, etc"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bairro *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.neighborhood}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                neighborhood: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cidade *
                          </label>
                          <input
                            type="text"
                            required
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Estado *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={2}
                            value={shippingAddress.state}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                state: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="SP"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent uppercase transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Botões Voltar e Continuar */}
                    <div className="mt-6 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('contact')}
                        className="flex-1 py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueToPayment}
                        className="flex-1 py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        Continuar para Pagamento
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 3 - PAGAMENTO */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="p-6 border-b flex items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)'
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: '#4a9d4e' }}
                    >
                      <FiCreditCard size={24} style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Forma de Pagamento</h2>
                      <p className="text-sm text-gray-600">Escolha como deseja pagar</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === option.id
                              ? 'border-2'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={paymentMethod === option.id ? { borderColor: '#4a9d4e', backgroundColor: '#f8fdf9' } : {}}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={option.id}
                            checked={paymentMethod === option.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5"
                            style={{ accentColor: '#4a9d4e' }}
                          />
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#e8f5e8' }}
                          >
                            <Icon size={24} style={{ color: '#4a9d4e' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{option.name}</p>
                              {option.badge && (
                                <span
                                  className="px-2 py-0.5 text-xs font-bold rounded"
                                  style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                                >
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </label>
                      );
                    })}

                    {/* Installments for Credit Card */}
                    {paymentMethod === 'credit_card' && (
                      <div className="pt-4 border-t">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Número de Parcelas
                        </label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                        >
                          {[...Array(12)].map((_, i) => {
                            const parcelas = i + 1;
                            const valorParcela = total / parcelas;
                            return (
                              <option key={parcelas} value={parcelas}>
                                {parcelas}x de R$ {valorParcela.toFixed(2).replace('.', ',')}
                                {parcelas === 1 ? ' à vista' : ' sem juros'}
                              </option>
                            );
                          })}
                        </select>

                        {/* Credit Card Fields */}
                        <div className="mt-6 space-y-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Cartão</h3>

                          {/* Número do Cartão */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Número do Cartão *
                            </label>
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                setCardNumber(value.replace(/(\d{4})(?=\d)/g, '$1 '));
                              }}
                              placeholder="0000 0000 0000 0000"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                            />
                          </div>

                          {/* Nome no Cartão */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nome no Cartão *
                            </label>
                            <input
                              type="text"
                              required
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              placeholder="NOME COMO ESTÁ NO CARTÃO"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent uppercase transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Validade */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Validade *
                              </label>
                              <input
                                type="text"
                                required
                                value={cardExpiry}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                  }
                                  setCardExpiry(value);
                                }}
                                placeholder="MM/AA"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                              />
                            </div>

                            {/* CVV */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                CVV *
                              </label>
                              <input
                                type="text"
                                required
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões Voltar e Finalizar */}
                  <div className="p-6 pt-0">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('shipping')}
                        className="flex-1 py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 text-lg font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                      >
                        {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar código PIX' : 'Finalizar Pedido'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* PIX Payment Display - Aparece após gerar o código */}
            {createdOrder && createdOrder.pixData && (
              <div ref={pixSectionRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div
                  className="p-6 border-b flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: '#4a9d4e' }}
                  >
                    <FiCheck size={24} style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">PIX Gerado com Sucesso!</h2>
                    <p className="text-sm text-gray-600">Escaneie o QR Code ou copie o código abaixo</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* QR Code */}
                  {createdOrder.pixData.pix_qrcode && (
                    <div className="flex justify-center">
                      <img
                        src={`data:image/png;base64,${createdOrder.pixData.pix_qrcode}`}
                        alt="QR Code PIX"
                        className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Valor */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Valor a pagar:</p>
                    <p className="text-3xl font-bold" style={{ color: '#4a9d4e' }}>
                      R$ {createdOrder.total.toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  {/* Código PIX */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código PIX (Copia e Cola)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdOrder.pixData.pix_emv || ''}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdOrder.pixData.pix_emv);
                          alert('Código PIX copiado!');
                        }}
                        className="px-6 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#4a9d4e' }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Botão Já Paguei */}
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      navigate(`/pedido/${createdOrder.id}/confirmacao`, { replace: true });
                    }}
                    className="w-full py-4 text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                    style={{ backgroundColor: '#4a9d4e', color: '#ffffff' }}
                  >
                    Já paguei
                  </button>

                  {/* Informação adicional */}
                  <div className="text-center text-sm text-gray-600">
                    <p>Após o pagamento, a confirmação pode levar alguns minutos.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
              <div
                className="p-6 border-b"
                style={{
                  background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)'
                }}
              >
                <h2 className="font-bold text-xl text-gray-900">Resumo do Pedido</h2>
              </div>

              <div className="p-6">
                {/* Items */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: '#4a9d4e' }}
                        >
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold mt-1" style={{ color: '#4a9d4e' }}>
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-b py-4 mb-6">
                  {!appliedCoupon ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cupom de Desconto
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Digite o código"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent uppercase transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#4a9d4e' }}
                        >
                          {couponLoading ? 'Validando...' : 'Aplicar'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 mt-1">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#e8f5e8' }}>
                      <div className="flex items-center gap-2">
                        <FiTag size={18} style={{ color: '#4a9d4e' }} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs" style={{ color: '#4a9d4e' }}>
                            {appliedCoupon.discount_percent}% de desconto aplicado
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Remover cupom"
                      >
                        <FiX size={18} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Shipping Info - Sempre mostra frete grátis */}
                <div
                  className="flex items-center gap-2 p-3 rounded-lg mb-6"
                  style={{ backgroundColor: '#e8f5e8' }}
                >
                  <FiTruck size={20} style={{ color: '#4a9d4e' }} />
                  <span className="text-sm font-semibold" style={{ color: '#4a9d4e' }}>
                    Você ganhou frete grátis!
                  </span>
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Frete</span>
                    <span className="font-semibold" style={{ color: '#4a9d4e' }}>
                      GRÁTIS
                    </span>
                  </div>
                  {pixDiscount > 0 && (
                    <div className="flex justify-between" style={{ color: '#4a9d4e' }}>
                      <span className="font-semibold">Desconto PIX (5%)</span>
                      <span className="font-semibold">
                        - R$ {pixDiscount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between" style={{ color: '#4a9d4e' }}>
                      <span className="font-semibold">Cupom ({appliedCoupon?.discount_percent}%)</span>
                      <span className="font-semibold">
                        - R$ {couponDiscount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  <div
                    className="border-t pt-3 flex justify-between items-center text-xl"
                    style={{ borderColor: '#e8f5e8' }}
                  >
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold" style={{ color: '#4a9d4e' }}>
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                    <FiLock size={16} />
                    <span>Pagamento 100% Seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
