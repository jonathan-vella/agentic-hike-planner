import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

// Extend Request type to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

// Correlation ID middleware
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
};

// Custom morgan token for correlation ID
morgan.token('correlationId', (req: Request) => req.correlationId || 'unknown');

// Custom morgan format
const morganFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :correlationId :response-time ms'
  : ':method :url :status :response-time ms - :res[content-length] :correlationId';

export const logger = morgan(morganFormat);

// Structured logging utility
export const structuredLogger = {
  info: (message: string, meta?: Record<string, unknown>): void => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  
  warn: (message: string, meta?: Record<string, unknown>): void => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  
  error: (message: string, error?: Error, meta?: Record<string, unknown>): void => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
};