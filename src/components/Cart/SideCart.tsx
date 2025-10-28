import { Link } from 'react-router-dom';
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { useState } from 'react';

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
  const [recommendedProducts] = useState(() => Array.isArray(products) ? products.slice(0, 3) : []);

  // Calculate totals directly - will recalculate on every version change
  const subtotal = items.reduce((sum, item) => {
    console.log(`[SideCart v${version}] ${item.name}: R$ ${item.price} x ${item.quantity} = R$ ${item.price * item.quantity}`);
    return sum + (item.price * item.quantity);
  }, 0);
  const shipping = subtotal >= 350 ? 0 : 29.90;
  const total = subtotal + shipping;

  console.log(`[SideCart v${version}] TOTAL ITEMS: ${items.length} | SUBTOTAL: R$ ${subtotal.toFixed(2)} | FRETE: R$ ${shipping.toFixed(2)} | TOTAL: R$ ${total.toFixed(2)}`);

  const handleAddRecommended = (product: any) => {
    addItem(product, 1);
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
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-primary-green font-bold text-sm mt-0.5">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-0.5 hover:bg-gray-100 transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="px-2 py-0.5 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-0.5 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors p-0.5"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-sm mb-3 text-gray-900">
                    Aproveite e leve junto! 🎁
                  </h3>
                  <div className="space-y-2">
                    {recommendedProducts
                      .filter(p => !items.find(item => item.id === p.id))
                      .slice(0, 2)
                      .map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-2 p-2 bg-pink-50 rounded-lg border border-pink-200"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
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
                              className="text-xs px-2 py-0.5 rounded-full mt-1 transition-colors"
                              style={{ backgroundColor: '#4a9d4e', color: '#FFFFFF' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E63980'}
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

              {/* Free Shipping Progress */}
              {subtotal < 350 && (
                <div className="bg-accent-green bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-900 mb-2">
                    Falta R$ {(350 - subtotal).toFixed(2).replace('.', ',')} para frete GRÁTIS!
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-accent-green h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / 350) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
            <div className="space-y-1 mb-3" key={`cart-summary-${version}`}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900" key={`subtotal-${version}`}>
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Frete</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`} key={`shipping-${version}`}>
                  {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1.5 border-t">
                <span className="text-gray-900">Total</span>
                <span style={{ color: '#4a9d4e' }} key={`total-${version}`}>
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full py-2.5 rounded-full font-bold text-sm text-center block transition-colors text-white"
                style={{ backgroundColor: '#4a9d4e' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E63980'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a9d4e'}
              >
                Finalizar Compra
              </Link>
              <Link
                to="/carrinho"
                onClick={onClose}
                className="w-full py-2.5 rounded-full font-bold text-sm text-center block border-2 transition-colors"
                style={{ borderColor: '#4a9d4e', color: '#4a9d4e' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDF2F8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Ir para o Carrinho
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
