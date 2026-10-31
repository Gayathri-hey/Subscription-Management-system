import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  updateCustomerProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Protect ALL customer profile routes: Requires active authentication and role 'customer' or 'admin'
router.use(authenticate);
router.use(authorize('customer', 'admin'));

/**
 * @route   GET /api/customer/profile
 * @desc    Get customer profile
 * @access  Customer, Admin
 */
router.get('/profile', customerController.getProfile);

/**
 * @route   PUT /api/customer/profile
 * @desc    Update customer profile details
 * @access  Customer, Admin
 */
router.put(
  '/profile',
  validateBody(updateCustomerProfileSchema),
  customerController.updateProfile
);

/**
 * @route   PUT /api/customer/password
 * @desc    Change customer account password
 * @access  Customer, Admin
 */
router.put(
  '/password',
  validateBody(changePasswordSchema),
  customerController.changePassword
);

export default router;

