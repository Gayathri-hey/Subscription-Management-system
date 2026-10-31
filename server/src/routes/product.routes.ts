import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  listProducts, getProduct, createProduct, updateProduct, archiveProduct, deleteProduct,
  listVariants, createVariant, updateVariant, deleteVariant,
} from '../controllers/product.controller';

const router = Router();

// All product routes require authentication
router.use(authenticate);

// ─── Product Routes ────────────────────────────────────────────────────────────
// GET  /api/products            - list (public read for authenticated users)
// GET  /api/products/:id        - get single
// POST /api/products            - create (admin only)
// PUT  /api/products/:id        - update (admin only)
// POST /api/products/:id/archive - archive (admin only)
// DELETE /api/products/:id      - delete (admin only)

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', authorize('admin'), createProduct);
router.put('/:id', authorize('admin'), updateProduct);
router.post('/:id/archive', authorize('admin'), archiveProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

// ─── Variant Sub-routes ────────────────────────────────────────────────────────
router.get('/:id/variants', listVariants);
router.post('/:id/variants', authorize('admin'), createVariant);
router.put('/:id/variants/:variantId', authorize('admin'), updateVariant);
router.delete('/:id/variants/:variantId', authorize('admin'), deleteVariant);

export default router;
