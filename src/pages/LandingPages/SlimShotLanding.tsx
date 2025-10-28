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
import { useTestimonialsVideoStore } from '../../store/useTestimonialsVideoStore';
import { useBeforeAfterStore } from '../../store/useBeforeAfterStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ProductCard } from '../../components/Product/ProductCard';
import { BeforeAfterCarousel } from '../../components/BeforeAfter/BeforeAfterCarousel';
import { ReviewsSection } from '../../components/Review/ReviewsSection';

export const SlimShotLanding = () => {
  const [selectedPackage, setSelectedPackage] = useState(2); // 3 shots como padrão (mais vendido)
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { getProductBySlug, getAvailableProducts, getProductsByCustomLanding } = useProductStore();
  const { images: carouselImages } = useCarouselStore();
  const { videos } = useTestimonialsVideoStore();
  const { getActiveItems } = useBeforeAfterStore();
  const { settings } = useSettingsStore();

  // Buscar imagens de antes/depois e vídeos do SlimShot do banco de dados
  const beforeAfterImages = getActiveItems();
  const chaVideos = videos.slimshot || [];

  // Buscar produto do banco de dados
  const products = getProductsByCustomLanding("/slimshot");
  const product = products.length > 0 ? products[0] : null;

  // Produtos relacionados (exceto o atual)
  const relatedProducts = getAvailableProducts().filter(p => p.slug !== 'slimshot').slice(0, 4);

  // Pacotes de compra com descontos progressivos
  const packages = [
    {
      id: 1,
      quantity: 1,
      label: '1 Shot (1 mês de tratamento)',
      pricePerUnit: 197.00,
      total: 197.00,
      discount: 0,
      badge: null,
      badgeColor: ''
    },
    {
      id: 2,
      quantity: 3,
      label: '3 Shots (3 meses de tratamento)',
      pricePerUnit: 149.00,
      total: 447.00,
      discount: 144.00,
      badge: 'MAIS VENDIDO',
      badgeColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
    },
    {
      id: 3,
      quantity: 5,
      label: '5 Shots (5 meses de tratamento)',
      pricePerUnit: 129.40,
      total: 647.00,
      discount: 338.00,
      badge: 'MELHOR OFERTA',
      badgeColor: 'bg-gradient-to-r from-red-600 to-red-700'
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
  const productImages = carouselImages.slimshot && carouselImages.slimshot.length > 0
    ? carouselImages.slimshot
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

  // Função para limpar URL do YouTube e adicionar parâmetros
  const getCleanYouTubeUrl = (url: string) => {
    // Adiciona autoplay quando o usuário clica
    const params = new URLSearchParams({
      autoplay: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      controls: '0', // Remove controles
      fs: '0', // Remove fullscreen
      iv_load_policy: '3', // Remove anotações
      cc_load_policy: '0', // Remove legendas
      disablekb: '1', // Desabilita teclado
      playsinline: '1',
      widget_referrer: '', // Remove informações de referência
      origin: window.location.origin
    });

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  };

  const benefits = [
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: '100% Natural',
      description: 'Ingredientes naturais sem componentes sintéticos'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Emagrecimento Rápido',
      description: 'Queima de gordura acelerada e eficaz'
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Aumento da Autoestima',
      description: 'Transforme seu corpo e sua confiança'
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Sem Efeitos Colaterais',
      description: 'Seguro e bem tolerado pelo organismo'
    },
    {
      icon: <FiCheck className="w-8 h-8" />,
      title: 'Não Vicia',
      description: 'Fórmula natural sem dependência'
    },
    {
      icon: <FiDroplet className="w-8 h-8" />,
      title: 'Fácil de Ingerir',
      description: 'Apenas 5ml por dia com sabor de frutas vermelhas'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Dosagem Diária',
      description: 'Tome 5ml uma vez por dia usando a tampa dosadora'
    },
    {
      step: '2',
      title: 'Melhor Horário',
      description: 'Pode ser ingerido após café da manhã ou almoço'
    },
    {
      step: '3',
      title: 'Use Continuamente',
      description: 'Consuma durante o dia e mantenha o uso regular para melhores resultados'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo demora para ver resultados?',
      answer: 'Os resultados com o SlimShot são rápidos! Muitos clientes relatam perda de peso visível já nas primeiras semanas. Com uso contínuo, é possível eliminar até 15kg em 1 mês.'
    },
    {
      question: 'O SlimShot tem efeitos colaterais?',
      answer: 'O SlimShot é 100% natural e aprovado pela ANVISA, sem efeitos colaterais indesejados. Além disso, não causa dependência. Gestantes, lactantes e pessoas com condições médicas específicas devem consultar um médico antes.'
    },
    {
      question: 'Posso tomar com outros medicamentos?',
      answer: 'Recomendamos consultar seu médico se você faz uso de medicamentos contínuos. Em geral, o SlimShot é seguro, mas é importante validar possíveis interações.'
    },
    {
      question: 'Como devo tomar o SlimShot?',
      answer: 'Tome 5ml (uma tampa dosadora) uma vez por dia. Pode ser ingerido após o café da manhã ou almoço. Use sempre a tampa dosadora para a medida correta e mantenha o uso contínuo para melhores resultados.'
    },
    {
      question: 'Qual é o sabor do SlimShot?',
      answer: 'O SlimShot tem um delicioso sabor de frutas vermelhas, sem gosto de remédio. É muito fácil e agradável de tomar!'
    },
    {
      question: 'O SlimShot é indicado para homens e mulheres?',
      answer: 'Sim! O SlimShot é indicado tanto para homens quanto para mulheres que desejam emagrecer de forma rápida, natural e saudável.'
    },
    {
      question: 'Tem garantia?',
      answer: 'Sim! Oferecemos 30 dias de garantia. Se não ficar satisfeito com os resultados, devolvemos 100% do seu dinheiro.'
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
                  SlimShot - Vinagre de Maçã Ultra Concentrado
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  Experimente o poderoso shot ultra concentrado de vinagre de maçã com uma fórmula inovadora de 7 ativos para uma queima de gordura eficaz. O produto mais buscado para resultados rápidos.
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
              Por Que Escolher o SlimShot?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A fórmula ultra concentrada de vinagre de maçã que vai transformar seu corpo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
              >
                {/* Ícone */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {benefit.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
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

      {/* Ingredients Section */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 px-6 py-2 rounded-full mb-4">
              <span className="text-2xl">🧪</span>
              <span className="text-purple-700 font-bold text-sm">FÓRMULA CIENTÍFICA</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                7 Ingredientes Ativos Poderosos
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma fórmula inovadora com ingredientes naturais cientificamente selecionados para queima de gordura eficaz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Vinagre de Maçã */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-red-200 overflow-hidden">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                {/* Badge number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                  01
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  🍎
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">Vinagre de Maçã</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheck className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-gray-700">Queima gordura</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheck className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-gray-700">Controla açúcar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheck className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-gray-700">Acelera metabolismo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Café Verde */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">02</div>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">☕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Café Verde</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-green-600 flex-shrink-0" size={16} /><span className="text-gray-700">Queima gordura</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-green-600 flex-shrink-0" size={16} /><span className="text-gray-700">Aumenta energia</span></div>
                </div>
              </div>
            </div>

            {/* Laranja Moro */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">03</div>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">🍊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Laranja Moro</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-orange-600 flex-shrink-0" size={16} /><span className="text-gray-700">Reduz gordura</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-orange-600 flex-shrink-0" size={16} /><span className="text-gray-700">Regula metabolismo</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-orange-600 flex-shrink-0" size={16} /><span className="text-gray-700">Aumenta saciedade</span></div>
                </div>
              </div>
            </div>

            {/* Colágeno */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-pink-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">04</div>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">💪</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">Colágeno</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-pink-600 flex-shrink-0" size={16} /><span className="text-gray-700">Fortalece saúde</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-pink-600 flex-shrink-0" size={16} /><span className="text-gray-700">Melhora pele</span></div>
                </div>
              </div>
            </div>

            {/* L-Carnitina */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">05</div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">🔥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">L-Carnitina</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-purple-600 flex-shrink-0" size={16} /><span className="text-gray-700">Queima gordura</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-purple-600 flex-shrink-0" size={16} /><span className="text-gray-700">Aumenta resistência</span></div>
                </div>
              </div>
            </div>

            {/* Canela em Pó */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-amber-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">06</div>
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">🌿</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Canela em Pó</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-amber-600 flex-shrink-0" size={16} /><span className="text-gray-700">Estabiliza açúcar</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-amber-600 flex-shrink-0" size={16} /><span className="text-gray-700">Acelera metabolismo</span></div>
                </div>
              </div>
            </div>

            {/* Picolinato de Cromo */}
            <div className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">07</div>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">⚗️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Picolinato de Cromo</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-blue-600 flex-shrink-0" size={16} /><span className="text-gray-700">Controla apetite</span></div>
                  <div className="flex items-center gap-2 text-sm"><FiCheck className="text-blue-600 flex-shrink-0" size={16} /><span className="text-gray-700">Regula glicose</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-8 rounded-2xl text-white shadow-xl">
              <div className="flex items-start gap-6">
                <div className="bg-white text-orange-600 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                  🍎
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">Fórmula Ultra Concentrada de 7 Ativos</h3>
                  <p className="text-orange-100 mb-6 leading-relaxed">
                    Cada ingrediente foi selecionado para trabalhar em sinergia, oferecendo uma queima de gordura eficaz e resultados rápidos. O produto mais buscado para transformação corporal.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 rounded-full p-1">
                        <FiCheck className="text-white" size={16} />
                      </div>
                      <span className="text-sm">100% Natural</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 rounded-full p-1">
                        <FiCheck className="text-white" size={16} />
                      </div>
                      <span className="text-sm">Aprovado pela ANVISA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 rounded-full p-1">
                        <FiCheck className="text-white" size={16} />
                      </div>
                      <span className="text-sm">Sabor Frutas Vermelhas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section - Resultados Reais */}
      <BeforeAfterCarousel />

      {/* Customer Reviews - O Que Nossos Clientes Dizem */}
      <ReviewsSection />

      {/* Video Testimonials */}
      {videos.slimshot && videos.slimshot.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Veja Depoimentos Reais
              </h2>
              <p className="text-xl text-gray-600">
                Pessoas reais compartilhando suas experiências transformadoras
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {videos.slimshot.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {/* Video */}
                  <div className="relative bg-gray-900 aspect-[9/16] group overflow-hidden">
                    {video.videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      // Vídeo direto - mostra frame como thumbnail
                      <div className="relative w-full h-full">
                        <video
                          src={video.videoUrl}
                          poster={video.thumbnailUrl}
                          className="w-full h-full object-cover"
                          controls={playingVideo === video.id}
                          autoPlay={playingVideo === video.id}
                          playsInline
                          loop
                          preload="metadata"
                        />
                        {playingVideo !== video.id && (
                          <>
                            {/* Overlay escuro */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all pointer-events-none"></div>
                            {/* Botão de play */}
                            <div
                              className="absolute inset-0 flex items-center justify-center cursor-pointer"
                              onClick={() => setPlayingVideo(video.id)}
                            >
                              <div className="bg-green-600 hover:bg-green-700 text-white rounded-full p-6 transform group-hover:scale-110 transition-all shadow-2xl">
                                <FiPlay size={40} className="ml-1" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : playingVideo === video.id ? (
                      // Iframe (YouTube, Vimeo, etc) - só carrega ao clicar
                      <div className="relative w-full h-full overflow-hidden">
                        <iframe
                          src={getCleanYouTubeUrl(video.videoUrl)}
                          title={video.title}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] pointer-events-auto"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen={false}
                          style={{ border: 'none' }}
                        ></iframe>
                      </div>
                    ) : (
                      // Thumbnail para YouTube/outros
                      <div
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => setPlayingVideo(video.id)}
                      >
                        <img
                          src={video.thumbnailUrl || 'https://via.placeholder.com/640x360/1a1a1a/ffffff?text=Video'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay escuro */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                        {/* Botão de play */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-green-600 hover:bg-green-700 text-white rounded-full p-6 transform group-hover:scale-110 transition-all shadow-2xl">
                            <FiPlay size={40} className="ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers size={16} />
                      <p className="text-sm">
                        <span className="font-semibold">{video.customerName}</span>
                        {video.customerLocation && (
                          <span className="text-gray-500"> • {video.customerLocation}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
