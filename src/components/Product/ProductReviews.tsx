import { FiStar, FiCheckCircle } from 'react-icons/fi';
import type { ProductReview } from '../../types';

interface ProductReviewsProps {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
}

export const ProductReviews = ({ reviews, averageRating, totalReviews }: ProductReviewsProps) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Avaliações de Clientes</h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center my-2">{renderStars(Math.round(averageRating))}</div>
            <div className="text-sm text-gray-600">{totalReviews} avaliações</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{review.author}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <FiCheckCircle className="w-3 h-3" />
                      Compra verificada
                    </span>
                  )}
                </div>
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Foto ${index + 1} de ${review.author}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
