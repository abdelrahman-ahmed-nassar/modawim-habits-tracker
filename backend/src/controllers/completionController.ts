import { Request, Response } from "express";
import { CompletionRecord } from "@shared/types";
import { validateCompletion } from "../utils/validation";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { isValidDateFormat } from "../utils/validation";
import type { AuthenticatedRequest } from "../types/auth";

/**
 * Get completion records for a specific date
 * @route GET /api/completions/date/:date
 */
export const getDailyCompletions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const userId = req.user!._id;

    // Use DB-level filters for userId + isActive and userId + date
    const activeHabits = await dataService.getActiveHabitsByUserId(userId);
    const activeHabitIds = new Set(activeHabits.map((h) => h._id.toString()));

    // Get completions for this user and date (uses compound query)
    const completions = await dataService.getCompletionsByUserIdAndDate(
      userId,
      date
    );

    // Filter to only include active habits
    const filteredCompletions = completions.filter((c: CompletionRecord) =>
      activeHabitIds.has(c.habitId.toString())
    );

    res.status(200).json({
      success: true,
      data: filteredCompletions,
    });
  }
);

/**
 * Get completion records for a habit
 * @route GET /api/habits/:id/records
 */
export const getHabitCompletions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    const habit = await dataService.getHabitById(habitId);
    if (!habit || habit.userId.toString() !== req.user!._id.toString()) {
      throw new AppError(`Habit with ID ${habitId} not found`, 404);
    }

    // Check if habit is active
    if (!habit.isActive) {
      return res.status(200).json({
        success: true,
        data: [],
        warning:
          "This habit is inactive and its completions are not being tracked",
      });
    }

    // Get completion records for this habit
    let completions = await dataService.getCompletionsByHabitId(habitId);

    // Filter by date range if provided
    if (startDate && typeof startDate === "string") {
      completions = completions.filter((c) => c.date >= startDate);
    }

    if (endDate && typeof endDate === "string") {
      completions = completions.filter((c) => c.date <= endDate);
    }

    // Sort by date (most recent first)
    completions.sort((a, b) => b.date.localeCompare(a.date));

    res.status(200).json({
      success: true,
      data: completions,
    });
  }
);

/**
 * Mark a habit as complete/incomplete for a date
 * @route POST /api/habits/:id/complete
 */
export const markHabitComplete = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { date, completed, habitId } = req.body;

    // Use habitId from body if id param is not provided (for /completions endpoints)
    const targetHabitId = id || habitId;

    // Basic validation
    if (!targetHabitId) {
      throw new AppError("Habit ID is required", 400);
    }

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    const habit = await dataService.getHabitById(targetHabitId);
    if (!habit || habit.userId.toString() !== req.user!._id.toString()) {
      throw new AppError(`Habit with ID ${targetHabitId} not found`, 404);
    }

    // Prevent marking inactive habits as complete
    if (!habit.isActive) {
      throw new AppError(`Cannot mark inactive habit as complete`, 400);
    }

    // Create completion data
    const completionData: Omit<CompletionRecord, "id" | "completedAt"> = {
      habitId: targetHabitId,
      date,
      completed: completed !== undefined ? completed : true,
    };

    // Validate completion data
    const errors = validateCompletion(completionData);
    if (errors.length > 0) {
      throw new AppError("Invalid completion data", 400, errors);
    }

    // Save completion
    const completion = await dataService.createCompletion(completionData);

    // Update the habit streaks after completion
    await dataService.updateHabitStreaks(targetHabitId);

    res.status(200).json({
      success: true,
      data: completion,
      message:
        "Habit marked as " +
        (completion.completed ? "completed" : "incomplete"),
    });
  }
);

/**
 * Delete a completion record for a specific date
 * @route DELETE /api/habits/:id/complete/:date
 */
export const deleteCompletion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id, date, habitId } = req.params;

    // Use habitId or id parameter
    const targetHabitId = habitId || id;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const habit = await dataService.getHabitById(targetHabitId);
    if (!habit || habit.userId.toString() !== req.user!._id.toString()) {
      throw new AppError(`Habit with ID ${targetHabitId} not found`, 404);
    }

    // Prevent deleting completions for inactive habits
    if (!habit.isActive) {
      throw new AppError(`Cannot modify completions for inactive habits`, 400);
    }

    // Check if completion record exists
    const completions = await dataService.getCompletionsByHabitId(
      targetHabitId
    );
    const completionRecord = completions.find((c) => c.date === date);

    if (!completionRecord) {
      throw new AppError(
        `No completion record found for habit ${targetHabitId} on date ${date}`,
        404
      );
    }

    // Delete the completion record
    const success = await dataService.deleteCompletion(completionRecord.id);

    if (!success) {
      throw new AppError("Failed to delete completion record", 500);
    }

    // Update the habit streaks after deletion
    await dataService.updateHabitStreaks(targetHabitId);

    res.status(200).json({
      success: true,
      message: `Completion record for habit ${targetHabitId} on date ${date} deleted successfully`,
    });
  }
);

/**
 * Get completion records for a date range
 * @route GET /api/completions/range/:startDate/:endDate
 */
export const getCompletionsInRange = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = req.params;

    // Validate date formats
    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const userId = req.user!._id;

    // Use DB-level userId filter (uses index)
    const activeHabits = await dataService.getActiveHabitsByUserId(userId);
    const activeHabitIds = new Set(activeHabits.map((h) => h._id.toString()));

    // Get completions for this user (uses userId index)
    const completions = await dataService.getCompletionsByUserId(userId);

    // Filter by date range (inclusive) and only include active habits
    const filtered = completions.filter(
      (c) =>
        c.date >= startDate &&
        c.date <= endDate &&
        activeHabitIds.has(c.habitId.toString())
    );

    res.status(200).json({
      success: true,
      data: filtered,
    });
  }
);

/**
 * Update a completion record
 * @route PUT /api/completions/:id
 */
export const updateCompletion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { completed } = req.body;

    // Completion ID format is "habitId-YYYYMMDD", extract habitId
    const [habitId] = id.split("-");
    if (!habitId) {
      throw new AppError(`Invalid completion ID format`, 400);
    }

    // Get the habit to verify ownership
    const habit = await dataService.getHabitById(habitId);
    if (!habit || habit.userId.toString() !== req.user!._id.toString()) {
      throw new AppError(`Habit with ID ${habitId} not found`, 404);
    }

    // Get completions for this specific habit (much more efficient)
    const completions = await dataService.getCompletionsByHabitId(habitId);
    const completion = completions.find((c) => c.id === id);

    if (!completion) {
      throw new AppError(`Completion with ID ${id} not found`, 404);
    }

    // Prevent updating completions for inactive habits
    if (!habit.isActive) {
      throw new AppError(`Cannot update completions for inactive habits`, 400);
    }

    // Determine completion status
    const finalCompleted =
      completed === undefined ? completion.completed : completed;

    // Update completion data
    const updatedCompletion = {
      ...completion,
      completed: finalCompleted,
      completedAt: new Date().toISOString(),
    };

    // Validate updated completion data
    const errors = validateCompletion(updatedCompletion);
    if (errors.length > 0) {
      throw new AppError("Invalid completion data", 400, errors);
    }

    // Save updated completion
    const success = await dataService.updateCompletion(updatedCompletion);
    if (!success) {
      throw new AppError("Failed to update completion record", 500);
    }

    // Update the habit streaks after update
    await dataService.updateHabitStreaks(completion.habitId);

    res.status(200).json({
      success: true,
      data: updatedCompletion,
      message: "Completion record updated successfully",
    });
  }
);

/**
 * Create multiple completion records in a batch
 * @route POST /api/completions/batch
 */
export const createCompletionsBatch = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { completions } = req.body;

    if (!Array.isArray(completions) || completions.length === 0) {
      throw new AppError(
        "Completions array is required and must not be empty",
        400
      );
    } // Validate each completion in the batch
    const validatedCompletions: Array<
      Omit<CompletionRecord, "id" | "completedAt">
    > = [];

    // Get all habits to check active status (uses DB-level filter)
    const userId = req.user!._id;
    const habits = await dataService.getHabitsByUserId(userId);
    const habitMap = new Map(habits.map((h) => [h._id.toString(), h]));

    for (const completionData of completions) {
      const { habitId, date, completed } = completionData;

      // Basic validation
      if (!habitId || !date) {
        throw new AppError("Each completion must have habitId and date", 400);
      }

      // Check if habit exists (from pre-fetched map - no extra DB call)
      const habit = habitMap.get(habitId.toString());
      if (!habit) {
        throw new AppError(`Habit with ID ${habitId} not found`, 404);
      }

      // Skip inactive habits
      if (!habit.isActive) {
        continue; // Skip this completion and move to the next one
      }

      const completionToCreate: Omit<CompletionRecord, "id" | "completedAt"> = {
        habitId,
        date,
        completed: completed !== undefined ? completed : true,
      };

      // Validate completion data
      const errors = validateCompletion(completionToCreate);
      if (errors.length > 0) {
        throw new AppError(
          `Invalid completion data for habit ${habitId}`,
          400,
          errors
        );
      }

      validatedCompletions.push(completionToCreate);
    }

    // Create all completions in a single batch operation
    const createdCompletions = await dataService.createCompletionsBatch(
      validatedCompletions
    );

    res.status(200).json({
      success: true,
      data: createdCompletions,
      message: `${createdCompletions.length} habits marked as complete`,
    });
  }
);
