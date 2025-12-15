import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreateHabitDto, Habit } from "@shared/types";
import { ValidationError } from "../types/models";
import { validateHabitCreate } from "../utils/validation";
import { getTodayDateString } from "../utils/dateUtils";
import { filterAndSortHabits, parseSortString } from "../utils/habitUtils";
import * as dataService from "../services/dataService";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import type { AuthenticatedRequest } from "../types/auth";

/**
 * Get all habits
 * @route GET /api/habits
 */
export const getAllHabits = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const allHabits = await dataService.getHabits();
    const userId = req.user!.id;
    const habits = allHabits.filter((h) => h.userId === userId);

    // Parse query params for filtering and sorting
    let { sort, filter, tag, active } = req.query;

    // Always filter out inactive habits unless explicitly requested
    if (active === undefined) {
      active = "true";
    }

    // Set up filter options
    const filterOptions: {
      searchTerm?: string;
      tag?: string;
      isActive?: boolean;
      sortField?: keyof Habit;
      sortDirection?: "asc" | "desc";
    } = {};

    // Process search term
    if (filter && typeof filter === "string") {
      filterOptions.searchTerm = filter;
    }

    // Process tag filter
    if (tag && typeof tag === "string") {
      filterOptions.tag = tag;
    }

    // Process active status filter
    if (active !== undefined) {
      if (active === "all") {
        // Don't filter by active status when "all" is specified
        filterOptions.isActive = undefined;
      } else {
        filterOptions.isActive = active === "true";
      }
    }

    // Process sorting
    if (sort && typeof sort === "string") {
      const [sortField, sortDirection] = parseSortString(sort);
      filterOptions.sortField = sortField;
      filterOptions.sortDirection = sortDirection;
    }

    // Apply filters and sorting
    const filteredHabits = filterAndSortHabits(habits, filterOptions);

    res.status(200).json({
      success: true,
      data: filteredHabits,
    });
  }
);

/**
 * Get a habit by ID
 * @route GET /api/habits/:id
 */
export const getHabitById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const habit = await dataService.getHabitById(id);

    if (!habit || habit.userId !== req.user!.id) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    res.status(200).json({
      success: true,
      data: habit,
      ...(habit.isActive === false && {
        warning: "This habit is currently inactive",
      }),
    });
  }
);

/**
 * Create a new habit
 * @route POST /api/habits
 */
export const createHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const habitData: CreateHabitDto = req.body;

  // Validate habit data
    const errors = validateHabitCreate(habitData);

    if (errors.length > 0) {
      throw new AppError("Invalid habit data", 400, errors);
    }

    const userId = req.user!.id;

    const habit = await dataService.createHabit({
      userId,
      ...habitData,
    });

    res.status(201).json({
      success: true,
      data: habit,
      message: "Habit created successfully",
    });
  }
);

/**
 * Update a habit
 * @route PUT /api/habits/:id
 */
export const updateHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const habitData: Partial<Habit> = req.body;

  // Validate the update data
  if (habitData.name !== undefined && habitData.name.trim() === "") {
    throw new AppError("Name cannot be empty", 400);
  }

  // Find existing habit
  const existingHabit = await dataService.getHabitById(id);

  if (!existingHabit || existingHabit.userId !== req.user!.id) {
    throw new AppError(`Habit with ID ${id} not found`, 404);
  }

  // Prevent changing ownership
  const { userId: _ignoreUserId, ...rest } = habitData;

  const updatedHabit = await dataService.updateHabit(id, rest);

  res.status(200).json({
    success: true,
    data: updatedHabit,
    message: "Habit updated successfully",
  });
});

/**
 * Delete a habit
 * @route DELETE /api/habits/:id
 */
export const deleteHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const existingHabit = await dataService.getHabitById(id);

    if (!existingHabit || existingHabit.userId !== req.user!.id) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

  // Delete habit
    await dataService.deleteHabit(id);

  // Delete associated completion records
  // This would normally be in a transaction but we'll handle it separately
  const completions = await dataService.getCompletionsByHabitId(id);
  if (completions.length > 0) {
    // We need to remove completions for this habit from the completions file
    const allCompletions = await dataService.getCompletions();
    const updatedCompletions = allCompletions.filter((c) => c.habitId !== id);
    await dataService.replaceAllCompletions(updatedCompletions);
  }

    res.status(200).json({
      success: true,
      message: "Habit and associated records deleted successfully",
    });
  }
);

/**
 * Archive a habit (make it inactive)
 * @route POST /api/habits/:id/archive
 */
export const archiveHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Find existing habit
    const existingHabit = await dataService.getHabitById(id);

    if (!existingHabit || existingHabit.userId !== req.user!.id) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Update the habit to be inactive
    const updatedHabit = await dataService.updateHabit(id, { isActive: false });

    res.status(200).json({
      success: true,
      data: updatedHabit,
      message: "Habit archived successfully",
    });
  }
);

/**
 * Restore a habit (make it active)
 * @route POST /api/habits/:id/restore
 */
export const restoreHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Find existing habit
    const existingHabit = await dataService.getHabitById(id);

    if (!existingHabit || existingHabit.userId !== req.user!.id) {
      throw new AppError(`Habit with ID ${id} not found`, 404);
    }

    // Update the habit to be active
    const updatedHabit = await dataService.updateHabit(id, { isActive: true });

    res.status(200).json({
      success: true,
      data: updatedHabit,
      message: "Habit restored successfully",
    });
  }
);

/**
 * Get a random habit
 * @route GET /api/habits/random/pick
 */
export const getRandomHabit = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const allHabits = await dataService.getHabits();
    const userId = req.user!.id;
    const habits = allHabits.filter((h) => h.userId === userId);

    // Filter to active habits only
    const activeHabits = habits.filter((habit) => habit.isActive !== false);

    if (activeHabits.length === 0) {
      throw new AppError("No active habits found", 404);
    }

    // Get a random habit
    const randomIndex = Math.floor(Math.random() * activeHabits.length);
    const randomHabit = activeHabits[randomIndex];

    res.status(200).json({
      success: true,
      data: randomHabit,
    });
  }
);

/**
 * Recalculate analytics for all habits or a specific habit
 * @route POST /api/habits/sync-analytics
 * @route POST /api/habits/:id/sync-analytics
 */
export const syncHabitAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (id) {
      // Sync analytics for a specific habit
      const habit = await dataService.getHabitById(id);

      if (!habit || habit.userId !== req.user!.id) {
        throw new AppError(`Habit with ID ${id} not found`, 404);
      }

      // Recalculate streaks and counter for this habit
      await dataService.updateHabitStreaks(id);

      // Get the updated habit
      const updatedHabit = await dataService.getHabitById(id);

      res.status(200).json({
        success: true,
        data: updatedHabit,
        message: "Habit analytics synced successfully",
      });
    } else {
      // Sync analytics for all habits
      const allHabits = await dataService.getHabits();
      const habits = allHabits.filter((h) => h.userId === req.user!.id);
      let syncedCount = 0;
      let errorCount = 0;

      // Recalculate streaks for all habits
      for (const habit of habits) {
        try {
          await dataService.updateHabitStreaks(habit.id);
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing habit ${habit.id}:`, error);
          errorCount++;
        }
      }

      // Get updated habits
      const updatedHabits = await dataService.getHabits();

      res.status(200).json({
        success: true,
        data: updatedHabits,
        message: `Analytics synced for ${syncedCount} habits${
          errorCount > 0 ? `, ${errorCount} errors` : ""
        }`,
      });
    }
  }
);

/**
 * Reorder habits
 * @route PUT /api/habits/reorder
 * @body { habitIds: string[] } - Array of habit IDs in desired order
 */
export const reorderHabits = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { habitIds } = req.body;

    if (!Array.isArray(habitIds)) {
      throw new AppError("habitIds must be an array", 400);
    }

    // Get all habits for this user
    const allHabits = await dataService.getHabits();
    const habits = allHabits.filter((h) => h.userId === req.user!.id);

    // Validate that all IDs exist
    const habitIdSet = new Set(habits.map((h) => h.id));
    const invalidIds = habitIds.filter((id) => !habitIdSet.has(id));

    if (invalidIds.length > 0) {
      throw new AppError(`Invalid habit IDs: ${invalidIds.join(", ")}`, 400);
    }

    // Update order for each habit
    const updatedHabits = habits.map((habit) => {
      const orderIndex = habitIds.indexOf(habit.id);
      return {
        ...habit,
        order: orderIndex !== -1 ? orderIndex : habit.order || 999,
      };
    });

    // Save updated habits
    await dataService.replaceAllHabits(updatedHabits);

    res.status(200).json({
      success: true,
      data: updatedHabits,
      message: "Habits reordered successfully",
    });
  }
);
