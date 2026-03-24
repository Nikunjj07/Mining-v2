import { type Request, type Response } from 'express';
import { Hazard } from '../models/Hazard.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import type {
  CreateHazardInput,
  UpdateHazardInput,
  GetHazardByIdParams,
  DeleteHazardParams,
  GetHazardsQuery
} from '../validators/hazard.validator.js';

// Create hazard
export const createHazard = asyncHandler(async (req: Request, res: Response) => {
  const hazardData = req.body as CreateHazardInput;

  const hazard = await Hazard.create(hazardData);

  res.status(201).json({
    message: 'Hazard created successfully',
    hazard
  });
});

// Get all hazards with filters and pagination
export const getHazards = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, risk_level, status } = req.query as unknown as GetHazardsQuery;

  const filter: any = {};
  if (risk_level) filter.risk_level = risk_level;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [hazards, total] = await Promise.all([
    Hazard.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    Hazard.countDocuments(filter)
  ]);

  res.json({
    hazards,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

// Get single hazard by ID
export const getHazardById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as GetHazardByIdParams;

  const hazard = await Hazard.findById(id);
  if (!hazard) {
    throw createError('Hazard not found', 404);
  }

  res.json({ hazard });
});

// Update hazard
export const updateHazard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as UpdateHazardInput['params'];
  const updateData = req.body as UpdateHazardInput['body'];

  const hazard = await Hazard.findById(id);
  if (!hazard) {
    throw createError('Hazard not found', 404);
  }

  // Update fields
  Object.assign(hazard, updateData);
  await hazard.save();

  res.json({
    message: 'Hazard updated successfully',
    hazard
  });
});

// Delete hazard
export const deleteHazard = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as DeleteHazardParams;

  const hazard = await Hazard.findById(id);
  if (!hazard) {
    throw createError('Hazard not found', 404);
  }

  await hazard.deleteOne();

  res.json({
    message: 'Hazard deleted successfully'
  });
});
