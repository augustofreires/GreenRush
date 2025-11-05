import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiCreditCard, FiStar, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { ProductCard } from '../../components/Product/ProductCard';
import { WhyChoose } from '../../components/Product/WhyChoose';
import { ProductFAQ } from '../../components/Product/ProductFAQ';
import { ProductReviews } from '../../components/Review/ProductReviews';

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug, getAvailableProducts } = useProductStore();
  const { addItem } = useCartStore();

  const product = getProductBySlug(slug || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'benefits' | 'ingredients' | 'howToUse'>('description');

  // Selecionar automaticamente a primeira variação com estoque quando o produto carregar
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) {
        setSelectedVariant(firstAvailable.id);
      }
    }
  }, [product, selectedVariant]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Link to="/produtos" className="text-primary-green hover:underline">
            Voltar para produtos
          </Link>
        </div>
      </div>
    );
  }

  // Priorizar imagem principal (editada pelo usuário) sobre array de imagens
  const productImages = product.image && product.image !== 'https://via.placeholder.com/400'
    ? [product.image]
    : (product.images && product.images.length > 0 ? product.images : [product.image]);

  const relatedProducts = getAvailableProducts()
    .filter(p => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  // Get current variant data
  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const currentPrice = currentVariant?.price || product.price;
  const currentOriginalPrice = currentVariant?.originalPrice || product.originalPrice;

  // Para produtos com variantes, verificar se há ALGUMA variante disponível
  const hasAvailableVariants = product.variants && product.variants.length > 0
    ? product.variants.some(v => v.stock > 0)
    : false;

  const currentStock = currentVariant?.stock || product.stock;

  // Se tem variantes e pelo menos uma disponível, considerar produto disponível
  const isProductAvailable = product.variants && product.variants.length > 0
    ? hasAvailableVariants
    : currentStock > 0;

  const handleAddToCart = () => {
    const productToAdd = { ...product, selectedVariant };
    addItem(productToAdd, quantity);
  };

  const incrementQuantity = () => setQuantity(q => Math.min(q + 1, currentStock));
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const discount = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-green">Início</Link>
            <span>/</span>
            <Link to="/produtos" className="hover:text-primary-green">Produtos</Link>
            <span>/</span>
            <Link to={`/produtos/${product.category}`} className="hover:text-primary-green capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden aspect-square">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  {product.badge === 'new' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-500">
                      NOVO
                    </span>
                  )}
                  {product.badge === 'sale' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-red-500">
                      {discount}% OFF
                    </span>
                  )}
                  {product.badge === 'bestseller' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-gray-900 bg-yellow-500">
                      MAIS VENDIDO
                    </span>
                  )}
                  {product.badge === 'combo' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-purple-600">
                      COMBO
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-green'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              {product.rating && (
                <div className="flex items-center gap-3">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews || 0} avaliações)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-y py-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold" style={{ color: '#4a9d4e' }}>
                  R$ {currentPrice.toFixed(2)}
                </span>
                {currentOriginalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      R$ {currentOriginalPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                ou 3x de R$ {(currentPrice / 3).toFixed(2)} sem juros
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isProductAvailable ? (
                <>
                  <FiCheck className="text-green-500" />
                  <span className="text-green-700 font-medium">
                    {product.variants && product.variants.length > 0
                      ? 'Produto disponível'
                      : `${currentStock} unidades em estoque`
                    }
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-medium">Produto esgotado</span>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione o tamanho:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant.id);
                        setQuantity(1);
                      }}
                      disabled={variant.stock === 0}
                      className={`relative border-2 rounded-lg px-4 py-2 min-w-[60px] transition-all text-center ${
                        selectedVariant === variant.id
                          ? 'border-[#4a9d4e] bg-green-50'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{variant.name}</div>
                      {variant.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                          <span className="text-xs font-bold text-red-600">ESGOTADO</span>
                        </div>
                      )}
                      {selectedVariant === variant.id && (
                        <FiCheck className="absolute top-1 right-1 text-[#4a9d4e]" size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FiMinus size={18} />
                  </button>
                  <span className="px-6 py-3 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= currentStock}
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!isProductAvailable || (product.variants && product.variants.length > 0 && !selectedVariant) || (selectedVariant && currentVariant && currentVariant.stock === 0)}
                className="w-full text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4a9d4e' }}
              >
                <FiShoppingCart size={22} />
                {product.variants && product.variants.length > 0 && !selectedVariant
                  ? 'Selecione uma opção'
                  : currentVariant && currentVariant.stock === 0
                  ? 'Variante esgotada'
                  : 'Adicionar ao Carrinho'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="border-2 border-gray-300 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:border-primary-green transition-colors">
                  <FiHeart size={20} />
                  Favoritar
                </button>
                <button className="border-2 border-gray-300 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:border-primary-green transition-colors">
                  <FiShare2 size={20} />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-start gap-3">
                <FiTruck className="text-primary-green flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Frete Grátis</p>
                  <p className="text-xs text-gray-600">para todo o brasil</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiShield className="text-primary-green flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Compra Segura</p>
                  <p className="text-xs text-gray-600">Proteção total</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCreditCard className="text-primary-green flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Parcelamento</p>
                  <p className="text-xs text-gray-600">Em até 12x</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-12">
          {/* Tab Headers */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'description', label: 'Descrição' },
                { id: 'benefits', label: 'Benefícios' },
                { id: 'ingredients', label: 'Ingredientes' },
                { id: 'howToUse', label: 'Como Usar' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-green text-primary-green'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-4">Sobre o Produto</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {product.description}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Este produto foi especialmente desenvolvido com ingredientes de alta qualidade para proporcionar os melhores resultados. Recomendado por especialistas e aprovado por milhares de clientes satisfeitos.
                </p>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-4">Principais Benefícios</h3>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="space-y-3">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <FiCheck className="text-green-500 flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">
                    Este produto foi especialmente desenvolvido para proporcionar os melhores resultados. Recomendado por especialistas e aprovado por milhares de clientes satisfeitos.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-4">Composição</h3>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {product.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                          <FiCheck className="text-green-500 flex-shrink-0" size={18} />
                          <span className="text-gray-700 font-medium">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      *Consulte a embalagem do produto para lista completa de ingredientes e informações nutricionais.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700">
                    Ingredientes de alta qualidade selecionados para proporcionar os melhores resultados.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'howToUse' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-4">Modo de Usar</h3>
                {product.howToUse && product.howToUse.length > 0 ? (
                  <>
                    <ol className="space-y-3 list-decimal list-inside">
                      {product.howToUse.map((instruction, index) => (
                        <li key={index} className="text-gray-700 text-base leading-relaxed">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                    <p className="text-sm text-gray-600 italic mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      ⚠️ Consulte um profissional de saúde antes de iniciar qualquer suplementação.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700">
                    Siga as instruções da embalagem do produto para melhor utilização.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Why Choose Section */}
        {product.whyChoose && product.whyChoose.length > 0 && (
          <div className="mb-12">
            <WhyChoose reasons={product.whyChoose} />
          </div>
        )}

        {/* Customer Reviews */}
        <div className="mb-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* FAQ Section */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="mb-12">
            <ProductFAQ faqs={product.faqs} />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
