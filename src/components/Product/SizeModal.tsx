import { useState } from 'react';
import { FiX, FiShoppingCart, FiCheck } from 'react-icons/fi';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const sizes = [
  { value: 'PP', label: 'PP', description: 'TAM 32-38 | Cintura 60-80cm' },
  { value: 'P', label: 'P', description: 'TAM 40-42 | Cintura 81-90cm' },
  { value: 'M', label: 'M', description: 'TAM 42-46 | Cintura 85-102cm' },
  { value: 'G', label: 'G', description: 'TAM 48-56 | Cintura 105-133cm' },
  { value: 'GG', label: 'GG', description: 'TAM acima de 56 | Cintura +133cm' }
];

export const SizeModal = ({ isOpen, onClose, product }: SizeModalProps) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const productWithSize = {
      ...product,
      selectedVariant: selectedSize,
      name: `${product.name} - Tamanho ${selectedSize}`
    };
    addItem(productWithSize, 1);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">Selecione o Tamanho</h2>
                <p className="text-sm text-green-50">{product.name}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-400 line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </div>

            {/* Size Guide */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📏 Escolha o Tamanho
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`relative border-2 rounded-lg p-3 text-center transition-all hover:scale-105 ${
                      selectedSize === size.value
                        ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                        : 'border-gray-300 hover:border-green-400 bg-white'
                    }`}
                    title={size.description}
                  >
                    {selectedSize === size.value && (
                      <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full p-1">
                        <FiCheck size={12} />
                      </div>
                    )}
                    <div
                      className={`font-bold text-lg ${
                        selectedSize === size.value ? 'text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {size.label}
                    </div>
                    <div className="text-[9px] text-gray-600 mt-0.5 leading-tight">
                      {size.description.split('|')[0].trim().replace('TAM ', '')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Size Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-semibold flex items-center gap-2">
                <FiCheck className="text-blue-600" />
                Tamanho selecionado: <span className="text-blue-600">{selectedSize}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {sizes.find((s) => s.value === selectedSize)?.description}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <FiShoppingCart size={22} />
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
