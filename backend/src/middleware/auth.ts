import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Placeholder authentication middleware
// TODO: Implement Azure AD B2C integration
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error = createError('Access token required', 401);
    next(error);
    return;
  }

  // TODO: Validate token with Azure AD B2C
  // For now, mock a user based on token
  if (token === 'mock-valid-token') {
    req.user = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
    };
    next();
  } else {
    const error = createError('Invalid access token', 403);
    next(error);
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token && token === 'mock-valid-token') {
    req.user = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
    };
  }

  next();
};