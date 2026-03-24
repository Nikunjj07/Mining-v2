import { Router } from 'express';
import {
  createShiftLog,
  getShiftLogs,
  getRecentShifts,
  acknowledgeShift
} from '../controllers/shift.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createShiftLogSchema,
  acknowledgeShiftSchema,
  getShiftsQuerySchema,
  getRecentShiftsQuerySchema
} from '../validators/shift.validator.js';

const router = Router();

// All shift routes require authentication
router.use(authenticate);

// Create shift log (supervisor and worker only)
router.post(
  '/',
  requireRole(['supervisor', 'worker']),
  validate(createShiftLogSchema),
  createShiftLog
);

// Get all shift logs (all authenticated users)
router.get(
  '/',
  validate(getShiftsQuerySchema),
  getShiftLogs
);

// Get recent shifts (all authenticated users)
router.get(
  '/recent',
  validate(getRecentShiftsQuerySchema),
  getRecentShifts
);

// Acknowledge shift (all authenticated users)
router.post(
  '/:id/acknowledge',
  validate(acknowledgeShiftSchema),
  acknowledgeShift
);

export default router;
