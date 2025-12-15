import type { Habit, CompletionRecord, HabitAnalytics } from "@shared/types";
import {
  findAllHabits,
  findHabitsByUserId,
  findActiveHabitsByUserId,
  findHabitById,
  insertHabit,
  updateHabitDocument,
  deleteHabitDocument,
  replaceUserHabitsDocuments,
  deleteHabitsByUserId as deleteHabitsByUserIdRepo,
  findAllCompletionsDerived,
  findCompletionsByUserIdDerived,
  findCompletionsByHabitIdDerived,
  findCompletionsByDateDerived,
  findCompletionsByUserIdAndDateDerived,
  findCompletionsByUserIdInDateRangeDerived,
  upsertCompletionOnHabit,
  applyCompletionsBatchOnHabits,
  removeCompletionFromHabit,
  updateCompletionOnHabit,
  replaceAllCompletionsOnHabits,
} from "../repositories/habitRepository";

/**
 * Get all habits (use getHabitsByUserId for better performance)
 */
export const getHabits = async (): Promise<Habit[]> => {
  return findAllHabits();
};

/**
 * Get all habits for a specific user (uses userId index - preferred)
 */
export const getHabitsByUserId = async (userId: string): Promise<Habit[]> => {
  return findHabitsByUserId(userId);
};

/**
 * Get active habits for a specific user (uses compound index)
 */
export const getActiveHabitsByUserId = async (
  userId: string
): Promise<Habit[]> => {
  return findActiveHabitsByUserId(userId);
};

/**
 * Get a habit by ID
 */
export const getHabitById = async (id: string): Promise<Habit | null> => {
  return findHabitById(id);
};

/**
 * Create a new habit
 */
export const createHabit = async (
  habitData: Omit<
    Habit,
    | "_id"
    | "createdAt"
    | "currentStreak"
    | "bestStreak"
    | "currentCounter"
    | "isActive"
  >
): Promise<Habit> => {
  // Repository ensures the same initialization of streak fields and timestamps
  return insertHabit(habitData);
};

/**
 * Update a habit
 */
export const updateHabit = async (
  id: string,
  habitData: Partial<Habit>
): Promise<Habit | null> => {
  return updateHabitDocument(id, habitData);
};

/**
 * Delete a habit
 */
export const deleteHabit = async (id: string): Promise<boolean> => {
  return deleteHabitDocument(id);
};

/**
 * Replace all habits for a specific user with a new set
 * IMPORTANT: Only affects habits belonging to the given userId
 */
export const replaceAllHabits = async (
  userId: string,
  habits: Habit[]
): Promise<void> => {
  await replaceUserHabitsDocuments(userId, habits);
};

/**
 * Delete all habits for a given user
 */
export const deleteHabitsByUserId = async (userId: string): Promise<void> => {
  await deleteHabitsByUserIdRepo(userId);
};

/**
 * Build completion records for a habit from its completedDays array
 */
const habitCompletedDaysToCompletions = (habit: Habit): CompletionRecord[] => {
  const days = habit.completedDays || [];
  // Keep local helper for streak calculations (repository has its own copy
  // for persistence operations)
  return days.map((dayInt) => ({
    id: `${habit._id}-${dayInt}`,
    habitId: habit._id,
    date: "", // date is not used in streak calculations here
    completed: true,
    completedAt: "",
  }));
};

/**
 * Get all completion records (use getCompletionsByUserId for better performance)
 */
export const getCompletions = async (): Promise<CompletionRecord[]> => {
  return findAllCompletionsDerived();
};

/**
 * Get all completion records for a specific user (uses userId index - preferred)
 */
export const getCompletionsByUserId = async (
  userId: string
): Promise<CompletionRecord[]> => {
  return findCompletionsByUserIdDerived(userId);
};

/**
 * Get completion records for a specific habit
 */
export const getCompletionsByHabitId = async (
  habitId: string
): Promise<CompletionRecord[]> => {
  return findCompletionsByHabitIdDerived(habitId);
};

/**
 * Get completion records for a specific date (YYYY-MM-DD)
 */
export const getCompletionsByDate = async (
  date: string
): Promise<CompletionRecord[]> => {
  return findCompletionsByDateDerived(date);
};

/**
 * Get completion records for a specific user and date (uses both indexes - optimal)
 */
export const getCompletionsByUserIdAndDate = async (
  userId: string,
  date: string
): Promise<CompletionRecord[]> => {
  return findCompletionsByUserIdAndDateDerived(userId, date);
};

/**
 * Get completion records for a user within a date range (optimized for range queries)
 */
export const getCompletionsByUserIdInDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<CompletionRecord[]> => {
  return findCompletionsByUserIdInDateRangeDerived(userId, startDate, endDate);
};

/**
 * Create or update a completion record (upsert into habit.completedDays)
 */
export const createCompletion = async (
  completionData: Omit<CompletionRecord, "id" | "completedAt">
): Promise<CompletionRecord> => {
  const completion = await upsertCompletionOnHabit(completionData);
  if (!completion) {
    throw new Error(`Habit with ID ${completionData.habitId} not found`);
  }

  // Preserve behavior: streaks updated after each completion change
  await updateHabitStreaks(completionData.habitId);

  return completion;
};

/**
 * Create multiple completion records in a single batch operation
 * (derived and stored on habits)
 */
export const createCompletionsBatch = async (
  completionsData: Array<Omit<CompletionRecord, "id" | "completedAt">>
): Promise<CompletionRecord[]> => {
  const { created, changedHabitIds } = await applyCompletionsBatchOnHabits(
    completionsData
  );

  // Preserve behavior: update streaks sequentially for each changed habit
  for (const habitId of changedHabitIds) {
      // eslint-disable-next-line no-await-in-loop
      await updateHabitStreaks(habitId);
  }

  return created;
};

/**
 * Delete a completion record by id (habitId-YYYYMMDD)
 */
export const deleteCompletion = async (id: string): Promise<boolean> => {
  const { removed, habitId } = await removeCompletionFromHabit(id);
  if (removed && habitId) {
  await updateHabitStreaks(habitId);
  }
  return removed;
};

/**
 * Update a completion record (interpreted as set/unset for the date)
 */
export const updateCompletion = async (
  completion: CompletionRecord
): Promise<boolean> => {
  const { updated, habitId } = await updateCompletionOnHabit(completion);
  if (updated && habitId) {
  await updateHabitStreaks(habitId);
  }
  return updated;
};

/**
 * Convert completion records to a daily status map
 */
const getDailyCompletionStatus = (
  habit: Habit,
  completions: CompletionRecord[]
): Map<string, boolean> => {
  const statusMap = new Map<string, boolean>();

  completions.forEach((completion) => {
    statusMap.set(completion.date, completion.completed);
  });

  return statusMap;
};

/**
 * Calculate current streak based on daily completion status
 */
const calculateCurrentStreak = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number => {
  const sortedCompletions = Array.from(dailyCompletions.entries()).sort(
    (a, b) => b[0].localeCompare(a[0])
  );

  if (sortedCompletions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentDate = new Date(sortedCompletions[0][0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (repetition === "daily") {
    if (daysSinceLastCompletion > 1) return 0;
  } else if (repetition === "weekly") {
    if (daysSinceLastCompletion > 7) return 0;
  } else if (repetition === "monthly") {
    if (daysSinceLastCompletion > 31) return 0;
  }

  let streak = 0;

  for (let i = 0; i < sortedCompletions.length; i++) {
    const [dateStr, completed] = sortedCompletions[i];
    const date = new Date(dateStr);

    if (i > 0) {
      const prevDate = new Date(sortedCompletions[i - 1][0]);
      const dayDiff = Math.floor(
        (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (repetition === "weekly" && dayDiff > 7) break;
      if (repetition === "monthly" && dayDiff > 31) break;
      if (repetition === "daily" && dayDiff > 1) break;
    }

    if (completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate all streaks in the history
 */
const calculateAllStreaks = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number[] => {
  const sortedCompletions = Array.from(dailyCompletions.entries()).sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  const streaks: number[] = [];
  let currentStreak = 0;

  for (let i = 0; i < sortedCompletions.length; i++) {
    const [dateStr, completed] = sortedCompletions[i];

    if (completed) {
      currentStreak++;
    } else {
      if (currentStreak > 0) {
        streaks.push(currentStreak);
        currentStreak = 0;
      }
    }

    if (i < sortedCompletions.length - 1) {
      const currentDate = new Date(dateStr);
      const nextDate = new Date(sortedCompletions[i + 1][0]);
      const dayDiff = Math.floor(
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        (repetition === "daily" && dayDiff > 1) ||
        (repetition === "weekly" && dayDiff > 7) ||
        (repetition === "monthly" && dayDiff > 31)
      ) {
        if (currentStreak > 0) {
          streaks.push(currentStreak);
          currentStreak = 0;
        }
      }
    }
  }

  if (currentStreak > 0) {
    streaks.push(currentStreak);
  }

  return streaks;
};

/**
 * Update a habit's current and best streak values, and current counter
 * Public version of the internal updateHabitStreaks function
 * @param habitId The habit ID to update streaks for
 */
export const updateHabitStreaks = async (habitId: string): Promise<void> => {
  const habit = await getHabitById(habitId);
  if (!habit) return;

  let currentStreak = 0;
  let bestStreak = habit.bestStreak;
  let currentCounter = 0;

  // Build completions from completedDays
  const completions = habitCompletedDaysToCompletions(habit);

  // Sort by date (oldest first for streak calculations)
  completions.sort((a, b) => a.date.localeCompare(b.date));
  // For streak-type habits, currentCounter tracks total completions (each completion = 1)
  currentCounter = completions.filter((c) => c.completed).length;

  const dailyCompletions = getDailyCompletionStatus(habit, completions);

  // Calculate current streak - counting back from today or the last record
  currentStreak = calculateCurrentStreak(
    dailyCompletions,
    habit.repetition,
    habit.specificDays
  );

  // Calculate best streak
  const allStreaks = calculateAllStreaks(
    dailyCompletions,
    habit.repetition,
    habit.specificDays
  );
  bestStreak = Math.max(...allStreaks, 0, habit.bestStreak); // Include existing bestStreak

  // Update the habit with new streak values and currentCounter
  await updateHabit(habitId, { currentStreak, bestStreak, currentCounter });
};

/**
 * Calculate analytics for a habit
 */
export const calculateHabitAnalytics = async (
  habitId: string
): Promise<HabitAnalytics | null> => {
  const habit = await getHabitById(habitId);
  if (!habit) return null;

  const completions = await getCompletionsByHabitId(habitId);
  if (completions.length === 0) {
    return {
      habitId,
      habitName: habit.name,
      successRate: 0,
      bestDayOfWeek: 0,
      worstDayOfWeek: 0,
      longestStreak: 0,
      totalCompletions: 0,
      averageCompletionsPerWeek: 0,
      currentStreak: habit.currentStreak,
      bestStreak: habit.bestStreak,
      currentCounter: habit.currentCounter,
      completionHistory: [],
    };
  }

  const sortedCompletions = [...completions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const totalCompletions = completions.filter((c) => c.completed).length;
  const successRate = totalCompletions / completions.length;
  const longestStreak = habit.bestStreak;

  const dayStats = Array(7)
    .fill(0)
    .map(() => ({ total: 0, completed: 0 }));
  sortedCompletions.forEach((completion) => {
    const date = new Date(completion.date);
    const dayOfWeek = date.getDay();
    dayStats[dayOfWeek].total++;
    if (completion.completed) {
      dayStats[dayOfWeek].completed++;
    }
  });

  const dayOfWeekRates = dayStats.map((stats, index) => ({
    dayOfWeek: index,
    successRate: stats.total > 0 ? stats.completed / stats.total : 0,
  }));

  const bestDayOfWeek = dayOfWeekRates.reduce(
    (best, current) =>
      current.successRate > dayOfWeekRates[best].successRate
        ? current.dayOfWeek
        : best,
    0
  );
  const worstDayOfWeek = dayOfWeekRates.reduce(
    (worst, current) =>
      current.successRate < dayOfWeekRates[worst].successRate
        ? current.dayOfWeek
        : worst,
    0
  );

  const completionHistory = sortedCompletions.map((completion) => ({
    date: completion.date,
    completed: completion.completed,
  }));

  return {
    habitId,
    habitName: habit.name,
    successRate,
    bestDayOfWeek,
    worstDayOfWeek,
    longestStreak,
    totalCompletions,
    averageCompletionsPerWeek:
      totalCompletions / (sortedCompletions.length / 7),
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
    currentCounter: habit.currentCounter,
    completionHistory,
  };
};

/**
 * Replace all completion records with a new set
 */
export const replaceAllCompletions = async (
  completions: CompletionRecord[]
): Promise<void> => {
  await replaceAllCompletionsOnHabits(completions);
};
