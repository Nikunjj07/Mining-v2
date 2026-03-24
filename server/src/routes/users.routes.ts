import { Router } from 'express';
import { User } from '../models/User.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// GET /api/users/rescue - Get all rescue team members (admin only)
router.get('/rescue', authenticate, requireRole(['admin']), async (_req, res, next) => {
  try {
    const users = await User.find({ role: 'rescue' })
      .select('-password')
      .sort({ full_name: 1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/by-role/:role - Get users by role (admin only)
router.get('/by-role/:role', authenticate, requireRole(['admin']), async (req, res, next) => {
  try {
    const role = req.params.role as string;
    const validRoles = ['admin', 'supervisor', 'worker', 'rescue'];

    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const users = await User.find({ role })
      .select('-password')
      .sort({ full_name: 1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
