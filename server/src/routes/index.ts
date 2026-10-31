import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import staffRoutes from './staff.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import planRoutes from './plan.routes';
import taxRoutes from './tax.routes';

const router = Router();

// ─── Modular Routes ───────────────────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/customer', customerRoutes);

// ─── Phase 2: Product, Plan & Tax Routes ─────────────────────────────────────
router.use('/products', productRoutes);
router.use('/plans', planRoutes);
router.use('/taxes', taxRoutes);

// Placeholder modules for future phases
// router.use('/subscriptions', subscriptionRoutes);
// router.use('/quotations', quotationRoutes);
// router.use('/invoices', invoiceRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/discounts', discountRoutes);
// router.use('/analytics', analyticsRoutes);

export default router;
