import { type Request, type Response } from 'express';
import { UserLocation } from '../models/UserLocation.model.js';
import { Emergency } from '../models/Emergency.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import type { UpdateLocationInput } from '../validators/location.validator.js';

// Update user location
export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const { latitude, longitude, accuracy } = req.body as UpdateLocationInput;

  // Find existing location or create new one
  let location = await UserLocation.findOne({ user_id: req.user.userId });

  if (location) {
    // Update existing location
    location.latitude = latitude;
    location.longitude = longitude;
    location.accuracy = accuracy;
    location.is_active = true;
    location.last_updated = new Date();
    await location.save();
  } else {
    // Create new location
    location = await UserLocation.create({
      user_id: req.user.userId,
      latitude,
      longitude,
      accuracy,
      is_active: true
    });
  }

  await location.populate('user_id', 'full_name email role');

  res.json({
    message: 'Location updated successfully',
    location
  });
});

// Get all active user locations
export const getActiveLocations = asyncHandler(async (_req: Request, res: Response) => {
  const locations = await UserLocation.find({ is_active: true })
    .populate('user_id', 'full_name email role')
    .sort({ last_updated: -1 });

  res.json({
    locations
  });
});

// Get emergency locations (active emergencies with coordinates)
export const getEmergencyLocations = asyncHandler(async (_req: Request, res: Response) => {
  const emergencies = await Emergency.find({
    status: { $in: ['active', 'in_progress'] },
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null }
  })
    .populate('reported_by', 'full_name email role')
    .populate('assigned_to', 'full_name email role')
    .sort({ created_at: -1 });

  res.json({
    emergencies
  });
});

// Deactivate user location
export const deactivateLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const location = await UserLocation.findOne({ user_id: req.user.userId });

  if (!location) {
    throw createError('Location not found', 404);
  }

  location.is_active = false;
  await location.save();

  res.json({
    message: 'Location deactivated successfully'
  });
});
