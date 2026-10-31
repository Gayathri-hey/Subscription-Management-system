import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import staffRoutes from './staff.routes';
import customerRoutes from './customer.routes';

const router = Router();

// ─── Modular Routes ───────────────────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/customer', customerRoutes);

// Placeholder modules for future tasks
// router.use('/products', productRoutes);
// router.use('/plans', planRoutes);
// router.use('/subscriptions', subscriptionRoutes);
// router.use('/quotations', quotationRoutes);
// router.use('/invoices', invoiceRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/taxes', taxRoutes);
// router.use('/discounts', discountRoutes);
// router.use('/analytics', analyticsRoutes);

export default router;
