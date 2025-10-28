const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CreateReviewData {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  images?: File[];
  video?: File;
}

export interface ReviewResponse {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  images: string[];
  videoUrl: string | null;
}

export const reviewAPI = {
  // Criar nova avaliação
  async createReview(data: CreateReviewData): Promise<{ message: string; reviewId: string }> {
    const formData = new FormData();

    formData.append('productId', data.productId);
    formData.append('userId', data.userId);
    formData.append('userName', data.userName);
    formData.append('userEmail', data.userEmail);
    formData.append('rating', data.rating.toString());
    formData.append('comment', data.comment);
    formData.append('isVerifiedPurchase', data.isVerifiedPurchase.toString());

    if (data.title) {
      formData.append('title', data.title);
    }

    // Adicionar imagens
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Adicionar vídeo
    if (data.video) {
      formData.append('video', data.video);
    }

    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar avaliação');
    }

    return response.json();
  },

  // Buscar avaliações de um produto
  async getProductReviews(productId: string, status: 'pending' | 'approved' | 'rejected' = 'approved'): Promise<ReviewResponse[]> {
    const response = await fetch(`${API_URL}/reviews/product/${productId}?status=${status}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar avaliações');
    }

    return response.json();
  },

  // Buscar estatísticas de avaliações de um produto
  async getProductStats(productId: string): Promise<{
    total: number;
    average_rating: number;
    five_stars: number;
    four_stars: number;
    three_stars: number;
    two_stars: number;
    one_star: number;
  }> {
    const response = await fetch(`${API_URL}/reviews/product/${productId}/stats`);

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas');
    }

    return response.json();
  },

  // [ADMIN] Buscar todas as avaliações
  async getAllReviews(status?: 'pending' | 'approved' | 'rejected'): Promise<ReviewResponse[]> {
    const url = status
      ? `${API_URL}/admin/reviews?status=${status}`
      : `${API_URL}/admin/reviews`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro ao buscar avaliações');
    }

    return response.json();
  },

  // [ADMIN] Atualizar status da avaliação
  async updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar status');
    }

    return response.json();
  },

  // [ADMIN] Deletar avaliação
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar avaliação');
    }

    return response.json();
  },
};
