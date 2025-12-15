import { Habit, CompletionRecord } from "@shared/types";
import * as dataService from "./dataService";
import {
  calculateSuccessRate,
  calculateDayOfWeekStats,
  findBestAndWorstDays,
  calculateStreakPeriods,
  getDayName,
} from "../utils/analyticsUtils";
import { getDateDaysAgo, getTodayDateString } from "../utils/dateUtils";

export interface HabitAnalytics {
  habitId: string;
  habitName: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  successRate: number;
  bestDayOfWeek: number;
  worstDayOfWeek: number;
  longestStreak: number;
  totalCompletions: number;
  averageCompletionsPerWeek: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
  goalValue: number;
  isActive: boolean;
}

export interface AllHabitsAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  totalHabits: number;
  activeHabits: number;
  habits: HabitAnalytics[];
  summary: {
    averageSuccessRate: number;
    totalCompletions: number;
    averageStreak: number;
  };
}

/**
 * Calculate analytics for all habits
 * @param period The time period to analyze (7days, 30days, 90days, 365days)
 * @returns Analytics for all habits
 */
export const calculateAllHabitsAnalytics = async (
  period: string = "30days",
  userId?: string
): Promise<AllHabitsAnalytics> => {
  // Calculate date range based on period
  let startDate: string;
  let endDate = getTodayDateString();

  if (period === "7days") {
    startDate = getDateDaysAgo(7);
  } else if (period === "30days") {
    startDate = getDateDaysAgo(30);
  } else if (period === "90days") {
    startDate = getDateDaysAgo(90);
  } else if (period === "365days") {
    startDate = getDateDaysAgo(365);
  } else {
    startDate = getDateDaysAgo(30); // Default to 30 days
  }

  // Get all habits and their completions
  const allHabits = await dataService.getHabits();
  const habits = userId
    ? allHabits.filter((habit) => habit.userId === userId)
    : allHabits;

  const allCompletions = await dataService.getCompletions();
  const habitIds = new Set(habits.map((h) => h.id));
  const completions = allCompletions
    .filter((c: CompletionRecord) => habitIds.has(c.habitId))
    .filter((c: CompletionRecord) => c.date >= startDate && c.date <= endDate);
  // Get active habits only
  const activeHabits = habits.filter((habit) => habit.isActive);

  // Calculate analytics for each active habit
  const habitsAnalytics = await Promise.all(
    activeHabits.map(async (habit) => {
      const habitCompletions = completions.filter(
        (c: CompletionRecord) => c.habitId === habit.id
      );

      const successRate = calculateSuccessRate(
        habit,
        habitCompletions,
        startDate,
        endDate
      );

      const { best, worst } = findBestAndWorstDays(
        habit,
        habitCompletions,
        startDate,
        endDate
      );

      const streakPeriods = calculateStreakPeriods(habit, habitCompletions);
      const longestStreak =
        streakPeriods.length > 0
          ? Math.max(...streakPeriods.map((p) => p.length))
          : 0;

      const totalCompletions = habitCompletions.filter(
        (c: CompletionRecord) => c.completed
      ).length;
      const weeksInPeriod = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const averageCompletionsPerWeek =
        weeksInPeriod > 0 ? totalCompletions / weeksInPeriod : 0;
      return {
        habitId: habit.id,
        habitName: habit.name,
        tag: habit.tag,
        repetition: habit.repetition,
        successRate,
        bestDayOfWeek: best,
        worstDayOfWeek: worst,
        longestStreak,
        totalCompletions,
        averageCompletionsPerWeek,
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
        currentCounter: habit.currentCounter,
        goalValue: habit.goalValue,
        isActive: habit.isActive,
      };
    })
  );

  // Sort habits by success rate
  const sortedHabits = [...habitsAnalytics].sort(
    (a, b) => b.successRate - a.successRate
  );

  return {
    period,
    startDate,
    endDate,
    totalHabits: habits.length,
    activeHabits: habits.filter((h) => h.isActive).length,
    habits: sortedHabits,
    summary: {
      averageSuccessRate:
        habitsAnalytics.reduce((sum, h) => sum + h.successRate, 0) /
        habitsAnalytics.length,
      totalCompletions: habitsAnalytics.reduce(
        (sum, h) => sum + h.totalCompletions,
        0
      ),
      averageStreak:
        habitsAnalytics.reduce((sum, h) => sum + h.longestStreak, 0) /
        habitsAnalytics.length,
    },
  };
};

/**
 * Calculate analytics for a single habit
 * @param habitId The habit ID to calculate analytics for
 * @param period The time period to analyze (7days, 30days, 90days, 365days)
 * @returns Analytics for the habit
 */
export const calculateHabitAnalytics = async (
  habitId: string,
  period: string = "30days"
): Promise<HabitAnalytics | null> => {
  // Calculate date range based on period
  let startDate: string;
  let endDate = getTodayDateString();

  if (period === "7days") {
    startDate = getDateDaysAgo(7);
  } else if (period === "30days") {
    startDate = getDateDaysAgo(30);
  } else if (period === "90days") {
    startDate = getDateDaysAgo(90);
  } else if (period === "365days") {
    startDate = getDateDaysAgo(365);
  } else {
    startDate = getDateDaysAgo(30); // Default to 30 days
  }

  // Get habit and its completions
  const habit = await dataService.getHabitById(habitId);
  if (!habit) return null;

  const allCompletions = await dataService.getCompletions();
  const completions = allCompletions.filter(
    (c: CompletionRecord) => c.date >= startDate && c.date <= endDate
  );
  const habitCompletions = completions.filter(
    (c: CompletionRecord) => c.habitId === habitId
  );

  const successRate = calculateSuccessRate(
    habit,
    habitCompletions,
    startDate,
    endDate
  );

  const { best, worst } = findBestAndWorstDays(
    habit,
    habitCompletions,
    startDate,
    endDate
  );

  const streakPeriods = calculateStreakPeriods(habit, habitCompletions);
  const longestStreak =
    streakPeriods.length > 0
      ? Math.max(...streakPeriods.map((p) => p.length))
      : 0;

  const totalCompletions = habitCompletions.filter(
    (c: CompletionRecord) => c.completed
  ).length;
  const weeksInPeriod = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  const averageCompletionsPerWeek =
    weeksInPeriod > 0 ? totalCompletions / weeksInPeriod : 0;
  return {
    habitId: habit.id,
    habitName: habit.name,
    tag: habit.tag,
    repetition: habit.repetition,
    successRate,
    bestDayOfWeek: best,
    worstDayOfWeek: worst,
    longestStreak,
    totalCompletions,
    averageCompletionsPerWeek,
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    currentCounter: habit.currentCounter,
    goalValue: habit.goalValue,
    isActive: habit.isActive,
  };
};
