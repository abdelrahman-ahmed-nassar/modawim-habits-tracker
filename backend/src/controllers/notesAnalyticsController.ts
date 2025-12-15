import { Request, Response } from "express";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import * as dataService from "../services/dataService";
import * as optionsService from "../services/optionsService";
import { isValidDateFormat } from "../utils/validation";
import type { AuthenticatedRequest } from "../types/auth";

/**
 * Get notes analytics overview
 * @route GET /api/notes/analytics/overview
 */
export const getNotesAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const allNotes = await dataService.getNotes();
    const notes = allNotes.filter((n) => n.userId === userId);
    const moodOptions = await optionsService.getMoods(userId);
    const productivityOptions =
      await optionsService.getProductivityLevels(userId);

    // Create lookups for mood and productivity values
    const moodValueMap = new Map(moodOptions.map((m) => [m.label, m.value]));
    const productivityValueMap = new Map(
      productivityOptions.map((p) => [p.label, p.value])
    );

    // Calculate basic statistics
    const totalNotes = notes.length;
    const notesWithMood = notes.filter((n) => n.mood).length;
    const notesWithProductivity = notes.filter(
      (n) => n.productivityLevel
    ).length;

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    const moodValues: number[] = [];
    notes.forEach((note) => {
      if (note.mood) {
        moodCounts[note.mood] = (moodCounts[note.mood] || 0) + 1;
        if (moodValueMap.has(note.mood)) {
          moodValues.push(moodValueMap.get(note.mood) || 0);
        }
      }
    });

    // Calculate average mood value (if available)
    const avgMoodValue =
      moodValues.length > 0
        ? Math.round(
            (moodValues.reduce((sum, val) => sum + val, 0) /
              moodValues.length) *
              10
          ) / 10
        : null;

    // Calculate productivity distribution
    const productivityCounts: Record<string, number> = {};
    const productivityValues: number[] = [];
    notes.forEach((note) => {
      if (note.productivityLevel) {
        productivityCounts[note.productivityLevel] =
          (productivityCounts[note.productivityLevel] || 0) + 1;
        if (productivityValueMap.has(note.productivityLevel)) {
          productivityValues.push(
            productivityValueMap.get(note.productivityLevel) || 0
          );
        }
      }
    });

    // Calculate average productivity value (if available)
    const avgProductivityValue =
      productivityValues.length > 0
        ? Math.round(
            (productivityValues.reduce((sum, val) => sum + val, 0) /
              productivityValues.length) *
              10
          ) / 10
        : null; // Calculate monthly note frequency
    const monthlyFrequency: Record<string, number> = {};
    notes.forEach((note) => {
      const yearMonth = note.date.substring(0, 7); // YYYY-MM
      monthlyFrequency[yearMonth] = (monthlyFrequency[yearMonth] || 0) + 1;
    });

    // Calculate monthly mood and productivity scores
    const monthlyMoodScores: Record<
      string,
      { avg: number; count: number; sum: number }
    > = {};
    const monthlyProductivityScores: Record<
      string,
      { avg: number; count: number; sum: number }
    > = {};

    notes.forEach((note) => {
      if (note.date) {
        const monthKey = note.date.substring(0, 7); // YYYY-MM

        // Process mood data
        if (note.mood && moodValueMap.has(note.mood)) {
          if (!monthlyMoodScores[monthKey]) {
            monthlyMoodScores[monthKey] = { avg: 0, count: 0, sum: 0 };
          }
          monthlyMoodScores[monthKey].count++;
          monthlyMoodScores[monthKey].sum += moodValueMap.get(note.mood) || 0;
        }

        // Process productivity data
        if (
          note.productivityLevel &&
          productivityValueMap.has(note.productivityLevel)
        ) {
          if (!monthlyProductivityScores[monthKey]) {
            monthlyProductivityScores[monthKey] = { avg: 0, count: 0, sum: 0 };
          }
          monthlyProductivityScores[monthKey].count++;
          monthlyProductivityScores[monthKey].sum +=
            productivityValueMap.get(note.productivityLevel) || 0;
        }
      }
    });

    // Calculate averages
    Object.keys(monthlyMoodScores).forEach((month) => {
      const data = monthlyMoodScores[month];
      data.avg = Math.round((data.sum / data.count) * 10) / 10;
    });

    Object.keys(monthlyProductivityScores).forEach((month) => {
      const data = monthlyProductivityScores[month];
      data.avg = Math.round((data.sum / data.count) * 10) / 10;
    });

    // Calculate average content length
    const avgContentLength =
      notes.length > 0
        ? Math.round(
            notes.reduce((sum, note) => sum + note.content.length, 0) /
              notes.length
          )
        : 0;

    // Find longest streak of consecutive days with notes
    const dateSet = new Set(notes.map((note) => note.date));
    let currentStreak = 0;
    let longestStreak = 0;

    // Sort dates in ascending order
    const sortedDates = Array.from(dateSet).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        longestStreak = 1;
        continue;
      }

      const currDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);

      // Check if dates are consecutive
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    } // Send the analytics data
    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        notesWithMood,
        notesWithProductivity,
        moodDistribution: moodCounts,
        productivityDistribution: productivityCounts,
        monthlyFrequency,
        avgContentLength,
        avgMoodValue,
        avgProductivityValue,
        longestStreak,
        currentStreak,
        moodValueMap: Object.fromEntries(moodValueMap),
        productivityValueMap: Object.fromEntries(productivityValueMap),
        monthlyMoodScores,
        monthlyProductivityScores,
        completionRate: {
          mood:
            totalNotes > 0 ? Math.round((notesWithMood / totalNotes) * 100) : 0,
          productivity:
            totalNotes > 0
              ? Math.round((notesWithProductivity / totalNotes) * 100)
              : 0,
        },
      },
    });
  }
);

/**
 * Get mood trends over time
 * @route GET /api/notes/analytics/mood-trends
 */
export const getMoodTrends = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const allNotes = await dataService.getNotes();
    const notes = allNotes.filter((n) => n.userId === userId);
    const moodOptions = await optionsService.getMoods(userId);

    // Create lookup for mood values
    const moodValueMap = new Map(moodOptions.map((m) => [m.label, m.value]));

    // Filter notes with mood data
    const notesWithMood = notes.filter((note) => note.mood);

    // Group by month
    const monthlyMoodData: Record<
      string,
      { count: number; sum: number; values: number[] }
    > = {};

    notesWithMood.forEach((note) => {
      const yearMonth = note.date.substring(0, 7); // YYYY-MM format
      if (!monthlyMoodData[yearMonth]) {
        monthlyMoodData[yearMonth] = { count: 0, sum: 0, values: [] };
      }

      const moodValue = moodValueMap.get(note.mood!) || 0;
      monthlyMoodData[yearMonth].count++;
      monthlyMoodData[yearMonth].sum += moodValue;
      monthlyMoodData[yearMonth].values.push(moodValue);
    });

    // Calculate average mood per month
    const moodTrends = Object.entries(monthlyMoodData)
      .map(([month, data]) => ({
        month,
        averageMood: Math.round((data.sum / data.count) * 10) / 10,
        count: data.count,
        distribution: moodOptions.map((mood) => {
          const count = notesWithMood.filter(
            (note) => note.date.startsWith(month) && note.mood === mood.label
          ).length;
          return {
            label: mood.label,
            value: mood.value,
            count,
          };
        }),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      success: true,
      data: {
        trends: moodTrends,
        moodValueMap: Object.fromEntries(moodValueMap),
      },
    });
  }
);

/**
 * Get productivity correlation with habits
 * @route GET /api/notes/analytics/productivity-correlation
 */
export const getProductivityCorrelation = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const allNotes = await dataService.getNotes();
    const notes = allNotes.filter((n) => n.userId === userId);

    const allHabits = await dataService.getHabits();
    const habits = allHabits.filter((h) => h.userId === userId);

    const allCompletions = await dataService.getCompletions();
    const habitIds = new Set(habits.map((h) => h.id));
    const completions = allCompletions.filter((c) => habitIds.has(c.habitId));
    const productivityOptions =
      await optionsService.getProductivityLevels(userId);

    // Create lookup for productivity values
    const productivityValueMap = new Map(
      productivityOptions.map((p) => [p.label, p.value])
    );

    // Filter notes with productivity data
    const notesWithProductivity = notes.filter(
      (note) => note.productivityLevel
    );

    // Create a map of date to productivity level
    const dateToProductivityMap = new Map(
      notesWithProductivity.map((note) => [
        note.date,
        {
          level: note.productivityLevel!,
          value: productivityValueMap.get(note.productivityLevel!) || 0,
        },
      ])
    );

    // Group completions by habit and date
    const habitCompletions = new Map();
    completions.forEach((completion) => {
      const key = `${completion.habitId}-${completion.date}`;
      habitCompletions.set(key, true);
    });

    // Calculate correlation between habit completion and productivity
    const correlationData = habits
      .map((habit) => {
        const datesWithCompletion: string[] = [];
        const datesWithoutCompletion: string[] = [];

        // Find all dates where this habit was completed or not
        Array.from(dateToProductivityMap.keys()).forEach((date) => {
          const key = `${habit.id}-${date}`;
          if (habitCompletions.has(key)) {
            datesWithCompletion.push(date);
          } else {
            datesWithoutCompletion.push(date);
          }
        });

        // Calculate average productivity when habit was completed
        let avgProductivityWithCompletion = null;
        if (datesWithCompletion.length > 0) {
          const sum = datesWithCompletion.reduce(
            (total, date) =>
              total + (dateToProductivityMap.get(date)?.value || 0),
            0
          );
          avgProductivityWithCompletion =
            Math.round((sum / datesWithCompletion.length) * 10) / 10;
        }

        // Calculate average productivity when habit was not completed
        let avgProductivityWithoutCompletion = null;
        if (datesWithoutCompletion.length > 0) {
          const sum = datesWithoutCompletion.reduce(
            (total, date) =>
              total + (dateToProductivityMap.get(date)?.value || 0),
            0
          );
          avgProductivityWithoutCompletion =
            Math.round((sum / datesWithoutCompletion.length) * 10) / 10;
        }

        // Calculate difference in productivity (impact)
        let productivityImpact = null;
        if (
          avgProductivityWithCompletion !== null &&
          avgProductivityWithoutCompletion !== null
        ) {
          productivityImpact =
            Math.round(
              (avgProductivityWithCompletion -
                avgProductivityWithoutCompletion) *
                10
            ) / 10;
        }

        return {
          habitId: habit.id,
          habitName: habit.name,
          datesCompletedCount: datesWithCompletion.length,
          datesNotCompletedCount: datesWithoutCompletion.length,
          avgProductivityWithCompletion,
          avgProductivityWithoutCompletion,
          productivityImpact,
        };
      })
      .filter(
        (item) =>
          item.datesCompletedCount > 0 || item.datesNotCompletedCount > 0
      )
      .sort((a, b) => {
        // Sort by impact (descending) if available, otherwise by habit name
        if (a.productivityImpact !== null && b.productivityImpact !== null) {
          return b.productivityImpact - a.productivityImpact;
        }
        return a.habitName.localeCompare(b.habitName);
      });

    res.status(200).json({
      success: true,
      data: {
        correlations: correlationData,
        productivityValueMap: Object.fromEntries(productivityValueMap),
      },
    });
  }
);

/**
 * Get notes calendar data for a specific month
 * @route GET /api/notes/calendar/:year/:month
 */
export const getNotesCalendar = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { year, month } = req.params;

    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError("Invalid year or month format", 400);
    }

    // Format month to ensure it has leading zero if needed
    const monthFormatted = monthNum.toString().padStart(2, "0");
    const yearMonthPrefix = `${yearNum}-${monthFormatted}`;

    const userId = req.user!.id;

    const allNotes = await dataService.getNotes();
    const notes = allNotes.filter((n) => n.userId === userId);
    const moodOptions = await optionsService.getMoods(userId);
    const productivityOptions =
      await optionsService.getProductivityLevels(userId);

    // Create lookups for mood and productivity values
    const moodValueMap = new Map(moodOptions.map((m) => [m.label, m.value]));
    const productivityValueMap = new Map(
      productivityOptions.map((p) => [p.label, p.value])
    );

    // Filter notes for the specified month
    const monthNotes = notes.filter((note) =>
      note.date.startsWith(yearMonthPrefix)
    );

    // Create calendar data
    const calendarData = monthNotes.map((note) => {
      const dayOfMonth = parseInt(note.date.split("-")[2]);
      const moodValue = note.mood ? moodValueMap.get(note.mood) : null;
      const productivityValue = note.productivityLevel
        ? productivityValueMap.get(note.productivityLevel)
        : null;

      return {
        date: note.date,
        dayOfMonth,
        id: note.id,
        hasContent: note.content.length > 0,
        contentPreview:
          note.content.length > 100
            ? note.content.substring(0, 100) + "..."
            : note.content,
        mood: note.mood,
        moodValue,
        productivityLevel: note.productivityLevel,
        productivityValue,
        updatedAt: note.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        month: monthNum,
        notes: calendarData,
        moodValueMap: Object.fromEntries(moodValueMap),
        productivityValueMap: Object.fromEntries(productivityValueMap),
      },
    });
  }
);
