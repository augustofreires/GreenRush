import express from 'express';
import {
  createCoupon,
  importCoupons,
  getAllCoupons,
  validateCoupon,
  applyCoupon,
  deleteCoupon,
  toggleCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Rotas públicas
router.get('/coupons/validate/:code', validateCoupon);
router.post('/coupons/apply', applyCoupon);

// Rotas admin (em produção adicionar autenticação)
router.post('/admin/coupons', createCoupon);
router.post('/admin/coupons/import', importCoupons);
router.get('/admin/coupons', getAllCoupons);
router.delete('/admin/coupons/:id', deleteCoupon);
router.patch('/admin/coupons/:id/toggle', toggleCoupon);

export default router;
