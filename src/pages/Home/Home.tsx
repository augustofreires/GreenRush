import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/Product/ProductCard';
import { VideoCarousel } from '../../components/Testimonials/VideoCarousel';
import { BeforeAfterCarousel } from '../../components/BeforeAfter/BeforeAfterCarousel';
import { ReviewsSection } from '../../components/Review/ReviewsSection';
import { FiArrowRight, FiShield, FiCreditCard, FiPackage, FiTag, FiCheck } from 'react-icons/fi';
import { useBannerStore } from '../../store/useBannerStore';
import { useProductStore } from '../../store/useProductStore';
import { useBlogStore } from '../../store/useBlogStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const Home = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannersLoaded, setBannersLoaded] = useState(false);
  const { getActiveBanners, setBanners } = useBannerStore();
  const { getAvailableProducts } = useProductStore();
  const { getPublishedPosts, loadPosts } = useBlogStore();
  const { getActiveCategories, fetchCategories } = useCategoryStore();
  const { settings, fetchSettings } = useSettingsStore();
  const activeBanners = getActiveBanners() || [];
  const activeCategories = getActiveCategories() || [];

  // Carregar categorias da API
  useEffect(() => {
    loadPosts();
    fetchSettings();
    fetchCategories();
  }, [loadPosts, fetchCategories, fetchSettings]);

  // Carregar banners da API
  useEffect(() => {
    fetchSettings();
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/banners`);
        const data = await response.json();

        console.log('Banners carregados da API:', data);

        // Converter formato da API para o store
        const formattedBanners = Array.isArray(data) ? data.map((banner: any) => ({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          mobileImage: banner.mobile_image,
          link: banner.link,
          buttonText: banner.button_text,
          order: banner.position,
          active: Boolean(banner.is_active)
        })) : [];

        console.log('Banners formatados:', formattedBanners);
        setBanners(formattedBanners);
        setBannersLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar banners:', error);
        setBannersLoaded(true);
      }
    };

    fetchBanners();
  }, []);

  // Get featured and combo products (only with stock)
  const availableProducts = getAvailableProducts() || [];
  const featuredProducts = Array.isArray(availableProducts) ? availableProducts.slice(0, 4) : [];
  const combos = Array.isArray(availableProducts) ? availableProducts.filter(p => p.badge === 'combo').slice(0, 4) : [];

  // Get latest blog posts
  const allPosts = getPublishedPosts() || [];
  const latestPosts = Array.isArray(allPosts) ? allPosts.slice(0, 3) : [];

  // Auto-rotate banners
  useEffect(() => {
    fetchSettings();
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentBannerIndex];

  // Helper functions for blog
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Só renderizar quando os banners estiverem carregados
  if (!bannersLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero/Banner Section */}
      {activeBanners.length > 0 && currentBanner ? (
        <section className="relative h-[650px] md:h-[500px] overflow-hidden bg-gray-100 w-full">
          {/* Mobile Image */}
          {currentBanner.mobileImage && (
            <img
              src={currentBanner.mobileImage}
              alt={currentBanner.title}
              width="800"
              height="1200"
              fetchPriority="high"
              className="md:hidden absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000"
            />
          )}
          {/* Desktop Image */}
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            width="1920"
            height="600"
            fetchPriority="high"
            className={`${currentBanner.mobileImage ? 'hidden md:block' : ''} absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000`}
          />

          {/* Banner Indicators */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentBannerIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="bg-gradient-to-r from-primary-green to-primary-green-dark text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transforme Sua Beleza e Saúde
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Produtos premium para cabelos, saúde e bem-estar. Resultados comprovados!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/produtos" className="bg-white text-primary-green px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Ver Produtos
                </Link>
                <Link to="/desafio" className="bg-accent-lime text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                  Desafio 90 Dias
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Frete Grátis */}
            <div className="bg-white rounded-lg p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <FiPackage style={{ color: '#4a9d4e' }} size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-0.5">Frete Grátis</h3>
                <p className="text-xs text-gray-600">Pra qualquer lugar do Brasil</p>
              </div>
            </div>

            {/* Cupom */}
            <div className="bg-white rounded-lg p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <FiTag style={{ color: '#4a9d4e' }} size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-0.5">Cupom: BEMVINDO10</h3>
                <p className="text-xs text-gray-600">Para 10% de desconto na primeira compra</p>
              </div>
            </div>

            {/* Parcele */}
            <div className="bg-white rounded-lg p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <FiCreditCard style={{ color: '#4a9d4e' }} size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-0.5">Parcele em até</h3>
                <p className="text-xs text-gray-600">3x sem juros</p>
              </div>
            </div>

            {/* 100% Seguro */}
            <div className="bg-white rounded-lg p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <FiShield style={{ color: '#4a9d4e' }} size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-0.5">100% Seguro</h3>
                <p className="text-xs text-gray-600">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Compre por Objetivo</h2>
          
          {/* Mobile: Grid 2 colunas normal */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {Array.isArray(activeCategories) && activeCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/${category.slug}`}
                className={`relative overflow-hidden bg-gradient-to-br ${category.color} text-white rounded-lg p-4 hover:shadow-xl transition-all hover:scale-105 group min-h-[160px] flex items-end`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity"
                  style={{ 
                    backgroundImage: `url(${category.image})`,
                    opacity: category.showOverlay === false ? 1 : 0.2
                  }}
                />
                {category.showOverlay !== false && (
                  <div className="absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition-opacity" />
                )}
                <div className="relative z-10 w-full">
                  <h3 className="text-base font-bold mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs opacity-90 mb-2 line-clamp-2">{category.description}</p>
                  )}
                  <p className="flex items-center gap-1 text-xs font-semibold">
                    Ver produtos <FiArrowRight size={14} />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Grid assimétrico */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4">
            {/* Card Grande Esquerdo */}
            {Array.isArray(activeCategories) && activeCategories[0] && (
              <Link
                to={`/${activeCategories[0].slug}`}
                className={`relative overflow-hidden bg-gradient-to-br ${activeCategories[0].color} text-white rounded-lg p-6 hover:shadow-xl transition-all hover:scale-105 group row-span-2 min-h-[400px] flex items-end`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity"
                  style={{ 
                    backgroundImage: `url(${activeCategories[0].image})`,
                    opacity: activeCategories[0].showOverlay === false ? 1 : 0.2
                  }}
                />
                {activeCategories[0].showOverlay !== false && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${activeCategories[0].color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                )}
                <div className="relative z-10 w-full">
                  <h3 className="text-3xl font-bold mb-2">{activeCategories[0].name}</h3>
                  {activeCategories[0].description && (
                    <p className="text-base opacity-90 mb-3 line-clamp-3">
                      {activeCategories[0].description}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    Ver produtos <FiArrowRight size={16} />
                  </p>
                </div>
              </Link>
            )}

            {/* Lado Direito */}
            <div className="flex flex-col gap-4">
              {/* Card Superior Direito */}
              {Array.isArray(activeCategories) && activeCategories[1] && (
                <Link
                  to={`/${activeCategories[1].slug}`}
                  className={`relative overflow-hidden bg-gradient-to-br ${activeCategories[1].color} text-white rounded-lg p-6 hover:shadow-xl transition-all hover:scale-105 group min-h-[192px] flex items-end`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity"
                    style={{ 
                      backgroundImage: `url(${activeCategories[1].image})`,
                      opacity: activeCategories[1].showOverlay === false ? 1 : 0.2
                    }}
                  />
                  {activeCategories[1].showOverlay !== false && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${activeCategories[1].color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                  )}
                  <div className="relative z-10 w-full">
                    <h3 className="text-xl font-bold mb-2">{activeCategories[1].name}</h3>
                    {activeCategories[1].description && (
                      <p className="text-sm opacity-90 mb-3 line-clamp-2">
                        {activeCategories[1].description}
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      Ver produtos <FiArrowRight size={16} />
                    </p>
                  </div>
                </Link>
              )}

              {/* Cards Inferiores Direito (2 lado a lado) */}
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(activeCategories) && activeCategories.slice(2, 4).map((category) => (
                  <Link
                    key={category.slug}
                    to={`/${category.slug}`}
                    className={`relative overflow-hidden bg-gradient-to-br ${category.color} text-white rounded-lg p-6 hover:shadow-xl transition-all hover:scale-105 group min-h-[192px] flex items-end`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-opacity"
                      style={{ 
                        backgroundImage: `url(${category.image})`,
                        opacity: category.showOverlay === false ? 1 : 0.2
                      }}
                    />
                    {category.showOverlay !== false && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                    )}
                    <div className="relative z-10 w-full">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm opacity-90 mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        Ver produtos <FiArrowRight size={16} />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
            <Link
              to="/produtos"
              className="text-primary-green hover:text-primary-blue transition-colors flex items-center gap-2"
            >
              Ver todos <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(featuredProducts) && featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Videos */}
      <VideoCarousel />

      {/* Combos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Combos Especiais</h2>
            <Link
              to="/produtos"
              className="text-primary-green hover:text-primary-blue transition-colors flex items-center gap-2"
            >
              Ver todos <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(combos) && combos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <BeforeAfterCarousel />

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Blog Preview */}
      <section className="py-12 px-4" style={{ background: 'linear-gradient(to bottom, #f8fdf9, #ffffff)' }}>
        <div className="container mx-auto max-w-7xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">BLOG DA GREENRUSH</h2>
            <p className="text-sm text-gray-600">Últimas dicas sobre emagrecimento, saúde e bem-estar</p>
          </div>

          {/* Cards Grid */}
          <div className="flex flex-wrap gap-5 mb-6 max-w-6xl mx-auto justify-center">
            {Array.isArray(latestPosts) && latestPosts.slice(0, 4).map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-full sm:w-[calc(50%-10px)] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
              >
                {/* Image */}
                <Link to={`/blog/${post.slug}`} className="relative block overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold text-white rounded-full shadow-lg" style={{ backgroundColor: '#4a9d4e' }}>
                      {post.category}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3.5">
                  {/* Date */}
                  <p className="text-[10px] font-normal text-gray-400 mb-1.5 uppercase tracking-wide">
                    {formatDate(post.publishedAt)}
                  </p>

                  {/* Title */}
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4a9d4e] transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-xs mb-2.5 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-xs group/link"
                    style={{ color: '#4a9d4e' }}
                  >
                    Ler mais
                    <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm"
              style={{ backgroundColor: '#4a9d4e' }}
            >
              Ver todos os artigos <FiArrowRight size={16} />
            </Link>
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
    </div>
  );
};
