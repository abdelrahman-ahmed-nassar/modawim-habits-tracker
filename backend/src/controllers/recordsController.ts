import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import { isValidDateFormat } from "../utils/validation";
import {
  getDatesBetween,
  parseDate,
  formatDateToString,
  isDateActiveForHabit,
} from "../utils/dateUtils";
import type { AuthenticatedRequest } from "../types/auth";

/**
 * Get all completions for a specific date
 * @route GET /api/records/daily/:date
 */
export const getDailyRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const userId = req.user!._id;

    // Use DB-level userId + isActive filter (uses compound index)
    const activeHabits = await dataService.getActiveHabitsByUserId(userId);
    const completions = await dataService.getCompletionsByUserId(userId);

    const dailyCompletions = completions.filter((c) => c.date === date);

    // Filter completions to only include active habits
    const activeCompletions = dailyCompletions.filter((completion) =>
      activeHabits.some(
        (habit) => habit._id.toString() === completion.habitId.toString()
      )
    );

    // Combine completions with habit details
    const recordsWithDetails = await Promise.all(
      activeCompletions.map(async (completion) => {
        const habit = activeHabits.find(
          (h) => h._id.toString() === completion.habitId.toString()
        );
        return {
          ...completion,
          habitName: habit ? habit.name : "Unknown Habit",
          habitTag: habit ? habit.tag : "",
          goalValue: habit ? habit.goalValue : 0,
        };
      })
    );

    // Calculate completion percentages
    const completedHabits = new Set(
      activeCompletions
        .filter((c) => c.completed)
        .map((c) => c.habitId.toString())
    );

    // Only count habits that should be active on this date based on repetition
    const relevantHabits = activeHabits.filter((habit) => {
      return isDateActiveForHabit(date, habit.repetition, habit.specificDays);
    });

    const completionRate =
      relevantHabits.length > 0
        ? relevantHabits.filter((h) => completedHabits.has(h._id.toString()))
            .length / relevantHabits.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        date,
        records: recordsWithDetails,
        stats: {
          totalHabits: relevantHabits.length,
          completedHabits: completedHabits.size,
          completionRate,
        },
      },
    });
  }
);

/**
 * Get week's completion data
 * @route GET /api/records/weekly/:startDate
 */
export const getWeeklyRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { startDate } = req.params;

    // Validate date format
    if (!isValidDateFormat(startDate)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Calculate end date (start date + 6 days)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = formatDateToString(end);

    // Get date range
    const dateRange = getDatesBetween(startDate, endDate);

    const userId = req.user!._id;

    // Use DB-level userId + isActive filter (uses compound index)
    const activeHabits = await dataService.getActiveHabitsByUserId(userId);
    const activeHabitIds = new Set(activeHabits.map((h) => h._id.toString()));

    const completions = await dataService.getCompletionsByUserId(userId);
    const weeklyCompletions = completions.filter(
      (c) => c.date >= startDate && c.date <= endDate
    );

    // Filter completions to only include active habits
    const activeWeeklyCompletions = weeklyCompletions.filter((completion) =>
      activeHabitIds.has(completion.habitId.toString())
    ); // Create daily stats
    const dailyRecords = await Promise.all(
      dateRange.map(async (date) => {
        const dayCompletions = activeWeeklyCompletions.filter(
          (c) => c.date === date
        );
        const recordsWithDetails = await Promise.all(
          activeHabits.map(async (habit) => {
            const completion = dayCompletions.find(
              (c) => c.habitId.toString() === habit._id.toString()
            );
            const isRelevant = isDateActiveForHabit(
              date,
              habit.repetition,
              habit.specificDays
            );

            if (!isRelevant) return null;

            const isCompleted = completion ? completion.completed : false;

            return {
              id: completion?.id || `temp-${date}-${habit._id}`,
              habitId: habit._id,
              date,
              completed: isCompleted,
              completedAt: completion?.completedAt || "",
              habitName: habit.name,
              habitTag: habit.tag,
              goalValue: habit.goalValue,
              currentStreak: habit.currentStreak || 0,
              bestStreak: habit.bestStreak || 0,
              currentCounter: habit.currentCounter || 0,
            };
          })
        );

        const filteredRecords = recordsWithDetails.filter(
          (r): r is NonNullable<typeof r> => r !== null
        );
        const completedHabits = filteredRecords.filter(
          (r) => r.completed
        ).length;

        return {
          date,
          records: filteredRecords,
          stats: {
            totalHabits: filteredRecords.length,
            completedHabits,
            completionRate:
              filteredRecords.length > 0
                ? completedHabits / filteredRecords.length
                : 0,
          },
        };
      })
    );

    // Calculate weekly stats from daily records
    const weeklyStats = {
      averageCompletionRate:
        dailyRecords.reduce((sum, day) => sum + day.stats.completionRate, 0) /
        dailyRecords.length,
      totalCompletions: dailyRecords.reduce(
        (sum, day) => sum + day.stats.completedHabits,
        0
      ),
      mostProductiveDay: dailyRecords.reduce(
        (best, current) =>
          current.stats.completionRate > best.stats.completionRate
            ? current
            : best,
        dailyRecords[0]
      ).date,
    }; // Get habit-specific stats
    const habitStats = await Promise.all(
      activeHabits.map(async (habit) => {
        const habitCompletions = activeWeeklyCompletions.filter(
          (c) => c.habitId.toString() === habit._id.toString()
        );

        const completedCompletions = habitCompletions.filter(
          (c) => c.completed
        );

        // Calculate how many days this habit should have been active
        const activeDates = dateRange.filter((date) =>
          isDateActiveForHabit(date, habit.repetition, habit.specificDays)
        );

        return {
          habitId: habit._id,
          habitName: habit.name,
          goalValue: habit.goalValue,
          successRate:
            activeDates.length > 0
              ? completedCompletions.length / activeDates.length
              : 0,
          completedDates: completedCompletions.map((c) => c.date),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        records: dailyRecords,
        weeklyStats,
        habitStats,
      },
    });
  }
);

/**
 * Get month's completion data
 * @route GET /api/records/monthly/:year/:month
 */
export const getMonthlyRecords = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { year, month } = req.params;

    // Validate year and month
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1; // JS months are 0-indexed

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
      throw new AppError("Invalid year or month. Month should be 1-12", 400);
    }

    // Calculate start and end dates for the month
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0); // Last day of month

    const startDateStr = formatDateToString(startDate);
    const endDateStr = formatDateToString(endDate);

    // Get date range for the month
    const dateRange = getDatesBetween(startDateStr, endDateStr);

    const userId = req.user!._id;

    // Use DB-level userId + isActive filter (uses compound index)
    const activeHabits = await dataService.getActiveHabitsByUserId(userId);
    const activeHabitIds = new Set(activeHabits.map((h) => h._id.toString()));

    const completions = await dataService.getCompletionsByUserId(userId);
    const monthlyCompletions = completions.filter(
      (c) => c.date >= startDateStr && c.date <= endDateStr
    );

    const activeMonthlyCompletions = monthlyCompletions.filter((completion) =>
      activeHabitIds.has(completion.habitId.toString())
    );
    const dailyCompletionCounts = dateRange.map((date) => {
      const dayCompletions = activeMonthlyCompletions.filter(
        (c) => c.date === date && c.completed
      );
      return { date, count: dayCompletions.length };
    });

    // Calculate completion percentage for each habit
    // NOTE: We already have streak info from activeHabits - no need for extra DB calls
    const habitStats = activeHabits.map((habit) => {
      // Filter completions for this habit
      const habitCompletions = activeMonthlyCompletions.filter(
        (c) => c.habitId.toString() === habit._id.toString()
      );

      // Get dates when this habit should be active
      const activeDates = dateRange.filter((date) =>
        isDateActiveForHabit(date, habit.repetition, habit.specificDays)
      );

      // Calculate completion rate
      const completedDates = habitCompletions
        .filter((c) => c.completed)
        .map((c) => c.date);

      const completionRate =
        activeDates.length > 0 ? completedDates.length / activeDates.length : 0;

      // Use streak info already available from activeHabits (no extra DB call needed)
      return {
        habitId: habit._id,
        habitName: habit.name,
        habitTag: habit.tag,
        completionRate,
        completedDates,
        currentStreak: habit.currentStreak || 0,
        bestStreak: habit.bestStreak || 0,
      };
    }); // Calculate overall monthly stats
    const monthlyStats = {
      totalHabits: activeHabits.length,
      totalCompletions: activeMonthlyCompletions.filter((c) => c.completed)
        .length,
      // Overall completion rate across all habits and days
      overallCompletionRate:
        habitStats.reduce((sum, h) => sum + h.completionRate, 0) /
        (habitStats.length || 1),
      mostProductiveHabit:
        habitStats.sort((a, b) => b.completionRate - a.completionRate)[0]
          ?.habitName || "None",
      bestStreakHabit:
        habitStats.sort((a, b) => b.bestStreak - a.bestStreak)[0]?.habitName ||
        "None",
    };

    res.status(200).json({
      success: true,
      data: {
        year,
        month: monthNum + 1,
        startDate: startDateStr,
        endDate: endDateStr,
        dailyCompletionCounts,
        habitStats,
        monthlyStats,
      },
    });
  }
);
