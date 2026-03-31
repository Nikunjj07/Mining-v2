import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestContext } from './middleware/requestContext.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import hazardRoutes from './routes/hazard.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import locationRoutes from './routes/location.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usersRoutes from './routes/users.routes.js';

export const createApp = (): Express => {
  const app: Express = express();

  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  }));
  app.use(requestContext);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/shifts', shiftRoutes);
  app.use('/api/emergencies', emergencyRoutes);
  app.use('/api/hazards', hazardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', usersRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
};
