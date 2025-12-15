import type { Request } from "express";
import type { User } from "@shared/types";

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: Pick<User, "id" | "email" | "name">;
}
