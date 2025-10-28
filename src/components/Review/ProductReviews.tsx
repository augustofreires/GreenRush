import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { reviewAPI, type ReviewResponse } from '../../services/reviewAPI';
import { ReviewCard } from './ReviewCard';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [stats, setStats] = useState({ total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        reviewAPI.getProductReviews(productId, 'approved'),
        reviewAPI.getProductStats(productId)
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = reviews.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleShowLess = () => {
    setVisibleCount(3);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando avaliações...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <FiStar className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Seja o primeiro a avaliar!
        </h3>
        <p className="text-gray-600">
          Comprou este produto? Conte sua experiência para outros clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Rating Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.average_rating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={20}
                  className={
                    star <= Math.round(stats.average_rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {rating} <FiStar className="inline" size={12} />
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Avaliações de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      {/* Load More / Show Less Buttons */}
      <div className="text-center space-x-4">
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="btn-green"
          >
            Ver Mais Avaliações ({reviews.length - visibleCount} restantes)
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
    </div>
  );
};
