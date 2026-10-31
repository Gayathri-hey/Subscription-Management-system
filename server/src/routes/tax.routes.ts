import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  listTaxRules, getTaxRule, createTaxRule, updateTaxRule, toggleTaxRuleStatus,
  calculateTax, getApplicableTaxRules,
} from '../controllers/tax.controller';

const router = Router();

router.use(authenticate);

// GET  /api/taxes               - list
// GET  /api/taxes/applicable    - get applicable rules by country/state (query params)
// GET  /api/taxes/:id           - single
// POST /api/taxes               - create (admin only)
// PUT  /api/taxes/:id           - update (admin only)
// PATCH /api/taxes/:id/status   - toggle status (admin only)
// POST /api/taxes/calculate     - calculate tax (staff + admin)
// DELETE /api/taxes/:id         - delete (admin only)

router.get('/applicable', getApplicableTaxRules);
router.get('/', listTaxRules);
router.get('/:id', getTaxRule);

router.post('/calculate', authorize('admin', 'staff'), calculateTax);
router.post('/', authorize('admin'), createTaxRule);
router.put('/:id', authorize('admin'), updateTaxRule);
router.patch('/:id/status', authorize('admin'), toggleTaxRuleStatus);

export default router;
