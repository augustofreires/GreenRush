import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiTag } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { SizeModal } from '../Product/SizeModal';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideCart = ({ isOpen, onClose }: SideCartProps) => {
  // Use separate selectors to ensure reactivity - include version to force updates
  const items = useCartStore((state) => state.items);
  const version = useCartStore((state) => state.version);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const addItem = useCartStore((state) => state.addItem);
  const products = useProductStore((state) => state.products);
  
  // Estados para recomendações inteligentes
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  // Estados para modal de tamanho
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Cupom states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Helper para gerar ID único do item (id + variante)
  const getItemKey = (item: any) => {
    return item.selectedVariant ? `${item.id}-${item.selectedVariant}` : item.id;
  };

  // Função para identificar produtos por slug
  const getProductType = (product: any) => {
    const slug = product.slug?.toLowerCase() || '';
    const name = product.name?.toLowerCase() || '';

    if (slug.includes('slimshot') || slug.includes('vinagre') || name.includes('slimshot') || name.includes('vinagre')) {
      return 'slimshot';
    }
    if (slug.includes('cha') || slug.includes('detox') || name.includes('chá') || name.includes('detox')) {
      return 'cha';
    }
    if (slug.includes('capsul') || slug.includes('greenrush-capsulas') || name.includes('cápsula')) {
      return 'capsulas';
    }
    if (slug.includes('cinta') || name.includes('cinta')) {
      return 'cinta';
    }
    return 'outro';
  };

  // Função para obter recomendações inteligentes baseadas no carrinho
  const getSmartRecommendations = (cartItems: any[], allProducts: any[]) => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      return [];
    }

    // Identificar os 4 produtos principais (SlimShot, Chá Detox, Cápsulas, Cinta)
    const mainProducts = allProducts.filter(product => {
      const slug = (product.slug || '').toLowerCase();
      const name = (product.name || '').toLowerCase();
      
      return (
        // SlimShot / Vinagre de maçã
        slug.includes('slimshot') || slug.includes('vinagre') ||
        // Chá Detox
        slug.includes('cha') || slug.includes('detox') ||
        // Cápsulas
        slug.includes('capsul') || name.includes('capsul') ||
        // Cinta Modeladora
        slug.includes('cinta') || name.includes('cinta')
      );
    });

    // Filtrar produtos que já estão no carrinho
    const cartProductIds = cartItems.map(item => item.id);
    const recommendations = mainProducts.filter(p => !cartProductIds.includes(p.id));

    // Retornar os 3 produtos restantes (quando adiciona 1 dos 4, sugere os outros 3)
    return recommendations.slice(0, 3);
  };

  // Atualizar recomendações quando o carrinho ou produtos mudarem
  useEffect(() => {
    const recommendations = getSmartRecommendations(items, products);
    setRecommendedProducts(recommendations);
  }, [items, products]);

  

  // Função para aplicar cupom
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

  // Calculate totals directly - will recalculate on every version change
  const subtotal = items.reduce((sum, item) => {
    console.log(`[SideCart v${version}] ${item.name}: R$ ${item.price} x ${item.quantity} = R$ ${item.price * item.quantity}`);
    return sum + (item.price * item.quantity);
  }, 0);
  const shipping = 0; // Frete sempre grátis
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.discount_percent / 100) : 0;
  const total = subtotal + shipping - couponDiscount;

  console.log(`[SideCart v${version}] TOTAL ITEMS: ${items.length} | SUBTOTAL: R$ ${subtotal.toFixed(2)} | FRETE: R$ ${shipping.toFixed(2)} | DESCONTO: R$ ${couponDiscount.toFixed(2)} | TOTAL: R$ ${total.toFixed(2)}`);

  // Função para adicionar produto recomendado
  const handleAddRecommended = (product: any) => {
    const productType = getProductType(product);

    // Se for cinta, abrir modal de tamanho
    if (productType === 'cinta') {
      setSelectedProduct(product);
      setShowSizeModal(true);
    } else {
      // Adicionar direto ao carrinho
      addItem(product, 1);
    }
  };

  // Fechar modal de tamanho
  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#4a9d4e' }}>
          <div className="flex items-center gap-2">
            <FiShoppingBag size={20} style={{ color: '#FFFFFF' }} />
            <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
              Meu Carrinho ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: '#FFFFFF' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E63980'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px - 280px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <FiShoppingBag className="text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione produtos para começar suas compras
              </p>
              <button
                onClick={onClose}
                className="bg-primary-green text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item) => {
                  const itemKey = getItemKey(item);
                  return (
                    <div key={itemKey} className="flex gap-2 pb-2 border-b">
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-primary-green font-bold text-xs mt-0.5">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 transition-colors"
                            >
                              <FiMinus size={10} />
                            </button>
                            <span className="px-2 py-0.5 text-xs min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity >= item.stock}
                            >
                              <FiPlus size={10} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-red-600 hover:text-red-700 transition-colors p-1"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="font-bold text-xs mb-2 text-gray-900">
                    Aproveite e leve junto! 🎁
                  </h3>
                  <div className="space-y-2">
                    {recommendedProducts
                      .filter(p => !items.find(item => item.id === p.id))
                      .slice(0, 2)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-2 p-2 rounded-xl border"
                          style={{ backgroundColor: '#f8fdf9', borderColor: '#e8f5e8' }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs line-clamp-2">
                              {product.name}
                            </h4>
                            <p className="text-primary-green font-bold text-xs mt-0.5">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                            <button
                              onClick={() => handleAddRecommended(product)}
                              className="text-xs px-2 py-0.5 rounded-full mt-0.5 transition-colors"
                              style={{ backgroundColor: '#4a9d4e', color: '#FFFFFF' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3d8440'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a9d4e'}
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            {/* Cupom de Desconto */}
            <div className="mb-3 pb-3 border-b">
              {!appliedCoupon ? (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FiTag className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Cupom de desconto"
                        className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a9d4e] uppercase text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-2 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 text-xs"
                      style={{ backgroundColor: '#4a9d4e' }}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 mt-1">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl border border-[#4a9d4e]" style={{ backgroundColor: '#f8fdf9' }}>
                  <div className="flex items-center gap-2">
                    <FiTag size={12} style={{ color: '#4a9d4e' }} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs" style={{ color: '#4a9d4e' }}>
                        -{appliedCoupon.discount_percent}%
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1 mb-3" key={`cart-summary-${version}`}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900" key={`subtotal-${version}`}>
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Frete</span>
                <span className="font-semibold text-green-600" key={`shipping-${version}`}>
                  GRÁTIS
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Desconto ({appliedCoupon?.discount_percent}%)</span>
                  <span className="font-semibold text-green-600">
                    - R$ {couponDiscount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1.5 border-t">
                <span className="text-gray-900">Total</span>
                <span style={{ color: '#4a9d4e' }} key={`total-${version}`}>
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm text-center block transition-colors text-white"
              style={{ backgroundColor: '#4a9d4e' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3d8440'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a9d4e'}
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Tamanho */}
      {showSizeModal && selectedProduct && (
        <SizeModal
          isOpen={showSizeModal}
          onClose={handleCloseSizeModal}
          product={selectedProduct}
        />
      )}
    </>
  );
};
