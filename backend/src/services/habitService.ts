import { v4 as uuidv4 } from "uuid";
import {
  Habit,
  CompletionRecord,
  HabitAnalytics,
} from "@shared/types";
import { HabitModel } from "../models/habitModel";
import { toPlain } from "./dataServiceUtils";

// Date helpers for YYYY-MM-DD <-> YYYYMMDD integer conversion (UTC-based)
const dateStrToInt = (dateStr: string): number =>
  parseInt(dateStr.replace(/-/g, ""), 10);

const dateIntToStr = (dateInt: number): string => {
  const padded = dateInt.toString().padStart(8, "0");
  const year = padded.slice(0, 4);
  const month = padded.slice(4, 6);
  const day = padded.slice(6, 8);
  return `${year}-${month}-${day}`;
};

const buildCompletionId = (habitId: string, dateInt: number): string =>
  `${habitId}-${dateInt}`;

const completionFromDay = (
  habitId: string,
  dateInt: number,
  completed: boolean
): CompletionRecord => {
  const dateStr = dateIntToStr(dateInt);
  return {
    id: buildCompletionId(habitId, dateInt),
    habitId,
    date: dateStr,
    completed,
    completedAt: `${dateStr}T00:00:00.000Z`,
  };
};

/**
 * Get all habits
 */
export const getHabits = async (): Promise<Habit[]> => {
  const habits = await HabitModel.find().lean<Habit[]>();
  return habits;
};

/**
 * Get a habit by ID
 */
export const getHabitById = async (id: string): Promise<Habit | null> => {
  const habit = await HabitModel.findOne({ id }).lean<Habit | null>();
  return habit || null;
};

/**
 * Create a new habit
 */
export const createHabit = async (
  habitData: Omit<
    Habit,
    | "id"
    | "createdAt"
    | "currentStreak"
    | "bestStreak"
    | "currentCounter"
    | "isActive"
  >
): Promise<Habit> => {
  const newHabit: Habit = {
    id: uuidv4(),
    ...habitData,
    currentStreak: 0,
    bestStreak: 0,
    currentCounter: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    completedDays: [],
  };

  const created = await HabitModel.create(newHabit);
  return toPlain<Habit>(created);
};

/**
 * Update a habit
 */
export const updateHabit = async (
  id: string,
  habitData: Partial<Habit>
): Promise<Habit | null> => {
  const { id: _omit, createdAt, ...updateData } = habitData;

  const updated = await HabitModel.findOneAndUpdate({ id }, updateData, {
    new: true,
  }).lean<Habit | null>();

  return updated || null;
};

/**
 * Delete a habit
 */
export const deleteHabit = async (id: string): Promise<boolean> => {
  const result = await HabitModel.deleteOne({ id });
  return result.deletedCount === 1;
};

/**
 * Replace all habits with a new set
 */
export const replaceAllHabits = async (habits: Habit[]): Promise<void> => {
  await HabitModel.deleteMany({});
  if (habits.length > 0) {
    await HabitModel.insertMany(habits);
  }
};

/**
 * Delete all habits for a given user
 */
export const deleteHabitsByUserId = async (userId: string): Promise<void> => {
  await HabitModel.deleteMany({ userId });
};

/**
 * Build completion records for a habit from its completedDays array
 */
const habitCompletedDaysToCompletions = (habit: Habit): CompletionRecord[] => {
  const days = habit.completedDays || [];
  return days.map((dayInt) => completionFromDay(habit.id, dayInt, true));
};

/**
 * Get all completion records (derived from habits.completedDays)
 */
export const getCompletions = async (): Promise<CompletionRecord[]> => {
  const habits = await getHabits();
  return habits.flatMap(habitCompletedDaysToCompletions);
};

/**
 * Get completion records for a specific habit
 */
export const getCompletionsByHabitId = async (
  habitId: string
): Promise<CompletionRecord[]> => {
  const habit = await getHabitById(habitId);
  if (!habit) return [];
  return habitCompletedDaysToCompletions(habit);
};

/**
 * Get completion records for a specific date (YYYY-MM-DD)
 */
export const getCompletionsByDate = async (
  date: string
): Promise<CompletionRecord[]> => {
  const targetInt = dateStrToInt(date);
  const habits = await HabitModel.find({
    completedDays: targetInt,
  }).lean<Habit[]>();

  return habits.map((h) => completionFromDay(h.id, targetInt, true));
};

/**
 * Create or update a completion record (upsert into habit.completedDays)
 */
export const createCompletion = async (
  completionData: Omit<CompletionRecord, "id" | "completedAt">
): Promise<CompletionRecord> => {
  const { habitId, date, completed } = completionData;
  const habit = await getHabitById(habitId);
  if (!habit) {
    throw new Error(`Habit with ID ${habitId} not found`);
  }

  const dateInt = dateStrToInt(date);
  const updatedDays = new Set(habit.completedDays || []);

  if (completed) {
    updatedDays.add(dateInt);
  } else {
    updatedDays.delete(dateInt);
  }

  await updateHabit(habitId, { completedDays: Array.from(updatedDays) });
  await updateHabitStreaks(habitId);

  return completionFromDay(habitId, dateInt, completed ?? true);
};

/**
 * Create multiple completion records in a single batch operation
 * (derived and stored on habits)
 */
export const createCompletionsBatch = async (
  completionsData: Array<Omit<CompletionRecord, "id" | "completedAt">>
): Promise<CompletionRecord[]> => {
  const habits = await HabitModel.find().lean<Habit[]>();
  const habitMap = new Map<string, Habit>();
  habits.forEach((h) => habitMap.set(h.id, h));

  const changedHabits = new Map<string, Set<number>>();
  const created: CompletionRecord[] = [];

  for (const completionData of completionsData) {
    const habit = habitMap.get(completionData.habitId);
    if (!habit) continue;
    const dateInt = dateStrToInt(completionData.date);
    const set =
      changedHabits.get(habit.id) || new Set<number>(habit.completedDays || []);

    if (completionData.completed) {
      set.add(dateInt);
    } else {
      set.delete(dateInt);
    }

    changedHabits.set(habit.id, set);
    created.push(
      completionFromDay(habit.id, dateInt, completionData.completed ?? true)
    );
  }

  // Persist updates per habit
  const bulkOps = Array.from(changedHabits.entries()).map(
    ([habitId, days]) => ({
      updateOne: {
        filter: { id: habitId },
        update: { $set: { completedDays: Array.from(days) } },
      },
    })
  );

  if (bulkOps.length > 0) {
    await HabitModel.bulkWrite(bulkOps);
    // Update streaks sequentially to reuse existing logic
    for (const habitId of changedHabits.keys()) {
      // eslint-disable-next-line no-await-in-loop
      await updateHabitStreaks(habitId);
    }
  }

  return created;
};

/**
 * Delete a completion record by id (habitId-YYYYMMDD)
 */
export const deleteCompletion = async (id: string): Promise<boolean> => {
  const [habitId, dateIntStr] = id.split("-");
  if (!habitId || !dateIntStr) return false;
  const dateInt = parseInt(dateIntStr, 10);

  const habit = await getHabitById(habitId);
  if (!habit || !habit.completedDays) return false;

  const before = habit.completedDays.length;
  const updated = habit.completedDays.filter((d) => d !== dateInt);
  if (updated.length === before) return false;

  await updateHabit(habitId, { completedDays: updated });
  await updateHabitStreaks(habitId);
  return true;
};

/**
 * Update a completion record (interpreted as set/unset for the date)
 */
export const updateCompletion = async (
  completion: CompletionRecord
): Promise<boolean> => {
  const { habitId, date, completed } = completion;
  const habit = await getHabitById(habitId);
  if (!habit) return false;

  const dateInt = dateStrToInt(date);
  const updatedDays = new Set(habit.completedDays || []);

  if (completed) {
    updatedDays.add(dateInt);
  } else {
    updatedDays.delete(dateInt);
  }

  await updateHabit(habitId, { completedDays: Array.from(updatedDays) });
  await updateHabitStreaks(habitId);
  return true;
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
  const habits = await HabitModel.find().lean<Habit[]>();
  const habitMap = new Map<string, Habit>();

  habits.forEach((h) => habitMap.set(h.id, { ...h, completedDays: [] }));

  completions.forEach((c) => {
    if (!c.completed) return;
    const habit = habitMap.get(c.habitId);
    if (!habit) return;
    const dayInt = dateStrToInt(c.date);
    const set = new Set(habit.completedDays || []);
    set.add(dayInt);
    habit.completedDays = Array.from(set);
  });

  const bulkOps = Array.from(habitMap.values()).map((habit) => ({
    updateOne: {
      filter: { id: habit.id },
      update: { $set: { completedDays: habit.completedDays } },
    },
  }));

  if (bulkOps.length > 0) {
    await HabitModel.bulkWrite(bulkOps);
  }
};

