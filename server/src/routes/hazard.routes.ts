import { Router } from 'express';
import {
  createHazard,
  getHazards,
  getHazardById,
  updateHazard,
  deleteHazard
} from '../controllers/hazard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createHazardSchema,
  updateHazardSchema,
  getHazardByIdSchema,
  deleteHazardSchema,
  getHazardsQuerySchema
} from '../validators/hazard.validator.js';

const router = Router();

// All hazard routes require authentication
router.use(authenticate);

// Get all hazards (all authenticated users can view)
router.get(
  '/',
  validate(getHazardsQuerySchema),
  getHazards
);

// Get single hazard by ID (all authenticated users can view)
router.get(
  '/:id',
  validate(getHazardByIdSchema),
  getHazardById
);

// Create hazard (admin only)
router.post(
  '/',
  requireRole(['admin']),
  validate(createHazardSchema),
  createHazard
);

// Update hazard (admin only)
router.patch(
  '/:id',
  requireRole(['admin']),
  validate(updateHazardSchema),
  updateHazard
);

// Delete hazard (admin only)
router.delete(
  '/:id',
  requireRole(['admin']),
  validate(deleteHazardSchema),
  deleteHazard
);

export default router;
