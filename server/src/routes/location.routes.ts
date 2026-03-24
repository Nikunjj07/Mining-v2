import { Router } from 'express';
import {
  updateLocation,
  getActiveLocations,
  getEmergencyLocations,
  deactivateLocation
} from '../controllers/location.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateLocationSchema } from '../validators/location.validator.js';

const router = Router();

// All location routes require authentication
router.use(authenticate);

// Update user location
router.post(
  '/',
  validate(updateLocationSchema),
  updateLocation
);

// Get all active user locations
router.get(
  '/active',
  getActiveLocations
);

// Get emergency locations
router.get(
  '/emergencies',
  getEmergencyLocations
);

// Deactivate current user's location
router.patch(
  '/deactivate',
  deactivateLocation
);

export default router;
