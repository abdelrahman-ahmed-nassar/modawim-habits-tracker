import { Request, Response, NextFunction } from "express";

// Error codes for specific error types that frontend can handle
export const ErrorCodes = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_TOKEN: "INVALID_TOKEN",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

interface ApiError extends Error {
  statusCode?: number;
  code?: ErrorCode;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // For expected client errors (4xx), just log the message
  // For unexpected server errors (5xx), log the full stack trace
  if (statusCode >= 500) {
    console.error(`Error: ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  } else if (process.env.NODE_ENV !== "production") {
    // In development, log 4xx errors too but without stack
    console.warn(`Client error: ${message} (${statusCode})`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code,
    errors: err.errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

/**
 * Create a custom error with status code, optional error code, and validation errors
 */
export class AppError extends Error {
  statusCode: number;
  code?: ErrorCode;
  errors?: any[];

  constructor(
    message: string,
    statusCode: number,
    codeOrErrors?: ErrorCode | any[],
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;

    // Handle both signatures:
    // new AppError(message, status, code, errors) - new style with error code
    // new AppError(message, status, errors) - old style without error code
    if (typeof codeOrErrors === "string") {
      this.code = codeOrErrors as ErrorCode;
      this.errors = errors;
    } else {
      this.errors = codeOrErrors;
    }

    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Async handler to catch errors in async route handlers
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
