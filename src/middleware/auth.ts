import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

// Extend Express Request interface to add user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: string;
      };
    }
  }
}

// Middleware to require authentication (works for both user and host)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    // @ts-ignore
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-jwt-secret-key'
    ) as { id: string; email: string; type: string };
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or expired token',
    };
    return res.status(401).json(response);
  }
};

// Middleware specific to users
export const requireUserAuth = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.type !== 'user') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User authentication required',
      };
      return res.status(403).json(response);
    }
    next();
  });
};

// Middleware specific to hosts
export const requireHostAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('requireHostAuth middleware starting');
  requireAuth(req, res, () => {
    console.log('requireAuth completed, req.user:', req.user);
    if (req.user?.type !== 'host') {
      console.log('requireHostAuth failed: Not a host, user type =', req.user?.type);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Host authentication required',
      };
      return res.status(403).json(response);
    }
    console.log('requireHostAuth succeeded, req.user.id =', req.user.id);
    next();
  });
}; 