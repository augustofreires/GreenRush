import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  console.log('[CartPage] Items:', items);
  console.log('[CartPage] Items length:', items.length);

  const subtotal = getTotal();
  const shipping = subtotal >= 350 ? 0 : 29.90;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center bg-white rounded-lg p-12 shadow-md">
            <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-8">
              Adicione produtos ao seu carrinho para continuar comprando
            </p>
            <Link to="/produtos" className="btn-primary inline-block">
              Ir às Compras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="font-semibold text-lg">
                  Produtos ({items.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  Limpar carrinho
                </button>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    {/* Image */}
                    <Link to={`/produto/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1">
                      <Link
                        to={`/produto/${item.id}`}
                        className="font-semibold hover:text-primary-pink transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.category}
                      </p>

                      {/* Mobile Price */}
                      <div className="mt-2 lg:hidden">
                        <p className="font-bold text-primary-blue">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors p-2"
                          title="Remover item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      {item.stock < 10 && (
                        <p className="text-xs text-orange-600 mt-2">
                          Apenas {item.stock} disponíveis
                        </p>
                      )}
                    </div>

                    {/* Desktop Price */}
                    <div className="hidden lg:block text-right">
                      <p className="font-bold text-primary-blue text-lg">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Subtotal: R${' '}
                        {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-6">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-accent-green' : ''}`}>
                    {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                {subtotal < 350 && (
                  <p className="text-xs text-orange-600">
                    Falta R$ {(350 - subtotal).toFixed(2).replace('.', ',')} para frete grátis!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-blue">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  ou 3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros
                </p>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary text-center block mb-3"
              >
                Finalizar Compra
              </Link>
              <Link
                to="/produtos"
                className="w-full btn-secondary text-center block"
              >
                Continuar Comprando
              </Link>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span className="text-gray-600">Garantia de 90 dias</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span className="text-gray-600">Compra 100% segura</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-green">✓</span>
                  <span className="text-gray-600">Entrega rápida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
