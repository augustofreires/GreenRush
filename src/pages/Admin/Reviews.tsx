import { useState, useEffect } from 'react';
import { FiStar, FiCheck, FiX, FiTrash2, FiMessageSquare, FiFilter, FiSearch, FiPlus, FiImage, FiVideo, FiUpload } from 'react-icons/fi';
import { reviewAPI, type ReviewResponse } from '../../services/reviewAPI';
import { useProductStore } from '../../store/useProductStore';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type FilterRating = 'all' | '5' | '4' | '3' | '2' | '1';

export const AdminReviews = () => {
  const { products } = useProductStore();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterRating, setFilterRating] = useState<FilterRating>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    user_name: '',
    user_email: '',
    rating: 5,
    comment: '',
    images: [] as File[],
    video: null as File | null,
    is_verified_purchase: true,
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string>('');

  // Buscar avaliações da API
  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getAllReviews(
        filterStatus !== 'all' ? filterStatus : undefined
      );
      setReviews(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nome do produto às avaliações
  const allReviews = reviews.map(review => {
    const product = products.find(p => p.id === review.product_id);
    return {
      ...review,
      productName: product?.name || 'Produto não encontrado',
    };
  });

  // Filtrar avaliações
  const filteredReviews = allReviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesSearch = searchTerm === '' ||
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesRating && matchesSearch;
  });

  // Estatísticas
  const stats = {
    total: allReviews.length,
    pending: allReviews.filter(r => r.status === 'pending').length,
    approved: allReviews.filter(r => r.status === 'approved').length,
    rejected: allReviews.filter(r => r.status === 'rejected').length,
    averageRating: allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0',
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewAPI.updateReviewStatus(reviewId, 'approved');
      await loadReviews(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar avaliação');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await reviewAPI.updateReviewStatus(reviewId, 'rejected');
      await loadReviews(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar avaliação');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
      await reviewAPI.deleteReview(reviewId);
      await loadReviews(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar avaliação');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - formData.images.length);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles].slice(0, 5),
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, video: file }));
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setFormData((prev) => ({ ...prev, video: null }));
    setVideoPreview('');
  };

  const handleCreateReview = async () => {
    if (!formData.product_id || !formData.user_name || !formData.comment) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await reviewAPI.createReview({
        productId: formData.product_id,
        userId: 'admin-manual',
        userName: formData.user_name,
        userEmail: formData.user_email || 'admin@example.com',
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images.length > 0 ? formData.images : undefined,
        video: formData.video || undefined,
        isVerifiedPurchase: formData.is_verified_purchase,
      });

      // Limpar previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      setShowModal(false);
      setFormData({
        product_id: '',
        user_name: '',
        user_email: '',
        rating: 5,
        comment: '',
        images: [] as File[],
        video: null,
        is_verified_purchase: true,
      });
      setImagePreviews([]);
      setVideoPreview('');
      await loadReviews();
      alert('Avaliação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      alert('Erro ao criar avaliação');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pendente</span>,
      approved: <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Aprovada</span>,
      rejected: <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejeitada</span>,
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliações de Clientes</h1>
          <p className="text-gray-600">Gerencie as avaliações e comentários dos clientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md font-semibold"
        >
          <FiPlus size={20} />
          Criar Avaliação
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiMessageSquare className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <FiFilter className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <FiCheck className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejeitadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <FiX className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
            <FiStar className="text-yellow-400 fill-yellow-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por autor, comentário ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Rejeitadas</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as FilterRating)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          >
            <option value="all">Todas as estrelas</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando avaliações...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiMessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">Nenhuma avaliação encontrada</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.user_name}</h3>
                      {renderStars(review.rating)}
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Produto: <strong>{review.productName}</strong></span>
                      <span>•</span>
                      <span>{formatDate(review.created_at)}</span>
                      {review.is_verified_purchase && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <FiCheck size={14} />
                            Compra verificada
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Aprovar"
                      >
                        <FiCheck size={20} />
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Rejeitar"
                      >
                        <FiX size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Video */}
                {review.videoUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Vídeo da avaliação:</p>
                    <a
                      href={review.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver vídeo
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredReviews.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Mostrando {filteredReviews.length} de {allReviews.length} avaliações
        </div>
      )}

      {/* Modal Criar Avaliação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Criar Nova Avaliação</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produto *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome do Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>

              {/* Email do Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Cliente
                </label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  placeholder="Ex: maria@email.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <FiStar
                        size={32}
                        className={
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  placeholder="Escreva o comentário do cliente..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>

              {/* Upload de Imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiImage className="inline mr-2" />
                  Imagens da Avaliação (opcional)
                </label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Upload ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <FiUpload className="text-gray-400" size={28} />
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
                <p className="text-sm text-gray-500 mt-2">Máximo 5 imagens</p>
              </div>

              {/* Upload de Vídeo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiVideo className="inline mr-2" />
                  Vídeo da Avaliação (opcional)
                </label>
                {videoPreview ? (
                  <div className="relative">
                    <video src={videoPreview} controls className="w-full max-h-64 rounded-lg border-2 border-gray-200" />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                    <FiUpload className="text-gray-400 mb-2" size={36} />
                    <span className="text-gray-600 font-medium">Clique para fazer upload do vídeo</span>
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

              {/* Compra Verificada */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.is_verified_purchase}
                  onChange={(e) => setFormData({ ...formData, is_verified_purchase: e.target.checked })}
                  className="w-4 h-4 text-primary-green focus:ring-primary-green rounded"
                />
                <label htmlFor="verified" className="text-sm text-gray-700">
                  Marcar como compra verificada
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateReview}
                className="px-6 py-2 bg-primary-green text-white rounded-lg hover:opacity-90 transition-all"
              >
                Criar Avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
