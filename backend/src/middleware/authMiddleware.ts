import type { Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "./errorHandler";
import type { AuthenticatedRequest } from "../types/auth";
import { verifyToken } from "../services/authService";

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401, ErrorCodes.AUTHENTICATION_REQUIRED));
  }

  const token = authHeader.substring("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { _id: payload.sub, email: payload.email, name: (payload as any).name };
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401, ErrorCodes.INVALID_TOKEN));
  }
};
