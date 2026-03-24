import { randomUUID } from 'node:crypto';
import { type Request, type Response, type NextFunction } from 'express';

export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const incomingRequestId = req.header('x-request-id');
  const requestId = incomingRequestId && incomingRequestId.trim().length > 0
    ? incomingRequestId
    : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    console.log(
      `[request] id=${requestId} method=${method} path=${originalUrl} status=${res.statusCode} durationMs=${durationMs} ip=${ip}`
    );
  });

  next();
};
