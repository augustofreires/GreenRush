import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { reviewAPI, type ReviewResponse } from '../../services/reviewAPI';
import { ReviewCard } from './ReviewCard';

export const ReviewsSection = () => {
  const [allReviews, setAllReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getAllReviews('approved');
      setAllReviews(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleReviews = allReviews.slice(0, visibleCount);
  const hasMore = allReviews.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleShowLess = () => {
    setVisibleCount(3);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando avaliações...</p>
          </div>
        </div>
      </section>
    );
  }

  if (allReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FiStar className="fill-yellow-400 text-yellow-400" size={32} />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              O Que Nossos Clientes Dizem
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Avaliações reais de quem já experimentou nossos produtos
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} showProductName={true} />
          ))}
        </div>

        {/* Load More / Show Less Buttons */}
        <div className="text-center mt-10 space-x-4">
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="btn-green"
            >
              Ver Mais Avaliações ({allReviews.length - visibleCount} restantes)
            </button>
          )}
          {visibleCount > 3 && (
            <button
              onClick={handleShowLess}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Ver Menos
            </button>
          )}
        </div>

        {/* Total Count */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Exibindo {visibleReviews.length} de {allReviews.length} avaliações
          </p>
        </div>
      </div>
    </section>
  );
};
