import { Router } from 'express';
import {
  createEmergency,
  getEmergencies,
  getAssignedEmergencies,
  updateEmergencyStatus,
  assignRescueTeam
} from '../controllers/emergency.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { emergencyLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  createEmergencySchema,
  getEmergenciesQuerySchema,
  updateEmergencyStatusSchema,
  assignRescueTeamSchema
} from '../validators/emergency.validator.js';

const router = Router();

// All emergency routes require authentication
router.use(authenticate);

// Create emergency (all authenticated users, with rate limiting)
router.post(
  '/',
  emergencyLimiter,
  validate(createEmergencySchema),
  createEmergency
);

// Get all emergencies with filters (all authenticated users)
router.get(
  '/',
  validate(getEmergenciesQuerySchema),
  getEmergencies
);

// Get emergencies assigned to current user (rescue team only)
router.get(
  '/assigned',
  requireRole(['rescue']),
  getAssignedEmergencies
);

// Update emergency status (admin or assigned rescue team)
router.patch(
  '/:id/status',
  validate(updateEmergencyStatusSchema),
  updateEmergencyStatus
);

// Assign rescue team to emergency (admin only)
router.patch(
  '/:id/assign',
  requireRole(['admin']),
  validate(assignRescueTeamSchema),
  assignRescueTeam
);

export default router;
