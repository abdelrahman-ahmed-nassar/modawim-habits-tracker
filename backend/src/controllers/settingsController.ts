import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import { AppError } from "../middleware/errorHandler";
import { Settings } from "../types/models";

/**
 * Get current settings
 * @route GET /api/settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await dataService.getSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * Reset all data (delete all entries from JSON files)
 * @route DELETE /api/settings/reset-data
 */
export const resetAllData = asyncHandler(
  async (req: Request, res: Response) => {
    await dataService.resetAllData();

    res.status(200).json({
      success: true,
      message: "All data has been reset successfully",
    });
  }
);

/**
 * Update settings
 * @route PUT /api/settings
 */
export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const settingsData: Partial<Settings> = req.body;

    // Validate settings data
    if (
      settingsData.theme &&
      !["light", "dark", "system"].includes(settingsData.theme)
    ) {
      throw new AppError(
        "Invalid theme value. Must be 'light', 'dark', or 'system'",
        400
      );
    }

    if (
      settingsData.notifications?.reminderTime &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(
        settingsData.notifications.reminderTime
      )
    ) {
      throw new AppError(
        "Invalid reminder time format. Must be in HH:MM format",
        400
      );
    }

    const updatedSettings = await dataService.updateSettings(settingsData);

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  }
);
