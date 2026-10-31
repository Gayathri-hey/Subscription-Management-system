import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  listPlans, getPlan, createPlan, updatePlan, archivePlan, deletePlan, checkPlanAvailability,
} from '../controllers/plan.controller';

const router = Router();

router.use(authenticate);

// GET  /api/plans               - list
// GET  /api/plans/:id           - single
// GET  /api/plans/:id/available - availability check (used by subscription module)
// POST /api/plans               - create (admin only)
// PUT  /api/plans/:id           - update (admin only)
// POST /api/plans/:id/archive   - archive (admin only)
// DELETE /api/plans/:id         - delete (admin only)

router.get('/', listPlans);
router.get('/:id', getPlan);
router.get('/:id/available', checkPlanAvailability);

router.post('/', authorize('admin'), createPlan);
router.put('/:id', authorize('admin'), updatePlan);
router.post('/:id/archive', authorize('admin'), archivePlan);
router.delete('/:id', authorize('admin'), deletePlan);

export default router;
