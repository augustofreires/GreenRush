import { useState } from 'react';
import { FiStar, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { reviewAPI } from '../../services/reviewAPI';

interface ReviewFormProps {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, userId, userName, userEmail, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 3 - imageFiles.length);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0 || comment.trim() === '') {
      alert('Por favor, preencha a avaliação e selecione uma nota!');
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewAPI.createReview({
        productId,
        userId,
        userName,
        userEmail,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        isVerifiedPurchase: true,
        images: imageFiles.length > 0 ? imageFiles : undefined,
        video: videoFile || undefined,
      });

      // Limpar previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview('');
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center">
            <FiCheck size={32} />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Avaliação Enviada!</h3>
        <p className="text-green-700">
          Obrigado pelo seu feedback! Sua avaliação será analisada e publicada em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-2xl font-bold mb-6">Avaliar este produto</h3>

      {/* Rating Stars */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua nota *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <FiStar
                size={32}
                className={
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-gray-700 font-medium">
              {rating === 1 && 'Muito Ruim'}
              {rating === 2 && 'Ruim'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bom'}
              {rating === 5 && 'Excelente'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título da avaliação (opcional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Produto incrível!"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua avaliação *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sobre sua experiência com o produto..."
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
          maxLength={1000}
          required
        />
        <p className="text-sm text-gray-500 mt-1">{comment.length}/1000 caracteres</p>
      </div>

      {/* Images Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar fotos (opcional)
        </label>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Upload ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
          {imageFiles.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-green transition-colors">
              <FiUpload className="text-gray-400" size={24} />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Máximo 3 fotos</p>
      </div>

      {/* Video Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar vídeo (opcional)
        </label>
        {videoPreview ? (
          <div className="relative">
            <video src={videoPreview} controls className="w-full max-h-64 rounded-lg" />
            <button
              type="button"
              onClick={removeVideo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-primary-green transition-colors">
            <FiUpload className="text-gray-400 mb-2" size={32} />
            <span className="text-gray-600">Clique para fazer upload do vídeo</span>
            <span className="text-xs text-gray-500 mt-1">Máx: 50MB</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={rating === 0 || comment.trim() === '' || isSubmitting}
        className="w-full py-3 text-lg text-white font-semibold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#4a9d4e' }}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
      </button>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Sua avaliação será analisada antes de ser publicada
      </p>
    </form>
  );
};
