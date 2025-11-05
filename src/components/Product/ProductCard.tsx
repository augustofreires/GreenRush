import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { SizeModal } from './SizeModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [showSizeModal, setShowSizeModal] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Verifica se o produto precisa de seleção de tamanho
  const needsSizeSelection = product.name.toLowerCase().includes('cinta');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (needsSizeSelection) {
      setShowSizeModal(true);
    } else {
      addItem(product);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Usar landing page customizada se existir, senão usar página padrão do produto
  const productUrl = product.customLandingPage || `/produto/${product.slug}`;

  return (
    <Link
      to={productUrl}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge === 'new' && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              NOVO
            </span>
          )}
          {product.badge === 'sale' && discount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              -{discount}%
            </span>
          )}
          {product.badge === 'bestseller' && (
            <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              MAIS VENDIDO
            </span>
          )}
          {product.badge === 'combo' && (
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              COMBO
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implementar wishlist
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-primary-green hover:text-white transition-colors"
        >
          <FiHeart size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.rating!) ? '★' : '☆'}
                </span>
              ))}
            </div>
            {product.reviews && (
              <span className="text-xs text-gray-500">({product.reviews})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-blue">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {/* Installments */}
        <p className="text-xs text-gray-600 mt-1">
          ou 12x de R$ {((product.price * 1.3487) / 12).toFixed(2).replace('.', ',')}
        </p>

        {/* Stock */}
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Apenas {product.stock} em estoque
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-600 mt-2">
            ❌ Produto esgotado
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          style={product.stock !== 0 ? { backgroundColor: '#4a9d4e', color: '#FFFFFF' } : undefined}
          className="w-full mt-4 bg-primary-green text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FiShoppingCart size={18} />
          {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </button>
      </div>

      {/* Size Selection Modal */}
      <SizeModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        product={product}
      />
    </Link>
  );
};
