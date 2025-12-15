import type { Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import type { AuthenticatedRequest } from "../types/auth";
import {
  loginUser,
  registerUser,
  verifyPassword,
  hashPassword,
  deleteAccount,
} from "../services/authService";
import { getUserById, saveUser } from "../services/dataService";

export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required", 400);
    }

    const { user, token } = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  }
);

export const deleteAccountController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    await deleteAccount(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted",
    });
  }
);

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const { user, token } = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  }
);

export const me = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      throw new AppError("Name is required", 400);
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updated = { ...user, name: name.trim(), updatedAt: new Date().toISOString() };
    await saveUser(updated);

    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      message: "Profile updated",
    });
  }
);

export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      throw new AppError("Current and new password are required", 400);
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = { ...user, passwordHash, updatedAt: new Date().toISOString() };
    await saveUser(updated);

    res.status(200).json({
      success: true,
      message: "Password updated",
    });
  }
);
