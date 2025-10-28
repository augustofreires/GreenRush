import { useState } from 'react';
import { FiStar, FiCheck, FiX, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { ReviewResponse } from '../../services/reviewAPI';
import { useProductStore } from '../../store/useProductStore';

interface ReviewCardProps {
  review: ReviewResponse;
  showProductName?: boolean;
}

export const ReviewCard = ({ review, showProductName = false }: ReviewCardProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const { products } = useProductStore();

  const product = products.find(p => p.id === review.product_id);

  // Criar array de todas as mídias (imagens + vídeo) com verificação de segurança
  const allMedia = [
    ...(Array.isArray(review.images) ? review.images.map(img => ({ type: 'image' as const, url: img })) : []),
    ...(review.videoUrl ? [{ type: 'video' as const, url: review.videoUrl }] : [])
  ];

  const openGallery = (index: number) => {
    setCurrentMediaIndex(index);
    setGalleryOpen(true);
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={12}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-900">{review.user_name}</h4>
            {review.is_verified_purchase && (
              <span className="flex items-center gap-0.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                <FiCheck size={10} />
                Verificada
              </span>
            )}
          </div>
          {renderStars(review.rating)}
        </div>
        <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-medium text-sm text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Comment */}
      <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-4">{review.comment}</p>

      {/* Images and Video */}
      {allMedia.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {allMedia.map((media, index) => (
            <div
              key={index}
              className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 relative group"
              onClick={() => openGallery(index)}
              style={media.type === 'video' ? { backgroundColor: '#1a1a1a' } : {}}
            >
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={`Review ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    src={`${media.url}#t=0.1`}
                    className="w-full h-full object-cover opacity-70"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-1.5 group-hover:bg-opacity-100 transition-all">
                      <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product Name (shown on Home) - moved to bottom */}
      {showProductName && product && Array.isArray(product.images) && product.images.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-8 h-8 object-cover rounded border border-gray-200"
          />
          <span className="text-xs font-medium text-gray-600">{product.name}</span>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryOpen && allMedia.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={() => setGalleryOpen(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2 z-10"
            >
              <FiX size={24} />
            </button>

            {/* Previous Button */}
            {allMedia.length > 1 && (
              <button
                onClick={prevMedia}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 z-10"
              >
                <FiChevronLeft size={32} />
              </button>
            )}

            {/* Media Content */}
            <div className="flex items-center justify-center p-4 max-w-full max-h-full">
              {allMedia[currentMediaIndex].type === 'image' ? (
                <img
                  src={allMedia[currentMediaIndex].url}
                  alt="Review"
                  className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                />
              ) : (
                <video
                  src={allMedia[currentMediaIndex].url}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-[90vw] rounded-lg"
                  style={{ width: 'auto', height: 'auto' }}
                />
              )}
            </div>

            {/* Next Button */}
            {allMedia.length > 1 && (
              <button
                onClick={nextMedia}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3 z-10"
              >
                <FiChevronRight size={32} />
              </button>
            )}

            {/* Counter */}
            {allMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                {currentMediaIndex + 1} / {allMedia.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
