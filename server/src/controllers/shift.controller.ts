import { type Request, type Response } from 'express';
import { ShiftLog } from '../models/ShiftLog.model.js';
import { ShiftAcknowledgement } from '../models/ShiftAcknowledgement.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { createNotification } from '../services/notification.service.js';
import type { CreateShiftLogInput, AcknowledgeShiftParams, GetShiftsQuery, GetRecentShiftsQuery } from '../validators/shift.validator.js';

// Create shift log
export const createShiftLog = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const shiftData = req.body as CreateShiftLogInput;

  const shiftLog = await ShiftLog.create({
    ...shiftData,
    created_by: req.user.userId,
    acknowledged: false
  });

  // Populate creator info
  await shiftLog.populate('created_by', 'full_name email role');

  // TODO: Create notification for next shift supervisor to acknowledge
  // For now, we'll create a general notification
  if (shiftData.red_flag) {
    // Notify admins about red flag
    await createNotification(
      req.user.userId, // This should be admin users, but we'll handle it in the service
      'shift_acknowledgment_required',
      'Red Flag Shift Reported',
      `A ${shiftLog.shift} shift with a red flag has been reported and requires acknowledgement`,
      shiftLog._id.toString(),
      'shift_logs'
    );
  }

  res.status(201).json({
    message: 'Shift log created successfully',
    shift_log: shiftLog
  });
});

// Get all shift logs with pagination
export const getShiftLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, acknowledged } = req.query as unknown as GetShiftsQuery;

  const filter: any = {};
  if (acknowledged !== undefined) {
    filter.acknowledged = acknowledged === 'true';
  }

  const skip = (page - 1) * limit;

  const [shiftLogs, total] = await Promise.all([
    ShiftLog.find(filter)
      .populate('created_by', 'full_name email role')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    ShiftLog.countDocuments(filter)
  ]);

  res.json({
    shift_logs: shiftLogs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get recent shift logs
export const getRecentShifts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query as unknown as GetRecentShiftsQuery;

  const shiftLogs = await ShiftLog.find()
    .populate('created_by', 'full_name email role')
    .sort({ created_at: -1 })
    .limit(limit);

  res.json({
    shift_logs: shiftLogs
  });
});

// Acknowledge shift
export const acknowledgeShift = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const { id } = req.params as AcknowledgeShiftParams;

  // Find shift log
  const shiftLog = await ShiftLog.findById(id);
  if (!shiftLog) {
    throw createError('Shift log not found', 404);
  }

  // Check if already acknowledged
  if (shiftLog.acknowledged) {
    throw createError('Shift log already acknowledged', 400);
  }

  // Create acknowledgement record
  const acknowledgement = await ShiftAcknowledgement.create({
    shift_log_id: id,
    acknowledged_by: req.user.userId
  });

  // Update shift log
  shiftLog.acknowledged = true;
  await shiftLog.save();

  // Populate acknowledgement info
  await acknowledgement.populate('acknowledged_by', 'full_name email role');

  // Create notification for original shift creator
  await createNotification(
    shiftLog.created_by.toString(),
    'shift_acknowledgment_required',
    'Shift Acknowledged',
    `Your ${shiftLog.shift} shift has been acknowledged`,
    shiftLog._id.toString(),
    'shift_logs'
  );

  res.json({
    message: 'Shift acknowledged successfully',
    acknowledgement
  });
});
