import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authenticate, me);

export default router;
