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

export const CombosLanding = () => {
  const [selectedPackage, setSelectedPackage] = useState(2); // 3 unidades como padrão (mais vendido)
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const { images: carouselImages } = useCarouselStore();
  const { videos } = useTestimonialsVideoStore();
  const { getActiveItems } = useBeforeAfterStore();
  const { settings } = useSettingsStore();

  const { getProductBySlug, getAvailableProducts, getProductsByCustomLanding } = useProductStore();

  // Buscar imagens de antes/depois e vídeos dos combos do banco de dados
  const beforeAfterImages = getActiveItems();
  const chaVideos = videos.greenrush || [];

  // Buscar produto do banco de dados
  const products = getProductsByCustomLanding("/combos");
  const product = products.length > 0 ? products[0] : null;

  // Produtos relacionados (exceto o atual)
  const relatedProducts = getAvailableProducts().filter(p => p.slug !== 'combo-emagrecimento').slice(0, 4);

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

  const testimonials = [
    {
      name: 'Maria Silva',
      location: 'São Paulo, SP',
      rating: 5,
      text: 'Perdi 8kg em 2 meses tomando o chá! Estou muito mais disposta e com menos vontade de comer doces.',
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      name: 'Ana Costa',
      location: 'Rio de Janeiro, RJ',
      rating: 5,
      text: 'Produto maravilhoso! Além de me ajudar a emagrecer, melhorou minha digestão e diminuiu o inchaço.',
      image: 'https://i.pravatar.cc/150?img=5'
    },
    {
      name: 'Juliana Santos',
      location: 'Belo Horizonte, MG',
      rating: 5,
      text: 'Estava cética no início, mas os resultados foram reais. Já indiquei para várias amigas!',
      image: 'https://i.pravatar.cc/150?img=9'
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
            size={16}
          />
        ))}
      </div>
    );
  };

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
              Por Que Escolher Nosso Chá?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma fórmula natural e eficaz que vai transformar sua rotina de emagrecimento
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

      {/* 21 Herbs Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🌿 Benefícios das 21 Ervas Naturais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma combinação poderosa de plantas medicinais selecionadas para transformar sua saúde
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Digestivos e Depurativos */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-100 hover:shadow-xl transition-all">
              <div className="bg-green-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                🍃
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digestivos e Depurativos</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Boldo</strong> – estimula a bile e auxilia na digestão de gorduras</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Carqueja</strong> – depurativa e hepatoprotetora</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Hortelã</strong> – alivia gases e cólicas</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Erva-doce</strong> – reduz inchaços e gases</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Funcho</strong> – digestivo e antiespasmódico</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span><strong>Laranja-doce</strong> – ação digestiva</span>
                </li>
              </ul>
              <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  ✅ Ajuda na digestão, alivia desconfortos abdominais e sensação de estufamento
                </p>
              </div>
            </div>

            {/* Calmantes e Relaxantes */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:shadow-xl transition-all">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                🧘
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Calmantes e Relaxantes</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-600 font-bold mt-1">•</span>
                  <span><strong>Camomila</strong> – calmante, ajuda no sono</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-600 font-bold mt-1">•</span>
                  <span><strong>Erva-cidreira</strong> – relaxante e ansiolítica natural</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-600 font-bold mt-1">•</span>
                  <span><strong>Maracujá</strong> – suaviza tensão e ansiedade</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-600 font-bold mt-1">•</span>
                  <span><strong>Jasmim</strong> – relaxante e antioxidante</span>
                </li>
              </ul>
              <div className="bg-purple-100 border-l-4 border-purple-600 p-4 rounded-lg">
                <p className="text-sm font-semibold text-purple-900">
                  ✅ Sensação de bem-estar e alívio de estresse leve
                </p>
              </div>
            </div>

            {/* Energizantes e Antioxidantes */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-100 hover:shadow-xl transition-all">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Energizantes e Antioxidantes</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 font-bold mt-1">•</span>
                  <span><strong>Chá verde/branco/preto</strong> – termogênicos e antioxidantes</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 font-bold mt-1">•</span>
                  <span><strong>Hibisco</strong> – antioxidante e diurético</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 font-bold mt-1">•</span>
                  <span><strong>Amora</strong> – boa para circulação e pele</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 font-bold mt-1">•</span>
                  <span><strong>Groselha</strong> – rica em vitamina C</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 font-bold mt-1">•</span>
                  <span><strong>Pitanga</strong> – anti-inflamatória</span>
                </li>
              </ul>
              <div className="bg-orange-100 border-l-4 border-orange-600 p-4 rounded-lg">
                <p className="text-sm font-semibold text-orange-900">
                  ✅ Acelera metabolismo e combate envelhecimento precoce
                </p>
              </div>
            </div>

            {/* Diuréticos e Desintoxicantes */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-100 hover:shadow-xl transition-all">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                💧
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Diuréticos e Desintoxicantes</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Hibisco</strong> – diurético natural</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Carqueja</strong> – elimina toxinas</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Chá verde</strong> – efeito diurético</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span><strong>Endro</strong> – para retenção de líquidos</span>
                </li>
              </ul>
              <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  ✅ Combate retenção de líquidos e aspecto "detox" corporal
                </p>
              </div>
            </div>

            {/* Adoçantes Naturais */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:shadow-xl transition-all">
              <div className="bg-pink-600 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                🌸
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Adoçantes e Aromáticos</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-pink-600 font-bold mt-1">•</span>
                  <span><strong>Anis estrelado</strong> – digestivo com aroma agradável</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-pink-600 font-bold mt-1">•</span>
                  <span><strong>Estévia</strong> – adoçante natural sem calorias</span>
                </li>
              </ul>
              <div className="bg-pink-100 border-l-4 border-pink-600 p-4 rounded-lg">
                <p className="text-sm font-semibold text-pink-900">
                  ✅ Melhora sabor e reduz necessidade de açúcar
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-500 p-8 rounded-2xl text-white hover:shadow-xl transition-all lg:col-span-1">
              <div className="bg-white text-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl">
                🌿
              </div>
              <h3 className="text-2xl font-bold mb-4">21 Ervas Poderosas</h3>
              <p className="text-green-100 mb-6 leading-relaxed">
                Uma sinergia perfeita de plantas medicinais que trabalham juntas para oferecer uma experiência completa de bem-estar, emagrecimento e saúde.
              </p>
              <div className="space-y-3">
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
                  <span className="text-sm">Sem Contraindicações Graves</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 rounded-full p-1">
                    <FiCheck className="text-white" size={16} />
                  </div>
                  <span className="text-sm">Selecionadas por Especialistas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 10.000 pessoas já transformaram suas vidas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiUsers className="text-green-600 w-8 h-8" />
                <p className="text-5xl font-bold text-gray-900">10k+</p>
              </div>
              <p className="text-gray-600 font-medium">Clientes Satisfeitos</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiTrendingUp className="text-green-600 w-8 h-8" />
                <p className="text-5xl font-bold text-gray-900">95%</p>
              </div>
              <p className="text-gray-600 font-medium">Taxa de Satisfação</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiStar className="text-yellow-400 w-8 h-8" />
                <p className="text-5xl font-bold text-gray-900">4.9</p>
              </div>
              <p className="text-gray-600 font-medium">Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      {videos.cha && videos.cha.length > 0 && (
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
              {videos.cha.map((video) => (
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

      {/* Before & After Section */}
      {beforeAfterImages.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Antes e Depois
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Veja as transformações reais de quem já usa o GreenRush Chá Natural
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {beforeAfterImages.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="relative">
                    {/* Before Image */}
                    <div className="relative">
                      <img
                        src={item.beforeImage}
                        alt="Antes"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        ANTES
                      </div>
                    </div>
                    {/* After Image */}
                    <div className="relative border-t-4 border-green-500">
                      <img
                        src={item.afterImage}
                        alt="Depois"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        DEPOIS
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  {item.description && (
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Testimonials Section - Quem Usou Amou */}
      {chaVideos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Quem Usou, Amou! ❤️
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Veja os depoimentos em vídeo de clientes reais que transformaram suas vidas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {chaVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="relative aspect-video bg-gray-100">
                    {playingVideo === video.id ? (
                      <iframe
                        src={getCleanYouTubeUrl(video.videoUrl)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="relative w-full h-full group cursor-pointer" onClick={() => setPlayingVideo(video.id)}>
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <FiPlay className="w-16 h-16 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <div className="bg-white rounded-full p-6 transform group-hover:scale-110 transition-transform shadow-2xl">
                            <FiPlay className="w-12 h-12 text-green-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{video.title}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers className="w-5 h-5" />
                      <span className="font-medium">{video.customerName}</span>
                      {video.customerLocation && (
                        <>
                          <span>•</span>
                          <span className="text-sm">{video.customerLocation}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
