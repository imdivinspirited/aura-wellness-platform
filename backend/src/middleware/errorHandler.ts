/**
 * Error Handler Middleware
 *
 * Centralized error handling.
 */

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;

  // Always log errors server-side
  console.error('Error:', err);

  // Never send stack traces to clients
  const clientMessage = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message: clientMessage,
    },
  });
}
