import express from 'express';
import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats
} from '../controllers/reviewController.js';

const router = express.Router();

// Rotas públicas
router.post('/reviews', createReview);
router.get('/reviews/product/:productId', getProductReviews);
router.get('/reviews/product/:productId/stats', getReviewStats);

// Rotas admin (em produção adicionar autenticação)
router.get('/admin/reviews', getAllReviews);
router.patch('/admin/reviews/:id/status', updateReviewStatus);
router.delete('/admin/reviews/:id', deleteReview);

export default router;
