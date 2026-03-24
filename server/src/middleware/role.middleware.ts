import { type Request, type Response, type NextFunction } from 'express';

type UserRole = 'admin' | 'supervisor' | 'worker' | 'rescue';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized - No user information' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden - Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Convenience middleware for common role combinations
export const requireAdmin = requireRole(['admin']);
export const requireAdminOrSupervisor = requireRole(['admin', 'supervisor']);
export const requireSupervisorOrWorker = requireRole(['supervisor', 'worker']);
export const requireRescue = requireRole(['rescue']);
export const requireAdminOrRescue = requireRole(['admin', 'rescue']);
