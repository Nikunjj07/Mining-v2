import { Router } from 'express';
import {
  getAdminDashboard,
  getSupervisorDashboard
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get admin dashboard metrics (admin only)
router.get(
  '/admin',
  requireRole(['admin']),
  getAdminDashboard
);

// Get supervisor dashboard metrics (supervisor and worker only)
router.get(
  '/supervisor',
  requireRole(['supervisor', 'worker']),
  getSupervisorDashboard
);

export default router;
