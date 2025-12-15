import type { Response } from "express";
import { asyncHandler, AppError, ErrorCodes } from "../middleware/errorHandler";
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
          _id: user._id,
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
      throw new AppError(
        "Authentication required",
        401,
        ErrorCodes.AUTHENTICATION_REQUIRED
      );
    }

    await deleteAccount(req.user._id);

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
          _id: user._id,
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
      throw new AppError(
        "Authentication required",
        401,
        ErrorCodes.AUTHENTICATION_REQUIRED
      );
    }

    const user = await getUserById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
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
      throw new AppError(
        "Authentication required",
        401,
        ErrorCodes.AUTHENTICATION_REQUIRED
      );
    }
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      throw new AppError("Name is required", 400);
    }

    const user = await getUserById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
    }

    const updated = {
      ...user,
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };
    await saveUser(updated);

    res.status(200).json({
      success: true,
      data: {
        _id: updated._id,
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
      throw new AppError(
        "Authentication required",
        401,
        ErrorCodes.AUTHENTICATION_REQUIRED
      );
    }
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      throw new AppError("Current and new password are required", 400);
    }

    const user = await getUserById(req.user._id);
    if (!user) {
      throw new AppError("User not found", 401, ErrorCodes.USER_NOT_FOUND);
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("INVALID_CURRENT_PASSWORD", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = {
      ...user,
      passwordHash,
      updatedAt: new Date().toISOString(),
    };
    await saveUser(updated);

    res.status(200).json({
      success: true,
      message: "Password updated",
    });
  }
);
