import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
} from '../validators/auth.validator';

const router = Router();

// Protect ALL staff routes: Requires active authentication AND Admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   POST /api/staff
 * @desc    Create staff account
 * @access  Admin only
 */
router.post('/', validateBody(createStaffSchema), staffController.createStaff);

/**
 * @route   GET /api/staff
 * @desc    List staff accounts
 * @access  Admin only
 */
router.get('/', staffController.listStaff);

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff member by ID
 * @access  Admin only
 */
router.get('/:id', staffController.getStaffById);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member details
 * @access  Admin only
 */
router.put('/:id', validateBody(updateStaffSchema), staffController.updateStaff);

/**
 * @route   PATCH /api/staff/:id/status
 * @desc    Update staff member status (active, inactive, suspended)
 * @access  Admin only
 */
router.patch(
  '/:id/status',
  validateBody(updateStaffStatusSchema),
  staffController.updateStaffStatus
);

export default router;

