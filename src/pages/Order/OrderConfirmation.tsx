import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiCreditCard, FiMapPin, FiClock, FiCopy, FiLock } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import axios from 'axios';
import type { Order } from '../../types';
import { trackPurchase } from '../../utils/tracking';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface PixData {
  pixCode: string;
  qrCodeDataURL: string;
  amount: number;
  orderId: string;
  expiresAt: string;
}

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado do formulário de cartão
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseEventFired, setPurchaseEventFired] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      console.log('📦 OrderConfirmation: orderId =', orderId);

      if (!orderId) {
        console.error('❌ Sem orderId, redirecionando para home');
        navigate('/');
        return;
      }

      try {
        console.log('🔍 Buscando pedido:', orderId);
        const orderData = await orderService.getById(orderId);
        console.log('✅ Pedido encontrado:', orderData);
        setOrder(orderData);

        // 🎉 DISPARAR EVENTO DE CONVERSÃO (Purchase) - Backup
        // Só dispara se ainda não foi disparado (evita duplicatas)
        if (!purchaseEventFired && orderData.items) {
          const trackingItems = orderData.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          }));
          trackPurchase(
            orderData.id,
            trackingItems,
            orderData.total,
            undefined // coupon não disponível aqui
          );
          setPurchaseEventFired(true);
          console.log('🎯 Purchase event (backup) disparado na confirmação');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar pedido:', error);
        alert('Pedido não encontrado. Você será redirecionado para a home.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  useEffect(() => {
    // Se o pedido for PIX, gerar o código automaticamente
    if (order && order.paymentMethod === 'pix' && !pixData) {
      generatePix();
    }
  }, [order]);

  const generatePix = async () => {
    if (!orderId) return;

    setLoadingPix(true);
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/generate-pix`);
      setPixData(response.data);
      console.log('✅ PIX gerado:', response.data);
    } catch (error) {
      console.error('❌ Erro ao gerar PIX:', error);
    } finally {
      setLoadingPix(false);
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers;
    return formatted.substring(0, 19); // 16 dígitos + 3 espaços
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.substring(0, 2)}/${numbers.substring(2, 4)}`;
    }
    return numbers;
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'number') {
      setCardData({ ...cardData, number: formatCardNumber(value) });
    } else if (field === 'expiry') {
      setCardData({ ...cardData, expiry: formatExpiry(value) });
    } else if (field === 'cvv') {
      setCardData({ ...cardData, cvv: value.replace(/\D/g, '').substring(0, 4) });
    } else {
      setCardData({ ...cardData, [field]: value });
    }
  };

  const processCardPayment = async () => {
    // Validar dados do cartão
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert('Por favor, preencha todos os dados do cartão');
      return;
    }

    setProcessingPayment(true);

    // Simular processamento (em produção, integrar com gateway de pagamento)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setProcessingPayment(false);
    setPaymentSuccess(true);

    console.log('💳 Pagamento processado com sucesso');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const paymentMethodLabels: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    boleto: 'Boleto Bancário',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Número do pedido: <span className="font-semibold text-green-600">{order.id}</span>
          </p>
          <p className="text-sm text-gray-500">
            Você receberá um e-mail com os detalhes do seu pedido em breve.
          </p>
        </div>

        {/* Payment Info - PIX */}
        {order.paymentMethod === 'pix' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="mr-2" />
              Pagamento via PIX
            </h2>

            {loadingPix ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Gerando código PIX...</span>
              </div>
            ) : pixData ? (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <FiClock className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Código expira em 30 minutos.</strong> Após o pagamento, seu pedido será processado automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold mb-3">Escaneie o QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img
                        src={pixData.qrCodeDataURL}
                        alt="QR Code PIX"
                        className="w-64 h-64"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      Abra o app do seu banco e escaneie o código
                    </p>
                  </div>

                  {/* Código Copia e Cola */}
                  <div className="flex flex-col">
                    <h3 className="font-semibold mb-3">Ou copie o código</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-1">
                      <p className="text-xs text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                      <div className="bg-white p-3 rounded border border-gray-300 break-all text-xs font-mono">
                        {pixData.pixCode}
                      </div>
                    </div>
                    <button
                      onClick={copyPixCode}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <FiCopy />
                      {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Cole o código no seu app de pagamento
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Valor a pagar:</strong> {formatCurrency(pixData.amount)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Erro ao gerar código PIX</p>
                <button
                  onClick={generatePix}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
                >
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Info - Credit Card */}
        {(order.paymentMethod === 'credit_card' || order.paymentMethod === 'debit_card') && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="mr-2" />
              Pagamento com Cartão
            </h2>

            {paymentSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <FiCheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Pagamento Aprovado!
                </h3>
                <p className="text-gray-600">
                  Seu pedido será processado em breve.
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Valor a pagar:</strong> {formatCurrency(order.total)}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Número do Cartão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      maxLength={19}
                    />
                  </div>

                  {/* Nome no Cartão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Validade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        maxLength={5}
                      />
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {/* Botão de Pagamento */}
                  <button
                    onClick={processCardPayment}
                    disabled={processingPayment}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando Pagamento...
                      </>
                    ) : (
                      <>
                        <FiCreditCard className="mr-2" />
                        Finalizar Pagamento
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    <FiLock className="inline mr-1" />
                    Seus dados estão seguros e protegidos
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiPackage className="mr-2" />
            Itens do Pedido
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} cada
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(order.subtotal || order.total)}</span>
            </div>
            {order.shipping !== undefined && order.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frete</span>
                <span className="text-gray-900">{formatCurrency(order.shipping)}</span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Desconto</span>
                <span className="text-green-600">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-green-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiCreditCard className="mr-2" />
            Forma de Pagamento
          </h2>
          <p className="text-gray-700">
            {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
          </p>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiMapPin className="mr-2" />
            Endereço de Entrega
          </h2>
          <div className="text-gray-700">
            <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
            {order.shippingAddress.complement && (
              <p>{order.shippingAddress.complement}</p>
            )}
            <p>{order.shippingAddress.neighborhood}</p>
            <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
            <p>CEP: {order.shippingAddress.zipCode}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium"
          >
            Continuar Comprando
          </button>
          <button
            onClick={() => navigate('/conta')}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
          >
            Meus Pedidos
          </button>
        </div>
      </div>
    </div>
  );
};
