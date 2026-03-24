import { type Request, type Response } from 'express';
import { ShiftLog } from '../models/ShiftLog.model.js';
import { Emergency } from '../models/Emergency.model.js';
import { Hazard } from '../models/Hazard.model.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

// Get admin dashboard metrics
export const getAdminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Aggregate metrics in parallel
  const [
    totalShiftsToday,
    pendingAcknowledgements,
    activeEmergencies,
    emergenciesBySeverity,
    totalHazards,
    hazardsByRiskLevel,
    recentShifts
  ] = await Promise.all([
    // Total shifts created today
    ShiftLog.countDocuments({
      created_at: { $gte: today }
    }),

    // Pending acknowledgements
    ShiftLog.countDocuments({
      acknowledged: false
    }),

    // Active emergencies
    Emergency.countDocuments({
      status: { $in: ['active', 'in_progress'] }
    }),

    // Emergencies by severity
    Emergency.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]),

    // Total hazards
    Hazard.countDocuments(),

    // Hazards by risk level
    Hazard.aggregate([
      {
        $group: {
          _id: '$risk_level',
          count: { $sum: 1 }
        }
      }
    ]),

    // Recent shifts
    ShiftLog.find()
      .populate('created_by', 'full_name email role')
      .sort({ created_at: -1 })
      .limit(5)
  ]);

  // Count high severity emergencies
  const highSeverityEmergencies = await Emergency.countDocuments({
    severity: 'high',
    status: { $in: ['active', 'in_progress'] }
  });

  // Count high risk hazards
  const highRiskHazards = await Hazard.countDocuments({
    risk_level: 'high'
  });

  // Format emergency severity data
  const emergencySeverityData = {
    low: 0,
    medium: 0,
    high: 0
  };
  emergenciesBySeverity.forEach((item: any) => {
    emergencySeverityData[item._id as keyof typeof emergencySeverityData] = item.count;
  });

  // Format hazard risk level data
  const hazardRiskData = {
    low: 0,
    medium: 0,
    high: 0
  };
  hazardsByRiskLevel.forEach((item: any) => {
    hazardRiskData[item._id as keyof typeof hazardRiskData] = item.count;
  });

  res.json({
    shifts: {
      total_today: totalShiftsToday,
      pending_acknowledgements: pendingAcknowledgements,
      recent: recentShifts
    },
    emergencies: {
      active: activeEmergencies,
      high_severity: highSeverityEmergencies,
      by_severity: emergencySeverityData
    },
    hazards: {
      total: totalHazards,
      high_risk: highRiskHazards,
      by_risk_level: hazardRiskData
    }
  });
});

// Get supervisor dashboard metrics
export const getSupervisorDashboard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Unauthorized', 401);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Aggregate metrics in parallel
  const [
    myShiftsToday,
    myTotalShifts,
    pendingAcknowledgements,
    recentShifts,
    activeEmergencies
  ] = await Promise.all([
    // My shifts created today
    ShiftLog.countDocuments({
      created_by: req.user.userId,
      created_at: { $gte: today }
    }),

    // My total shifts
    ShiftLog.countDocuments({
      created_by: req.user.userId
    }),

    // Shifts needing acknowledgement
    ShiftLog.countDocuments({
      acknowledged: false
    }),

    // Recent shifts (all users)
    ShiftLog.find()
      .populate('created_by', 'full_name email role')
      .sort({ created_at: -1 })
      .limit(5),

    // Active emergencies
    Emergency.countDocuments({
      status: { $in: ['active', 'in_progress'] }
    })
  ]);

  res.json({
    my_shifts: {
      today: myShiftsToday,
      total: myTotalShifts
    },
    shifts: {
      pending_acknowledgements: pendingAcknowledgements,
      recent: recentShifts
    },
    emergencies: {
      active: activeEmergencies
    }
  });
});
