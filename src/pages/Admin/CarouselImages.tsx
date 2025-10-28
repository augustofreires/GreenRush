import { useState } from 'react';
import { FiImage, FiTrash2, FiPlus, FiMove, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useCarouselStore } from '../../store/useCarouselStore';

type ProductKey = 'cha' | 'greenrush' | 'slimshot' | 'cinta';

const products: { key: ProductKey; label: string }[] = [
  { key: 'cha', label: 'Chá Emagrecedor' },
  { key: 'greenrush', label: 'Greenrush Cápsulas' },
  { key: 'slimshot', label: 'Slimshot' },
  { key: 'cinta', label: 'Cinta Modeladora' },
];

export const CarouselImages = () => {
  const { images, addImage, removeImage, reorderImages } = useCarouselStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductKey>('cha');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentImages = images[selectedProduct] || [];

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira uma URL válida' });
      return;
    }

    try {
      // Validar se é uma URL válida
      new URL(newImageUrl);
      addImage(selectedProduct, newImageUrl);
      setNewImageUrl('');
      setMessage({ type: 'success', text: 'Imagem adicionada com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'URL inválida. Por favor, insira uma URL válida.' });
    }
  };

  const handleRemoveImage = (index: number) => {
    if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
      removeImage(selectedProduct, index);
      setMessage({ type: 'success', text: 'Imagem removida com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderImages(selectedProduct, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < currentImages.length - 1) {
      reorderImages(selectedProduct, index, index + 1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Imagens dos Carrosséis</h1>
        <p className="text-gray-600">
          Adicione, remova e reordene as imagens que aparecem nos carrosséis das landing pages
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✅' : '❌'}
          <span>{message.text}</span>
        </div>
      )}

      {/* Product Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Selecione o Produto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <button
              key={product.key}
              onClick={() => setSelectedProduct(product.key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedProduct === product.key
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FiImage className="w-6 h-6 mb-2 mx-auto" />
              <p className="font-semibold text-center">{product.label}</p>
              <p className="text-xs text-center mt-1 opacity-75">
                {images[product.key]?.length || 0} {images[product.key]?.length === 1 ? 'imagem' : 'imagens'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Add New Image */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar Nova Imagem</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Cole a URL da imagem aqui"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
          />
          <button
            onClick={handleAddImage}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FiPlus size={20} />
            Adicionar
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 Dica: Use URLs de imagens hospedadas externamente (ex: Imgur, Cloudinary, etc.)
        </p>
      </div>

      {/* Current Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Imagens do Carrossel - {products.find((p) => p.key === selectedProduct)?.label}
        </h2>

        {currentImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma imagem adicionada ainda</p>
            <p className="text-sm">Adicione a primeira imagem usando o formulário acima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentImages.map((imageUrl, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-all group"
              >
                {/* Image Preview */}
                <div className="relative bg-gray-100 aspect-square">
                  <img
                    src={imageUrl}
                    alt={`${selectedProduct} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400?text=Erro+ao+carregar';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    #{index + 1}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <FiChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === currentImages.length - 1}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <FiChevronDown size={18} />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover imagem"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>

                  {/* URL Display */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 truncate" title={imageUrl}>
                      {imageUrl}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentImages.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> As imagens aparecerão no carrossel na ordem mostrada acima.
              Use os botões de seta para reordenar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
