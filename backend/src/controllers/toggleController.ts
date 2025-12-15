import { Request, Response } from "express";
import { CompletionRecord } from "@shared/types";
import { validateCompletion } from "../utils/validation";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat } from "../utils/validation";

/**
 * Toggle a habit's completion status for a date
 * @route POST /api/completions/toggle
 */
export const toggleHabitCompletion = asyncHandler(
  async (req: Request, res: Response) => {
    const { habitId, date } = req.body;

    // Basic validation
    if (!habitId) {
      throw new AppError("Habit ID is required", 400);
    }

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Check if habit exists
    const habit = await dataService.getHabitById(habitId);
    if (!habit) {
      throw new AppError(`Habit with ID ${habitId} not found`, 404);
    }

    // Get existing completion if any
    const completions = await dataService.getCompletionsByHabitId(habitId);
    const existingCompletion = completions.find((c) => c.date === date);

    // Create completion data with toggled status
    const completionData: Omit<CompletionRecord, "id" | "completedAt"> = {
      habitId,
      date,
      completed: existingCompletion ? !existingCompletion.completed : true,
    };

    // Save completion
    const completion = await dataService.createCompletion(completionData);

    // Update the habit streaks after completion
    await dataService.updateHabitStreaks(habitId);

    res.status(200).json({
      success: true,
      data: completion,
      message:
        "Habit marked as " +
        (completion.completed ? "completed" : "incomplete"),
    });
  }
);
