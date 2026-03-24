import { type Request, type Response } from 'express';
import { User } from '../models/User.model.js';
import { generateToken } from '../utils/jwt.util.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import type { SignupInput, LoginInput } from '../validators/auth.validator.js';

// Signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, full_name, role, phone_number } = req.body as SignupInput;

  // Prevent self-registration as admin
  if (role === 'admin') {
    throw createError('Cannot register as admin', 403);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('Email already registered', 409);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    full_name,
    role,
    phone_number
  });

  // Generate token
  const token = generateToken(user._id.toString(), user.role);

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone_number: user.phone_number,
      created_at: user.created_at
    }
  });
});

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.role);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone_number: user.phone_number,
      created_at: user.created_at
    }
  });
});

// Get current user
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    id: user._id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    phone_number: user.phone_number,
    created_at: user.created_at
  });
});
