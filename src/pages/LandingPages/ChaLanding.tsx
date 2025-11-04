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
import { getDeliveryDateRange } from '../../utils/dateUtils';

export const ChaLanding = () => {
  const [selectedPackage, setSelectedPackage] = useState(2); // 3 unidades como padrão (mais vendido)
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const { getProductBySlug, getAvailableProducts, getProductsByCustomLanding } = useProductStore();
  const { images: carouselImages } = useCarouselStore();
  const { settings, fetchSettings } = useSettingsStore();
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);


  // Buscar produto do banco de dados
  const products = getProductsByCustomLanding("/cha");
  const product = products.length > 0 ? products[0] : null;

  // Produtos relacionados (exceto o atual)
  const relatedProducts = getAvailableProducts().filter(p => p.slug !== 'cha-natural').slice(0, 4);

  // Prazo de entrega dinâmico
  const deliveryDates = getDeliveryDateRange();
  // Pacotes de compra com descontos progressivos
  const packages = [
    {
      id: 1,
      quantity: 1,
      label: '1 Unidade',
      pricePerUnit: product?.price || 0,
      total: product?.price || 0,
      discount: 0,
      badge: null,
      badgeColor: ''
    },
    {
      id: 2,
      quantity: 3,
      label: '3 Unidades',
      pricePerUnit: ((product?.price || 0) * 0.85), // 15% desconto
      total: ((product?.price || 0) * 0.85 * 3),
      discount: ((product?.price || 0) * 3) - ((product?.price || 0) * 0.85 * 3),
      badge: 'MAIS VENDIDO',
      badgeColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      id: 3,
      quantity: 5,
      label: '5 Unidades',
      pricePerUnit: ((product?.price || 0) * 0.75), // 25% desconto
      total: ((product?.price || 0) * 0.75 * 5),
      discount: ((product?.price || 0) * 5) - ((product?.price || 0) * 0.75 * 5),
      badge: 'MELHOR OFERTA',
      badgeColor: 'bg-gradient-to-r from-green-600 to-green-700'
    }
  ];

  const handleAddToCart = () => {
    if (product) {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      addItem(product, selectedPkg?.quantity || 1);
    }
  };

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);

  // Imagens para o carrossel - usar da store de carrossel
  const productImages = carouselImages.cha && carouselImages.cha.length > 0
    ? carouselImages.cha
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
      title: 'Acelera o Metabolismo',
      description: 'Ajuda seu corpo a queimar calorias de forma mais eficiente'
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: 'Controle de Apetite',
      description: 'Reduz a sensação de fome e controla a compulsão alimentar'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Mais Energia',
      description: 'Proporciona energia natural durante todo o dia'
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: '100% Natural',
      description: 'Fórmula natural com ingredientes selecionados'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Prepare seu Chá',
      description: 'Adicione uma colher em água quente e deixe em infusão por 3-5 minutos'
    },
    {
      step: '2',
      title: 'Tome 2x ao Dia',
      description: 'Consuma pela manhã e no início da tarde para melhores resultados'
    },
    {
      step: '3',
      title: 'Veja Resultados',
      description: 'Em 30 dias você já vai sentir a diferença no seu corpo e disposição'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo demora para ver resultados?',
      answer: 'Os primeiros resultados podem ser notados já nas primeiras semanas, com mais disposição e redução do inchaço. Resultados mais significativos de emagrecimento são visíveis após 30 dias de uso contínuo.'
    },
    {
      question: 'O chá tem efeitos colaterais?',
      answer: 'Nosso chá é 100% natural e não possui efeitos colaterais quando consumido conforme as orientações. No entanto, gestantes, lactantes e pessoas com condições médicas específicas devem consultar um médico antes.'
    },
    {
      question: 'Posso tomar com outros medicamentos?',
      answer: 'Recomendamos consultar seu médico se você faz uso de medicamentos contínuos. Em geral, o chá é seguro, mas é importante validar possíveis interações.'
    },
    {
      question: 'Quantas xícaras devo tomar por dia?',
      answer: 'Recomendamos 2 xícaras por dia: uma pela manhã e outra no início da tarde. Evite consumir próximo ao horário de dormir.'
    },
    {
      question: 'Tem garantia?',
      answer: 'Sim! Oferecemos 30 dias de garantia. Se não ficar satisfeito, devolvemos seu dinheiro.'
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
                  Greenrush Chá
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  O chá emagrecedor que acelera seu metabolismo e ajuda você a perder peso de forma saudável. Fórmula natural com ingredientes selecionados.
                </p>
              </div>

              {/* Preços */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
                <p className="text-gray-400 line-through text-base mb-1">
                  De R$ {(selectedPkg?.total ? selectedPkg.total * 1.4 : product?.originalPrice || 0).toFixed(2)}
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    R$ {selectedPkg?.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  ou 12x de <span className="font-semibold text-gray-900">R$ {((selectedPkg?.total || 0) / 12).toFixed(2)}</span> sem juros
                </p>
              </div>

              {/* Badges de Benefícios */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  <FiCreditCard size={16} />
                  5% OFF no pix
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  <FiTruck size={16} />
                  Envio em até 24h
                </div>
              </div>

              {/* Package Options */}
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-gray-900 bg-gradient-to-br from-gray-50 to-white shadow-lg ring-2 ring-gray-200'
                        : 'border-gray-200 hover:border-gray-400 bg-white hover:shadow-md'
                    }`}
                  >
                    {/* Badge mais vendido */}
                    {pkg.badge && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <FiStar className="fill-white" size={12} />
                        {pkg.badge}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {/* Radio Button */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPackage === pkg.id
                          ? 'border-gray-900 bg-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedPackage === pkg.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                        )}
                      </div>

                      {/* Package Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-bold text-gray-900 text-base">{pkg.label}</p>
                            {pkg.discount > 0 && (
                              <p className="text-sm text-gray-600 mt-0.5">
                                {pkg.quantity === 3 && '🎁 + Brinde grátis'}
                                {pkg.quantity === 5 && '📚 + E-book grátis'}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              R$ {pkg.pricePerUnit.toFixed(2)} <span className="text-xs font-normal text-gray-500">/ un</span>
                            </p>
                            {pkg.discount > 0 && (
                              <p className="text-green-600 font-semibold text-sm mt-0.5">
                                -R$ {pkg.discount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-800 hover:to-gray-700 transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-3"
              >
                <FiShoppingCart size={22} />
                Adicionar ao Carrinho
              </button>

              {/* Informação de Entrega */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FiTruck className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-blue-900 font-semibold text-sm">
                      Chegará entre {deliveryDates.formatted}
                    </p>
                    <p className="text-blue-700 text-xs mt-0.5">
                      Confirme o prazo de entrega antes de finalizar o pedido
                    </p>
                  </div>
                </div>
              </div>

              {/* Garantias */}
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FiShield className="text-blue-600" size={16} />
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

      {/* Trust Bar - Modernizado */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Frete Grátis */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <FiTruck className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Frete Grátis</p>
                  <p className="text-xs text-gray-600">Acima de R$ 350</p>
                </div>
              </div>
            </div>

            {/* Compra Segura */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <FiShield className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Compra 100% Segura</p>
                  <p className="text-xs text-gray-600">Seus dados protegidos</p>
                </div>
              </div>
            </div>

            {/* Parcelamento */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <FiCreditCard className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Parcele em até 12x</p>
                  <p className="text-xs text-gray-600">Sem juros no cartão</p>
                </div>
              </div>
            </div>

            {/* Garantia */}
            <div className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <FiAward className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Garantia 30 dias</p>
                  <p className="text-xs text-gray-600">Devolução grátis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Modernizado */}
      <section id="benefits" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Por Que Escolher Nosso Chá?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma fórmula natural e eficaz que vai transformar sua rotina
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Modernizado */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Como Funciona?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              Simples, prático e eficaz
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector for desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-green-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 21 Herbs Benefits - Modernizado */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              🌿 21 Ervas Naturais
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma combinação poderosa de plantas medicinais selecionadas
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Digestivos */}
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl shadow-lg">
                  🍃
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Digestivos e Depurativos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Boldo</p>
                  <p className="text-sm text-gray-600">Estimula a bile e digestão de gorduras</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Carqueja</p>
                  <p className="text-sm text-gray-600">Depurativa e hepatoprotetora</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Hortelã</p>
                  <p className="text-sm text-gray-600">Alivia gases e cólicas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Erva-doce</p>
                  <p className="text-sm text-gray-600">Reduz inchaços e gases</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Funcho</p>
                  <p className="text-sm text-gray-600">Digestivo e antiespasmódico</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Laranja-doce</p>
                  <p className="text-sm text-gray-600">Ação digestiva</p>
                </div>
              </div>
            </div>

            {/* Calmantes */}
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                  🧘
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Calmantes e Relaxantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Camomila</p>
                  <p className="text-sm text-gray-600">Calmante, ajuda no sono</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Erva-cidreira</p>
                  <p className="text-sm text-gray-600">Relaxante e ansiolítica natural</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Maracujá</p>
                  <p className="text-sm text-gray-600">Suaviza tensão e ansiedade</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Jasmim</p>
                  <p className="text-sm text-gray-600">Relaxante e antioxidante</p>
                </div>
              </div>
            </div>

            {/* Energizantes */}
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg">
                  ⚡
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Energizantes e Antioxidantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Chá verde/branco/preto</p>
                  <p className="text-sm text-gray-600">Termogênicos e antioxidantes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Hibisco</p>
                  <p className="text-sm text-gray-600">Antioxidante e diurético</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Amora</p>
                  <p className="text-sm text-gray-600">Boa para circulação e pele</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Groselha</p>
                  <p className="text-sm text-gray-600">Rica em vitamina C</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Pitanga</p>
                  <p className="text-sm text-gray-600">Anti-inflamatória</p>
                </div>
              </div>
            </div>

            {/* Diuréticos */}
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
                  💧
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Diuréticos e Desintoxicantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Hibisco</p>
                  <p className="text-sm text-gray-600">Diurético natural</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Carqueja</p>
                  <p className="text-sm text-gray-600">Elimina toxinas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Chá verde</p>
                  <p className="text-sm text-gray-600">Efeito diurético</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Endro</p>
                  <p className="text-sm text-gray-600">Para retenção de líquidos</p>
                </div>
              </div>
            </div>

            {/* Adoçantes */}
            <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
                  🌸
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Adoçantes e Aromáticos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-pink-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Anis estrelado</p>
                  <p className="text-sm text-gray-600">Digestivo com aroma agradável</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-pink-50 transition-colors">
                  <p className="text-lg text-gray-900 font-semibold mb-1">Estévia</p>
                  <p className="text-sm text-gray-600">Adoçante natural sem calorias</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-xl text-white">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl flex-shrink-0">
                  🌿
                </div>
                <div>
                  <h4 className="text-3xl font-bold mb-4">21 Ervas Poderosas</h4>
                  <p className="text-lg text-green-50 mb-6 leading-relaxed">
                    Uma sinergia perfeita de plantas medicinais que trabalham juntas para oferecer bem-estar, emagrecimento e saúde.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">✓ 100% Natural</span>
                    <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">✓ Sem Contraindicações Graves</span>
                    <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-sm font-semibold">✓ Selecionadas por Especialistas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Carousel - Igual da Home */}
      <BeforeAfterCarousel />

      {/* Video Testimonials - Apenas vídeos do chá */}
      <VideoCarousel productFilter="cha" />

      {/* Reviews Section - Igual da Home */}
      <ReviewsSection />

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
