import { useState, useRef, useEffect } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiCheck, FiTag, FiX, FiChevronRight } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddressStore } from '../../store/useAddressStore';
import { orderService } from '../../services/orderService';
import { appmaxService } from '../../services/appmaxService';
import axios from 'axios';
import type { Address } from '../../types';
import { trackInitiateCheckout, trackAddPaymentInfo, trackPurchase } from '../../utils/tracking';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const CheckoutPage = () => {
  usePageTitle('Finalizar Pedido');
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
  const [installments, setInstallments] = useState(0);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Cupom - usar store global
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);
  const clearCoupon = useCartStore((state) => state.clearCoupon);

  // Cupom local states (apenas para UI)
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [abandonedCartSent, setAbandonedCartSent] = useState(false);

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
    clearCoupon();
    setCouponError('');
  };

  // Scroll automático quando o PIX for gerado
  useEffect(() => {
    if (createdOrder && createdOrder.pixData && pixSectionRef.current) {
      pixSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [createdOrder]);

  // Disparar evento InitiateCheckout quando página carrega
  useEffect(() => {
    if (items.length > 0) {
      const total = getTotal();
      const trackingItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }));
      trackInitiateCheckout(trackingItems, total);
    }
  }, []); // Apenas uma vez quando monta

  // Disparar evento AddPaymentInfo quando método de pagamento mudar
  useEffect(() => {
    if (paymentMethod && currentStep === 'payment') {
      const total = getTotal();
      trackAddPaymentInfo(paymentMethod, total);
    }
  }, [paymentMethod, currentStep]);

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
  const handleContinueToShipping = async () => {
    if (validateContactStep()) {
      // Enviar carrinho abandonado para Appmax antes de avançar
      if (!abandonedCartSent && items.length > 0) {
        try {
          console.log('📧 Enviando carrinho abandonado para Appmax...');
          await appmaxService.trackAbandonedCart(
            {
              name: contactInfo.name || 'Cliente',
              email: contactInfo.email,
              phone: contactInfo.phone
            },
            items
          );
          setAbandonedCartSent(true);
          console.log('✅ Carrinho abandonado enviado com sucesso');
        } catch (error) {
          console.error('❌ Erro ao enviar carrinho abandonado:', error);
          // Não bloquear o checkout se houver erro
        }
      }
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

    // Validar CPF antes de processar
    if (!contactInfo.cpf.trim() || !(contactInfo.cpf.length === 11 || contactInfo.cpf.length === 14)) {
      alert('Por favor, preencha um CPF ou CNPJ válido.');
      return;
    }

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
        appliedCoupon: appliedCoupon,
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

      // 🎉 DISPARAR EVENTO DE CONVERSÃO (Purchase)
      const trackingItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }));
      trackPurchase(
        order.id || order.localId,
        trackingItems,
        order.total,
        appliedCoupon?.code
      );

      // Salvar o pedido criado no estado
      setCreatedOrder(order);

      // Se for PIX e tiver dados do PIX, não redirecionar ainda
      if (paymentMethod === 'pix' && (order as any).pixData) {
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

  // Obter endereço final para exibição
  const getFinalAddress = () => {
    if (useExistingAddress && selectedAddressId) {
      return userAddresses.find(a => a.id === selectedAddressId);
    }
    return shippingAddress;
  };

  const finalAddress = getFinalAddress();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <button onClick={() => navigate('/')} className="hover:text-[#4a9d4e] transition-colors">
              Início
            </button>
            <FiChevronRight size={14} />
            <button onClick={() => navigate('/carrinho')} className="hover:text-[#4a9d4e] transition-colors">
              Carrinho
            </button>
            <FiChevronRight size={14} />
            <span className="text-gray-900 font-medium">Pagamento</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contato Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">Contato</span>
                  </div>
                  {currentStep !== 'contact' && contactInfo.email && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep('contact')}
                      className="text-[#4a9d4e] hover:text-[#3d8440] font-medium text-sm transition-colors"
                    >
                      Alterar
                    </button>
                  )}
                </div>

                {currentStep === 'contact' ? (
                  <div className="p-6 space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        placeholder="Nome completo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="E-mail"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                        placeholder="Telefone"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleContinueToShipping}
                      className="w-full mt-4 py-3 bg-[#4a9d4e] text-white font-semibold rounded-lg hover:bg-[#3d8440] transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                ) : (
                  <div className="p-5 text-gray-700">
                    <p>{contactInfo.email}</p>
                  </div>
                )}
              </div>

              {/* Endereço Section */}
              {currentStep !== 'contact' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">Enviar para</span>
                    </div>
                    {currentStep === 'payment' && finalAddress && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep('shipping')}
                        className="text-[#4a9d4e] hover:text-[#3d8440] font-medium text-sm transition-colors"
                      >
                        Alterar
                      </button>
                    )}
                  </div>

                  {currentStep === 'shipping' ? (
                    <div className="p-6">
                      {/* Saved addresses */}
                      {userAddresses.length > 0 && (
                        <div className="mb-6">
                          <label className="flex items-center gap-2 mb-4 text-sm">
                            <input
                              type="checkbox"
                              checked={useExistingAddress}
                              onChange={(e) => setUseExistingAddress(e.target.checked)}
                              className="w-4 h-4 rounded accent-[#4a9d4e]"
                            />
                            <span className="text-gray-700">Usar endereço salvo</span>
                          </label>

                          {useExistingAddress && (
                            <div className="space-y-3">
                              {userAddresses.map((addr) => (
                                <label
                                  key={addr.id}
                                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedAddressId === addr.id
                                      ? 'border-[#4a9d4e] bg-green-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="saved-address"
                                    value={addr.id}
                                    checked={selectedAddressId === addr.id}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="mt-1 accent-[#4a9d4e]"
                                  />
                                  <div className="flex-1 text-sm">
                                    <p className="font-semibold text-gray-900">{addr.label}</p>
                                    <p className="text-gray-600 mt-1">
                                      {addr.street}, {addr.number}
                                      {addr.complement && ` - ${addr.complement}`}, {addr.neighborhood}, {addr.city}/{addr.state} - {addr.zipCode}
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* New address form */}
                      {(!useExistingAddress || userAddresses.length === 0) && (
                        <div className="space-y-4">
                          <input
                            type="text"
                            required
                            value={shippingAddress.zipCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                            onBlur={handleZipCodeBlur}
                            placeholder="CEP"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                          <input
                            type="text"
                            required
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                            placeholder="Rua"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              required
                              value={shippingAddress.number}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                              placeholder="Número"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                            />
                            <input
                              type="text"
                              value={shippingAddress.complement}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                              placeholder="Complemento"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                            />
                          </div>
                          <input
                            type="text"
                            required
                            value={shippingAddress.neighborhood}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                            placeholder="Bairro"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              required
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                              placeholder="Cidade"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                            />
                            <input
                              type="text"
                              required
                              maxLength={2}
                              value={shippingAddress.state}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.toUpperCase() })}
                              placeholder="UF"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent uppercase transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('contact')}
                          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={handleContinueToPayment}
                          className="flex-1 py-3 bg-[#4a9d4e] text-white font-semibold rounded-lg hover:bg-[#3d8440] transition-colors"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-gray-700 text-sm">
                      {finalAddress && (
                        <p>
                          {finalAddress.street}, {finalAddress.number}
                          {finalAddress.complement && ` - ${finalAddress.complement}`}, {finalAddress.neighborhood}, {finalAddress.city}/{finalAddress.state}, {finalAddress.zipCode}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Forma de frete */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Forma de frete</span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <span className="text-gray-700">Frete expresso</span>
                    <span className="font-bold text-[#4a9d4e]">GRÁTIS</span>
                  </div>
                </div>
              )}

              {/* Informações adicionais - CPF */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Informações adicionais</span>
                  </div>
                  <div className="p-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF/CNPJ</label>
                      <input
                        type="text"
                        required
                        value={contactInfo.cpf}
                        onChange={(e) => setContactInfo({ ...contactInfo, cpf: e.target.value.replace(/\D/g, '').slice(0, 14) })}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento Section */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Pagamento</span>
                    <p className="text-sm text-gray-600 mt-1">Todas as transações são seguras e criptografadas.</p>
                  </div>

                  <div className="p-6 space-y-4">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                            paymentMethod === option.id
                              ? 'border-[#4a9d4e] bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={option.id}
                            checked={paymentMethod === option.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 accent-[#4a9d4e]"
                          />
                          <Icon size={20} className="text-gray-700" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{option.name}</span>
                              {option.badge && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-[#4a9d4e] text-white rounded">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}

                    {/* Credit Card Fields */}
                    {paymentMethod === 'credit_card' && (
                      <div className="pt-4 space-y-4 border-t">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setCardNumber(value.replace(/(\d{4})(?=\d)/g, '$1 '));
                          }}
                          placeholder="Número do cartão"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-4">
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
                            placeholder="Data de vencimento (MM/AA)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent"
                          />
                          <input
                            type="text"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="Código de segurança"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          placeholder="Nome no cartão"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent uppercase"
                        />

                        {/* Installments */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] focus:border-transparent"
                          >
                            <option value="" disabled>Selecione a parcela</option>
                            {[...Array(12)].map((_, i) => {
                              const parcelas = i + 1;
                              let valorComJuros = total;
                              let textoJuros = '';

                              if (parcelas <= 3) {
                                // 1x a 3x: sem juros
                                textoJuros = ' sem juros';
                              } else {
                                // 4x a 12x: Taxa de 4,99% + 2,49% por parcela
                                const taxaBase = 4.99;
                                const taxaPorParcela = 2.49;
                                const taxaTotal = taxaBase + (taxaPorParcela * parcelas);
                                valorComJuros = total * (1 + taxaTotal / 100);
                                textoJuros = ' com juros';
                              }

                              const valorParcela = valorComJuros / parcelas;

                              return (
                                <option key={parcelas} value={parcelas}>
                                  {parcelas}x de R$ {valorParcela.toFixed(2).replace('.', ',')}{textoJuros}
                                  {parcelas > 3 && ` - Total: R$ ${valorComJuros.toFixed(2).replace('.', ',')}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('shipping')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-[#4a9d4e] text-white font-semibold rounded-lg hover:bg-[#3d8440] transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar código PIX' : 'Finalizar Pedido'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PIX Payment Display */}
              {createdOrder && (createdOrder as any).pixData && (
                <div ref={pixSectionRef} className="bg-white rounded-lg shadow-sm">
                  <div className="p-5 border-b border-gray-100">
                    <span className="text-lg font-bold text-gray-900">PIX Gerado</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {(createdOrder as any).pixData?.pix_qrcode && (
                      <div className="flex justify-center">
                        <img
                          src={`data:image/png;base64,${(createdOrder as any).pixData.pix_qrcode}`}
                          alt="QR Code PIX"
                          className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Valor a pagar:</p>
                      <p className="text-2xl font-bold text-[#4a9d4e]">
                        R$ {createdOrder.total.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={(createdOrder as any).pixData?.pix_emv || ''}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText((createdOrder as any).pixData.pix_emv);
                          alert('Código PIX copiado!');
                        }}
                        className="px-6 py-3 bg-[#4a9d4e] text-white rounded-lg font-semibold hover:bg-[#3d8440]"
                      >
                        Copiar
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        navigate(`/pedido/${createdOrder.id}/confirmacao`, { replace: true });
                      }}
                      className="w-full py-3 bg-[#4a9d4e] text-white font-semibold rounded-lg hover:bg-[#3d8440]"
                    >
                      Já paguei
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#f8fdf9] rounded-lg shadow-sm sticky top-8">
              {/* Products */}
              <div className="p-6 border-b border-gray-100">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium line-clamp-2">{item.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Code */}
              <div className="p-6 border-b border-gray-100">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Código de desconto"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] uppercase text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 text-sm"
                    >
                      Aplicar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-[#4a9d4e]">
                    <div className="flex items-center gap-2">
                      <FiTag size={16} className="text-[#4a9d4e]" />
                      <span className="text-sm font-semibold text-gray-900">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
              </div>

              {/* Summary */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal · {items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                  <span className="text-gray-900 font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto no pedido</span>
                    <span className="text-gray-900 font-medium">- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FiTag size={12} className="text-[#4a9d4e]" />
                    <span>{appliedCoupon.code}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-[#4a9d4e] font-bold">GRÁTIS</span>
                </div>
                {pixDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Desconto PIX (5%)</span>
                    <span className="text-gray-900 font-medium">- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    <span className="text-xs text-gray-600 mr-1">BRL</span>
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#4a9d4e] font-semibold">
                    <FiTag size={12} />
                    <span>ECONOMIA TOTAL: R$ {totalDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
