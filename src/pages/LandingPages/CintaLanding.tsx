import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheck, FiStar, FiShoppingCart, FiTruck, FiShield,
  FiCreditCard, FiZap, FiHeart, FiDroplet, FiTarget,
  FiAward, FiTrendingUp, FiUsers, FiChevronDown, FiChevronLeft, FiChevronRight, FiPlay
} from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { useCarouselStore } from '../../store/useCarouselStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ProductCard } from '../../components/Product/ProductCard';
import { BeforeAfterCarousel } from '../../components/BeforeAfter/BeforeAfterCarousel';
import { VideoCarousel } from '../../components/Testimonials/VideoCarousel';
import { ReviewsSection } from '../../components/Review/ReviewsSection';

export const CintaLanding = () => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null); // Nenhum kit selecionado por padrão
  const [selectedSize, setSelectedSize] = useState('M'); // Tamanho M como padrão
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const { images: carouselImages } = useCarouselStore();
  const { settings } = useSettingsStore();

  const { getProductBySlug, getAvailableProducts, getProductsByCustomLanding } = useProductStore();

  // Buscar produto do banco de dados pelo customLandingPage
  const products = getProductsByCustomLanding('/cinta-modeladora');
  const product = products.length > 0 ? products[0] : null;

  // Produtos relacionados (exceto o atual)
  const relatedProducts = getAvailableProducts().filter(p => p.slug !== 'cinta-modeladora').slice(0, 4);

  // Todos os produtos disponíveis
  const allProducts = getAvailableProducts();

  // Tamanhos disponíveis
  const sizes = [
    { value: 'PP', label: 'PP', description: 'TAM 32-38 | Cintura 60-80cm' },
    { value: 'P', label: 'P', description: 'TAM 40-42 | Cintura 81-90cm' },
    { value: 'M', label: 'M', description: 'TAM 42-46 | Cintura 85-102cm' },
    { value: 'G', label: 'G', description: 'TAM 48-56 | Cintura 105-133cm' },
    { value: 'GG', label: 'GG', description: 'TAM acima de 56 | Cintura +133cm' }
  ];
  // Buscar produtos dos kits do banco de dados
  // Buscar produto da cinta baseado no tamanho selecionado
  const cintaProduct = selectedSize !== 'M'
    ? allProducts.find(p => p.slug === `cinta-modeladora-${selectedSize.toLowerCase()}`)
    : product;
  const cintaChaProduct = allProducts.find(p => p.slug === 'cinta-ch' || p.slug === 'combo-cinta-ch');
  const kitEmagrecedorProduct = allProducts.find(p => p.slug === 'combo-emagrecimento-completo');

  // Pacotes/Kits disponíveis
  const packages = [
    {
      id: 1,
      quantity: 1,
      label: '1 Cinta Modeladora',
      product: cintaProduct,
      pricePerUnit: 297.00,
      total: 297.00,
      originalPrice: 397.00,
      discount: 100.00,
      badge: null,
      badgeColor: ''
    },
    {
      id: 2,
      quantity: 1,
      label: 'Kit: Chá Detox + Cinta Modeladora',
      product: cintaChaProduct || cintaProduct,
      pricePerUnit: 359.00,
      total: 359.00,
      originalPrice: 474.90,
      discount: 115.90,
      badge: 'MAIS VENDIDO',
      badgeColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      id: 3,
      quantity: 1,
      label: 'Kit Emagrecedor + Cinta Modeladora',
      product: kitEmagrecedorProduct || cintaProduct,
      pricePerUnit: 479.00,
      total: 479.00,
      originalPrice: 634.80,
      discount: 155.80,
      badge: 'MELHOR OFERTA',
      badgeColor: 'bg-gradient-to-r from-green-600 to-green-700'
    }
  ];

  const handleAddToCart = () => {
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    if (selectedPkg?.product) {
      const productWithSize = {
        ...selectedPkg.product,
        selectedVariant: selectedSize,
        name: `${selectedPkg.label} - Tamanho ${selectedSize}`
      };
      addItem(productWithSize, selectedPkg.quantity || 1);
    } else if (product) {
      const productWithSize = {
        ...product,
        selectedVariant: selectedSize,
        name: `${product.name} - Tamanho ${selectedSize}`
      };
      addItem(productWithSize, 1);
    }
  };

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);

  // Imagens para o carrossel - usar da store de carrossel
  const productImages = carouselImages.cinta && carouselImages.cinta.length > 0
    ? carouselImages.cinta
    : (product?.images && product.images.length > 0
      ? product.images
      : [product?.image || 'https://via.placeholder.com/400']);

  // Navegação do carrossel
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const benefits = [
    {
      icon: <FiDroplet className="w-8 h-8" />,
      title: 'Modelagem Corporal',
      description: 'Modela sua silhueta realçando suas curvas naturais'
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: 'Redução de Medidas',
      description: 'Ajuda na compressão e eliminação de gordura localizada'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Efeito Térmico',
      description: 'Aumenta a transpiração e acelera a queima de calorias'
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: 'Conforto Total',
      description: 'Tecido respirável e ajuste anatômico para uso diário'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Vista sua Cinta',
      description: 'Ajuste confortavelmente sobre a pele ou por cima de roupa íntima'
    },
    {
      step: '2',
      title: 'Use Diariamente',
      description: 'Use por 4-8 horas por dia durante suas atividades rotineiras'
    },
    {
      step: '3',
      title: 'Veja Resultados',
      description: 'Em 15-30 dias você já verá redução de medidas e modelagem corporal'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo demora para ver resultados?',
      answer: 'Os primeiros resultados são visíveis imediatamente pela modelagem instantânea. Para redução de medidas duradoura, recomendamos uso contínuo por 15-30 dias, combinado com alimentação equilibrada e atividade física.'
    },
    {
      question: 'Posso usar a cinta o dia todo?',
      answer: 'Sim! Nossa cinta é desenvolvida para uso prolongado. Recomendamos começar com 4 horas por dia e ir aumentando gradualmente até 8-10 horas conforme seu conforto.'
    },
    {
      question: 'Como escolher o tamanho certo?',
      answer: 'Utilize nossa tabela de medidas baseada no seu manequim e medida da cintura. Em caso de dúvida entre dois tamanhos, escolha o maior para garantir mais conforto.'
    },
    {
      question: 'Posso usar durante exercícios?',
      answer: 'Sim! A cinta tem efeito térmico que potencializa a queima de calorias durante treinos. O tecido respirável proporciona conforto mesmo durante atividades físicas.'
    },
    {
      question: 'Tem garantia?',
      answer: 'Sim! Oferecemos 30 dias de garantia. Se não ficar satisfeita, devolvemos seu dinheiro.'
    }
  ];

  // Verificar se produto existe
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Link to="/" className="text-primary-green hover:underline">
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section - Layout Atualizado */}
      <section className="bg-gray-50 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left Content - Carrossel de Imagens */}
            <div className="lg:sticky lg:top-8">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full aspect-square object-contain"
                />

                {/* Botões de navegação - aparecem ao passar o mouse */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Imagem anterior"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Próxima imagem"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Contador de imagens */}
                {productImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                )}

                {/* Indicadores do carrossel */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-green-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ver imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-green-500 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Content - Informações e Compra */}
            <div className="space-y-4">
              {/* Título e Descrição */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Cinta Modeladora GreenRush
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  A cinta modeladora que acelera resultados, modela seu corpo e ajuda na eliminação de medidas. Conforto e eficácia comprovada.
                </p>
              </div>

              {/* Preços */}
              <div>
                <p className="text-gray-400 line-through text-lg mb-1">
                  R$ {(selectedPkg?.pricePerUnit ? selectedPkg.pricePerUnit * 1.4 : product?.originalPrice || 0).toFixed(2)}
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">
                    R$ {selectedPkg?.pricePerUnit.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600">12x de R$ {((selectedPkg?.total || 0) / 12).toFixed(2)} sem juros</span>
                </div>
              </div>

              {/* Badges de Benefícios */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  <FiCreditCard size={16} />
                  5% OFF no pix
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  <FiTruck size={16} />
                  Envio em até 24h
                </div>
              </div>

              {/* Package Options */}
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-green-300 bg-white'
                    }`}
                  >
                    {/* Badge mais vendido */}
                    {pkg.badge && (
                      <div className={`absolute -top-2 -right-2 ${pkg.badgeColor} text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                        <FiStar className="fill-white" size={10} />
                        {pkg.badge}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Radio Button */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPackage === pkg.id
                          ? 'border-green-600 bg-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedPackage === pkg.id && (
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{pkg.label}</p>
                            {pkg.discount > 0 && (
                              <p className="text-xs text-gray-600">
                                {pkg.quantity === 3 && '+ Brinde grátis'}
                                {pkg.quantity === 5 && '+ E-book grátis'}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold text-gray-900">
                              R$ {pkg.pricePerUnit.toFixed(2)} <span className="text-xs font-normal text-gray-600">/ Cada</span>
                            </p>
                            {pkg.discount > 0 && (
                              <p className="text-green-600 font-semibold text-xs">
                                Economize R$ {pkg.discount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seletor de Tamanhos - aparece quando um kit é selecionado */}
              {selectedPackage && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-bold text-blue-900 mb-3">
                    📏 Escolha o Tamanho da Cinta:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSize(size.value);
                        }}
                        className={selectedSize === size.value 
                          ? 'border-2 border-blue-600 bg-blue-100 ring-2 ring-blue-300 rounded-lg p-2 text-center transition-all hover:scale-105'
                          : 'border-2 border-gray-300 hover:border-blue-400 bg-white rounded-lg p-2 text-center transition-all hover:scale-105'}
                        title={size.description}
                      >
                        <div className={selectedSize === size.value ? 'font-bold text-lg text-blue-700' : 'font-bold text-lg text-gray-700'}>
                          {size.label}
                        </div>
                        <div className="text-[9px] text-gray-600 mt-0.5 leading-tight">
                          {size.description.split('|')[0].trim().replace('TAM ', '')}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-800 font-semibold">
                      ✓ Tamanho selecionado: <span className="text-blue-600">{selectedSize}</span> - {sizes.find(s => s.value === selectedSize)?.description}
                    </p>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              >
                <FiShoppingCart size={22} />
                Adicionar ao Carrinho
              </button>

              {/* Informação de Entrega */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FiTruck className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-green-800 font-semibold text-sm">
                      Chegará entre 10 de out. e 13 de out.
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      Confirme o prazo de entrega antes de finalizar o pedido
                    </p>
                  </div>
                </div>
              </div>

              {/* Garantias */}
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FiShield className="text-green-600" size={16} />
                  <span className="text-xs">Compra 100% Segura</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FiAward className="text-green-600" size={16} />
                  <span className="text-xs">Garantia de 30 dias</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FiHeart className="text-green-600" size={16} />
                  <span className="text-xs">+10.000 clientes satisfeitos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-y shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <FiTruck className="text-green-600 w-8 h-8" />
              <p className="font-semibold text-sm">Frete Grátis</p>
              <p className="text-xs text-gray-600">Acima de R$ 350</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FiShield className="text-green-600 w-8 h-8" />
              <p className="font-semibold text-sm">Compra 100% Segura</p>
              <p className="text-xs text-gray-600">Seus dados protegidos</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FiCreditCard className="text-green-600 w-8 h-8" />
              <p className="font-semibold text-sm">Parcele em até 3x</p>
              <p className="text-xs text-gray-600">Sem juros no cartão</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FiAward className="text-green-600 w-8 h-8" />
              <p className="font-semibold text-sm">Garantia 30 dias</p>
              <p className="text-xs text-gray-600">Devolução grátis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Por Que Escolher Nossa Cinta Modeladora?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia e conforto que vai transformar sua silhueta e autoestima
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300"
              >
                <div className="bg-green-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Como Funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Simples, prático e eficaz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-600 to-green-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-1 bg-gradient-to-r from-green-500 to-green-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Size Guide Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left - Image */}
              <div className="order-2 lg:order-1">
                <div className="relative rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
                  <img
                    src="https://res.cloudinary.com/dnsqfrelo/image/upload/v1761678598/Captura_de_Tela_2025-10-27_a%CC%80s_12.36.39-min_jzxftd.png"
                    alt="Cinta Modeladora GreenRush"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Right - Size Guide & Features */}
              <div className="order-1 lg:order-2 space-y-6">
                {/* Size Guide */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📏 Guia de Tamanhos
                  </h2>
                  <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                            <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wide">Tamanho</th>
                            <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wide">Manequim</th>
                            <th className="px-4 py-2.5 text-left font-bold text-xs uppercase tracking-wide">Cintura</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100">
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-base text-green-700">PP</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">32-38</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">60-80cm</td>
                          </tr>
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-base text-green-700">P</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">40-42</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">81-90cm</td>
                          </tr>
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-base text-green-700">M</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">42-46</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">85-102cm</td>
                          </tr>
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-base text-green-700">G</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">48-56</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">105-133cm</td>
                          </tr>
                          <tr className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-2.5 font-bold text-base text-green-700">GG</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">Acima de 56</td>
                            <td className="px-4 py-2.5 text-sm text-gray-700">+133cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-xl p-5 text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-4 text-center">
                    USE DE 6H A 8H POR DIA
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">2 Ajustes De Compreensão</p>
                        <p className="text-green-100 text-xs">Personalize o nível de compressão ideal</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Ecopreme</p>
                        <p className="text-green-100 text-xs">Tecido sustentável e de alta qualidade</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Pastilha de Infra Vermelho e Imã</p>
                        <p className="text-green-100 text-xs">Tecnologia avançada para resultados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                        <FiCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Palheta Reformada</p>
                        <p className="text-green-100 text-xs">Design ergonômico para conforto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Videos */}
      <VideoCarousel />

      {/* Before/After Section */}
      <BeforeAfterCarousel />

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Related Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produtos Relacionados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Confira outros produtos que podem complementar sua jornada de transformação
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Community */}
      {settings.whatsappCommunityLink && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  {/* WhatsApp Icon */}
                  <div className="inline-flex bg-gradient-to-br from-green-600 to-green-500 text-white w-20 h-20 rounded-2xl items-center justify-center shadow-lg transform rotate-3">
                    <svg className="w-10 h-10 -rotate-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                      Faça Parte da Nossa{' '}
                      <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                        Comunidade
                      </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-6">
                      Junte-se a milhares de pessoas que estão transformando suas vidas todos os dias!
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        📱
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Compartilhe</p>
                        <p className="text-sm text-gray-600">Seus resultados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        💪
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Motivação</p>
                        <p className="text-sm text-gray-600">Diária e suporte</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        💡
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Dicas</p>
                        <p className="text-sm text-gray-600">E experiências</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        🎁
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Promoções</p>
                        <p className="text-sm text-gray-600">Exclusivas</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <a
                      href={settings.whatsappCommunityLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Entrar na Comunidade Agora
                    </a>
                    <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                      <span className="text-green-600">✓</span> Grátis
                      <span className="text-green-600">✓</span> Sem spam
                      <span className="text-green-600">✓</span> Sair quando quiser
                    </p>
                  </div>
                </div>

                {/* Right Image */}
                {settings.whatsappCommunityImage && (
                  <div className="relative hidden lg:flex lg:items-center lg:justify-center">
                    <div className="relative max-w-md mx-auto">
                      {/* Background decoration */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 rounded-3xl transform rotate-3"></div>

                      {/* Main image with 3D effect */}
                      <div className="relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img
                          src={settings.whatsappCommunityImage}
                          alt="Comunidade WhatsApp"
                          className="w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-2xl border-8 border-white"
                        />
                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl blur-2xl opacity-20 -z-10"></div>
                      </div>

                      {/* Floating elements */}
                      <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform rotate-12 hover:rotate-6 transition-transform z-20">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                          <span className="text-sm font-bold text-gray-900">+2.5k Membros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o produto
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  <FiChevronDown
                    className={`text-green-600 transform transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    size={24}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
