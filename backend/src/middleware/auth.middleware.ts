import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: 'ADMIN' | 'USER';
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        code: 'AUTH_001',
        message: 'Access token required'
      });
    }

    const decoded = await AuthService.verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({
      code: 'AUTH_002',
      message: 'Invalid or expired token'
    });
  }
};

export const requireRole = (roles: ('ADMIN' | 'USER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'AUTH_001',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'AUTH_003',
        message: 'Insufficient permissions'
      });
    }

    return next();
  };
};