import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// ─── Modular Routes ───────────────────────────────────────────────────────────
router.use('/health', healthRoutes);

// Placeholder modules for future tasks
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
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

