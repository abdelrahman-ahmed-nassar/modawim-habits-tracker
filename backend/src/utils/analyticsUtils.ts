import { Habit, CompletionRecord } from "@shared/types";
import {
  getDayOfWeek,
  getDatesBetween,
  isDateActiveForHabit,
} from "./dateUtils";

/**
 * Calculate success rate for a habit
 * @param habit The habit
 * @param completions Completions for the habit
 * @param startDate Start date for the period
 * @param endDate End date for the period
 * @returns Success rate (0-1)
 */
export const calculateSuccessRate = (
  habit: Habit,
  completions: CompletionRecord[],
  startDate: string,
  endDate: string
): number => {
  // Get all dates between start and end
  const dateRange = getDatesBetween(startDate, endDate);

  // Filter to dates when the habit should be active
  const activeDates = dateRange.filter((date) =>
    isDateActiveForHabit(date, habit.repetition, habit.specificDays)
  );

  if (activeDates.length === 0) return 0;

  // Count successful completions
  const successfulCompletions = completions.filter(
    (c) => c.date >= startDate && c.date <= endDate && c.completed
  );

  return successfulCompletions.length / activeDates.length;
};

/**
 * Calculate completion stats by day of week
 * @param habit The habit
 * @param completions Completions for the habit
 * @param startDate Start date for the period
 * @param endDate End date for the period
 * @returns Array of completion rates for each day of week (0-6, Sunday-Saturday)
 */
export const calculateDayOfWeekStats = (
  habit: Habit,
  completions: CompletionRecord[],
  startDate: string,
  endDate: string
): {
  dayOfWeek: number;
  successRate: number;
  totalDays: number;
  completedDays: number;
}[] => {
  // Get all dates between start and end
  const dateRange = getDatesBetween(startDate, endDate);

  // Initialize counters for each day of week
  const stats = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    totalDays: 0,
    completedDays: 0,
    successRate: 0,
  }));

  // Count active days and completions for each day of week
  dateRange.forEach((date) => {
    if (isDateActiveForHabit(date, habit.repetition, habit.specificDays)) {
      const dayOfWeek = getDayOfWeek(date);
      stats[dayOfWeek].totalDays++;

      // Check if there's a successful completion for this date
      const completion = completions.find((c) => c.date === date);
      if (completion && completion.completed) {
        stats[dayOfWeek].completedDays++;
      }
    }
  });

  // Calculate success rates
  stats.forEach((day) => {
    day.successRate = day.totalDays > 0 ? day.completedDays / day.totalDays : 0;
  });

  return stats;
};

/**
 * Find best and worst days of the week for a habit
 * @param habit The habit
 * @param completions Completions for the habit
 * @param startDate Start date for the period
 * @param endDate End date for the period
 * @returns Object with best and worst days
 */
export const findBestAndWorstDays = (
  habit: Habit,
  completions: CompletionRecord[],
  startDate: string,
  endDate: string
): { best: number; worst: number } => {
  const dayStats = calculateDayOfWeekStats(
    habit,
    completions,
    startDate,
    endDate
  );

  // Filter to days with at least one active day
  const activeDayStats = dayStats.filter((day) => day.totalDays > 0);

  if (activeDayStats.length === 0) {
    return { best: -1, worst: -1 };
  }

  // Sort by success rate
  const sortedStats = [...activeDayStats].sort(
    (a, b) => b.successRate - a.successRate
  );

  return {
    best: sortedStats[0].dayOfWeek,
    worst: sortedStats[sortedStats.length - 1].dayOfWeek,
  };
};

/**
 * Calculate monthly trends for a habit
 * @param habit The habit
 * @param completions Completions for the habit
 * @param year Year to analyze
 * @returns Monthly completion rates for the year
 */
export const calculateMonthlyTrends = (
  habit: Habit,
  completions: CompletionRecord[],
  year: number
): { month: number; successRate: number; completions: number }[] => {
  const trends = [];

  // Calculate for each month
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const successRate = calculateSuccessRate(
      habit,
      completions,
      startDateStr,
      endDateStr
    );
    const monthCompletions = completions.filter(
      (c) => c.date >= startDateStr && c.date <= endDateStr && c.completed
    ).length;

    trends.push({
      month: month + 1, // 1-indexed for months
      successRate,
      completions: monthCompletions,
    });
  }

  return trends;
};

/**
 * Calculate streak periods for a habit
 * @param completions Sorted completions (by date)
 * @param habit The habit
 * @returns Array of streak periods (start date, end date, length)
 */
export const calculateStreakPeriods = (
  habit: Habit,
  completions: CompletionRecord[]
): { startDate: string; endDate: string; length: number }[] => {
  // Sort completions by date
  const sortedCompletions = [...completions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const streaks: { startDate: string; endDate: string; length: number }[] = [];

  if (sortedCompletions.length === 0) return streaks;

  let currentStreak = {
    startDate: "",
    endDate: "",
    length: 0,
  };

  // Helper to check if a completion is successful
  const isSuccessful = (completion: CompletionRecord) => completion.completed;

  for (let i = 0; i < sortedCompletions.length; i++) {
    const completion = sortedCompletions[i];

    if (isSuccessful(completion)) {
      // Start or continue streak
      if (currentStreak.length === 0) {
        currentStreak.startDate = completion.date;
      }

      currentStreak.endDate = completion.date;
      currentStreak.length++;
    } else {
      // End streak if exists
      if (currentStreak.length > 0) {
        streaks.push({ ...currentStreak });
        currentStreak = { startDate: "", endDate: "", length: 0 };
      }
    }

    // Check for gap to next day
    if (i < sortedCompletions.length - 1) {
      const currentDate = new Date(completion.date);
      const nextDate = new Date(sortedCompletions[i + 1].date);

      // Calculate days difference
      const dayDiff = Math.floor(
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // End streak if gap is too large
      if (
        (habit.repetition === "daily" && dayDiff > 1) ||
        (habit.repetition === "weekly" && dayDiff > 7) ||
        (habit.repetition === "monthly" && dayDiff > 31)
      ) {
        if (currentStreak.length > 0) {
          streaks.push({ ...currentStreak });
          currentStreak = { startDate: "", endDate: "", length: 0 };
        }
      }
    }
  }

  // Add final streak if exists
  if (currentStreak.length > 0) {
    streaks.push(currentStreak);
  }

  return streaks.sort((a, b) => b.length - a.length); // Sort by length (descending)
};

/**
 * Get day name from day of week number
 * @param dayOfWeek Day of week number (0-6)
 * @returns Day name in Arabic
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  return days[dayOfWeek] || "غير معروف";
};

/**
 * Get month name from month number
 * @param month Month number (1-12)
 * @returns Month name in Arabic
 */
export const getMonthName = (month: number): string => {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[month - 1] || "غير معروف";
};
