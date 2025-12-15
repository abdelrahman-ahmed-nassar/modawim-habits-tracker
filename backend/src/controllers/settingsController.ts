import { Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import type { AuthenticatedRequest } from "../types/auth";
import type { UserSettings } from "@shared/types";

/**
 * Get current settings (per authenticated user)
 * @route GET /api/settings
 */
export const getSettings = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const settings = await dataService.getUserSettings(userId);

    res.status(200).json({
      success: true,
      data: settings,
    });
  }
);

/**
 * Update settings (for authenticated user)
 * @route PUT /api/settings
 */
export const updateSettings = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const settingsData: Partial<UserSettings> = req.body;

    const updatedSettings = await dataService.updateUserSettings(
      userId,
      settingsData
    );

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  }
);

/**
 * Reset all user data (habits, notes, embedded settings/templates/counters/etc.)
 * @route DELETE /api/settings/reset-data
 */
export const resetData = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    await dataService.resetUserData(userId);

    res.status(200).json({
      success: true,
      message: "All user data has been reset successfully",
    });
  }
);
