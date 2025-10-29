import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useBeforeAfterStore } from '../../store/useBeforeAfterStore';

interface BeforeAfterItemProps {
  item: {
    id: string;
    title: string;
    beforeImage: string;
    afterImage: string;
    description?: string;
  };
}

// Helper para otimizar imagens do Cloudinary
const optimizeCloudinaryImage = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Adicionar transformações: WebP, resize, qualidade 85
  const transformations = 'w_600,h_800,q_85,f_webp';

  // Inserir transformações na URL do Cloudinary
  return url.replace('/upload/', `/upload/${transformations}/`);
};

const BeforeAfterItem = ({ item }: BeforeAfterItemProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="flex flex-col">
      {/* Before/After Comparison */}
      <div
        className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-xl cursor-ew-resize select-none max-h-[400px]"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <img
            src={optimizeCloudinaryImage(item.afterImage)}
            alt={`${item.title} - Depois`}
            width="600"
            height="800"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            DEPOIS
          </div>
        </div>

        {/* Before Image (Overlay with clip) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={optimizeCloudinaryImage(item.beforeImage)}
            alt={`${item.title} - Antes`}
            width="600"
            height="800"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ANTES
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
            <div className="flex gap-0.5">
              <FiChevronLeft className="text-gray-700" size={14} />
              <FiChevronRight className="text-gray-700" size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Item Info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
      </div>
    </div>
  );
};

export const BeforeAfterCarousel = () => {
  const { getActiveItems } = useBeforeAfterStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const items = getActiveItems();

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Reset page when changing between mobile/desktop
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  if (items.length === 0) {
    return null;
  }

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resultados <span className="text-primary-green">Reais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veja as transformações incríveis dos nossos clientes
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-sm md:max-w-none mx-auto">
            {currentItems.map((item) => (
              <BeforeAfterItem key={item.id} item={item} />
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 md:left-0 top-1/2 transform -translate-y-1/2 md:-translate-x-12 bg-white text-gray-900 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-10"
                aria-label="Anterior"
              >
                <FiChevronLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-0 top-1/2 transform -translate-y-1/2 md:translate-x-12 bg-white text-gray-900 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-10"
                aria-label="Próximo"
              >
                <FiChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-primary-green w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para página ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
