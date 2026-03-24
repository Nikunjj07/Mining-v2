import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { Emergency } from '../models/Emergency.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { createNotification } from '../services/notification.service.js';
import type {
  CreateEmergencyInput,
  GetEmergenciesQuery,
  UpdateEmergencyStatusInput,
  AssignRescueTeamInput
} from '../validators/emergency.validator.js';

// Create emergency
export const createEmergency = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const emergencyData = req.body as CreateEmergencyInput;

  const emergency = await Emergency.create({
    ...emergencyData,
    reported_by: req.user.userId,
    status: 'active'
  });

  // Populate reporter info
  await emergency.populate('reported_by', 'full_name email role');

  // Create notifications for admins
  // TODO: Query all admin users and notify them
  // For now, we'll create a notification for the reporter as confirmation
  await createNotification(
    req.user.userId,
    'emergency_created',
    'Emergency Reported',
    `Your ${emergencyData.severity} severity ${emergencyData.type.replace('_', ' ')} emergency has been reported`,
    emergency._id.toString(),
    'emergencies'
  );

  res.status(201).json({
    message: 'Emergency created successfully',
    emergency
  });
});

// Get all emergencies with filters and pagination
export const getEmergencies = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, severity, status } = req.query as unknown as GetEmergenciesQuery;

  const filter: any = {};
  if (severity) filter.severity = severity;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [emergencies, total] = await Promise.all([
    Emergency.find(filter)
      .populate('reported_by', 'full_name email role')
      .populate('assigned_to', 'full_name email role')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Emergency.countDocuments(filter)
  ]);

  res.json({
    emergencies,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get emergencies assigned to current user (rescue team)
export const getAssignedEmergencies = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const emergencies = await Emergency.find({
    assigned_to: req.user.userId,
    status: { $in: ['active', 'in_progress'] } // Only show active/in-progress
  })
    .populate('reported_by', 'full_name email role')
    .sort({ created_at: -1 });

  res.json({
    emergencies
  });
});

// Update emergency status
export const updateEmergencyStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const { id } = req.params as UpdateEmergencyStatusInput['params'];
  const { status } = req.body as UpdateEmergencyStatusInput['body'];

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    throw createError('Emergency not found', 404);
  }

  // Only admin or assigned rescue team can update status
  const isAssigned = emergency.assigned_to?.toString() === req.user.userId;
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin && !isAssigned) {
    throw createError('Not authorized to update this emergency', 403);
  }

  const oldStatus = emergency.status;
  emergency.status = status;

  // Set resolved timestamp if status is resolved
  if (status === 'resolved' && oldStatus !== 'resolved') {
    emergency.resolved_at = new Date();
  }

  await emergency.save();
  await emergency.populate(['reported_by', 'assigned_to']);

  // Notify the reporter about status change
  await createNotification(
    emergency.reported_by._id.toString(),
    'emergency_status_changed',
    'Emergency Status Updated',
    `Your emergency status has been updated to ${status}`,
    emergency._id.toString(),
    'emergencies'
  );

  res.json({
    message: 'Emergency status updated successfully',
    emergency
  });
});

// Assign rescue team to emergency (admin only)
export const assignRescueTeam = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as AssignRescueTeamInput['params'];
  const { assigned_to } = req.body as AssignRescueTeamInput['body'];

  // Verify the user exists and is a rescue team member
  const rescueUser = await User.findById(assigned_to);
  if (!rescueUser) {
    throw createError('User not found', 404);
  }

  if (rescueUser.role !== 'rescue') {
    throw createError('User must be a rescue team member', 400);
  }

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    throw createError('Emergency not found', 404);
  }

  emergency.assigned_to = new mongoose.Types.ObjectId(assigned_to) as any;

  // Auto-update status to in_progress if it's still active
  if (emergency.status === 'active') {
    emergency.status = 'in_progress';
  }

  await emergency.save();
  await emergency.populate(['reported_by', 'assigned_to']);

  // Notify the rescue team member
  await createNotification(
    assigned_to,
    'emergency_assigned',
    'Emergency Assigned',
    `You have been assigned to a ${emergency.severity} severity ${emergency.type.replace('_', ' ')} emergency`,
    emergency._id.toString(),
    'emergencies'
  );

  // Notify the reporter
  await createNotification(
    emergency.reported_by._id.toString(),
    'emergency_status_changed',
    'Rescue Team Assigned',
    `A rescue team has been assigned to your emergency`,
    emergency._id.toString(),
    'emergencies'
  );

  res.json({
    message: 'Rescue team assigned successfully',
    emergency
  });
});
