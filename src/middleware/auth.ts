import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';
import { ERRORS } from '../constants';

// Extend Express Request to include userId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Mock authentication middleware
 * Extracts user ID from x-user-id header
 * In production, this would validate JWT/OAuth tokens
 */
export const authMiddleware = (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): void => {
  const userId = req.headers['x-user-id'];

  if (!userId || typeof userId !== 'string') {
    res.status(401).json({
      success: false,
      error: ERRORS.UNAUTHORIZED,
      details: [ERRORS.MISSING_USER_ID_HEADER],
    });
    return;
  }

  // Validate userId format (simple validation - alphanumeric with some special chars)
  const userIdRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  if (!userIdRegex.test(userId)) {
    res.status(401).json({
      success: false,
      error: ERRORS.UNAUTHORIZED,
      details: [ERRORS.INVALID_USER_ID_FORMAT],
    });
    return;
  }

  req.userId = userId;
  next();
};

export default authMiddleware;

