import type { Habit, CompletionRecord } from "@shared/types";
import { HabitModel } from "../models/habitModel";
import { toPlain } from "../services/dataServiceUtils";

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

export const findAllHabits = async (): Promise<Habit[]> => {
  const habits = await HabitModel.find().lean<Habit[]>();
  return habits;
};

/**
 * Find all habits for a specific user (uses userId index)
 */
export const findHabitsByUserId = async (userId: string): Promise<Habit[]> => {
  const habits = await HabitModel.find({ userId }).lean<Habit[]>();
  return habits;
};

/**
 * Find active habits for a specific user (uses compound index)
 */
export const findActiveHabitsByUserId = async (
  userId: string
): Promise<Habit[]> => {
  const habits = await HabitModel.find({ userId, isActive: true }).lean<
    Habit[]
  >();
  return habits;
};

export const findHabitById = async (id: string): Promise<Habit | null> => {
  const habit = await HabitModel.findOne({ _id: id }).lean<Habit | null>();
  return habit || null;
};

export const insertHabit = async (
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
  const newHabitData = {
    ...habitData,
    currentStreak: 0,
    bestStreak: 0,
    currentCounter: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    completedDays: [],
  };

  const created = await HabitModel.create(newHabitData);
  return toPlain<Habit>(created);
};

export const updateHabitDocument = async (
  id: string,
  habitData: Partial<Habit>
): Promise<Habit | null> => {
  const { _id: _omit, createdAt, ...updateData } = habitData;

  const updated = await HabitModel.findOneAndUpdate({ _id: id }, updateData, {
    new: true,
  }).lean<Habit | null>();

  return updated || null;
};

export const deleteHabitDocument = async (id: string): Promise<boolean> => {
  const result = await HabitModel.deleteOne({ _id: id });
  return result.deletedCount === 1;
};

/**
 * Replace all habits for a specific user.
 * IMPORTANT: This only affects habits belonging to the given userId.
 */
export const replaceUserHabitsDocuments = async (
  userId: string,
  habits: Habit[]
): Promise<void> => {
  // Only delete habits for this specific user
  await HabitModel.deleteMany({ userId });
  if (habits.length > 0) {
    // Ensure all habits have the correct userId
    const habitsWithUserId = habits.map((h) => ({ ...h, userId }));
    await HabitModel.insertMany(habitsWithUserId);
  }
};

export const deleteHabitsByUserId = async (userId: string): Promise<void> => {
  await HabitModel.deleteMany({ userId });
};

const habitCompletedDaysToCompletions = (habit: Habit): CompletionRecord[] => {
  const days = habit.completedDays || [];
  return days.map((dayInt) => completionFromDay(habit._id, dayInt, true));
};

export const findAllCompletionsDerived = async (): Promise<
  CompletionRecord[]
> => {
  const habits = await findAllHabits();
  return habits.flatMap(habitCompletedDaysToCompletions);
};

/**
 * Find all completions for a specific user (uses userId index)
 */
export const findCompletionsByUserIdDerived = async (
  userId: string
): Promise<CompletionRecord[]> => {
  const habits = await findHabitsByUserId(userId);
  return habits.flatMap(habitCompletedDaysToCompletions);
};

export const findCompletionsByHabitIdDerived = async (
  habitId: string
): Promise<CompletionRecord[]> => {
  const habit = await findHabitById(habitId);
  if (!habit) return [];
  return habitCompletedDaysToCompletions(habit);
};

/**
 * Find completions for a specific date (uses completedDays index)
 */
export const findCompletionsByDateDerived = async (
  date: string
): Promise<CompletionRecord[]> => {
  const targetInt = dateStrToInt(date);
  const habits = await HabitModel.find({
    completedDays: targetInt,
  }).lean<Habit[]>();

  return habits.map((h) => completionFromDay(h._id, targetInt, true));
};

/**
 * Find completions for a specific user and date (uses both indexes)
 */
export const findCompletionsByUserIdAndDateDerived = async (
  userId: string,
  date: string
): Promise<CompletionRecord[]> => {
  const targetInt = dateStrToInt(date);
  const habits = await HabitModel.find({
    userId,
    completedDays: targetInt,
  }).lean<Habit[]>();

  return habits.map((h) => completionFromDay(h._id, targetInt, true));
};

/**
 * Find completions for a user within a date range (uses userId index + in-memory date filter)
 * This is more efficient than fetching all completions when we need a specific range
 */
export const findCompletionsByUserIdInDateRangeDerived = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<CompletionRecord[]> => {
  const startInt = dateStrToInt(startDate);
  const endInt = dateStrToInt(endDate);

  // Fetch user's habits with their completedDays
  const habits = await HabitModel.find({ userId }).lean<Habit[]>();

  // Filter completions within date range
  const completions: CompletionRecord[] = [];
  for (const habit of habits) {
    const days = habit.completedDays || [];
    for (const dayInt of days) {
      if (dayInt >= startInt && dayInt <= endInt) {
        completions.push(completionFromDay(habit._id, dayInt, true));
      }
    }
  }

  return completions;
};

export const upsertCompletionOnHabit = async (
  completionData: Omit<CompletionRecord, "id" | "completedAt">
): Promise<CompletionRecord | null> => {
  const { habitId, date, completed } = completionData;
  const habit = await findHabitById(habitId);
  if (!habit) {
    return null;
  }

  const dateInt = dateStrToInt(date);
  const updatedDays = new Set(habit.completedDays || []);

  if (completed) {
    updatedDays.add(dateInt);
  } else {
    updatedDays.delete(dateInt);
  }

  await updateHabitDocument(habitId, {
    completedDays: Array.from(updatedDays),
  });

  return completionFromDay(habitId, dateInt, completed ?? true);
};

export const applyCompletionsBatchOnHabits = async (
  completionsData: Array<Omit<CompletionRecord, "id" | "completedAt">>,
  userId?: string
): Promise<{ created: CompletionRecord[]; changedHabitIds: string[] }> => {
  // If userId provided, only fetch that user's habits (uses index)
  const habits = userId
    ? await HabitModel.find({ userId }).lean<Habit[]>()
    : await HabitModel.find().lean<Habit[]>();
  const habitMap = new Map<string, Habit>();
  habits.forEach((h) => habitMap.set(h._id.toString(), h));

  const changedHabits = new Map<string, Set<number>>();
  const created: CompletionRecord[] = [];

  for (const completionData of completionsData) {
    const habit = habitMap.get(completionData.habitId.toString());
    if (!habit) continue;
    const dateInt = dateStrToInt(completionData.date);
    const set =
      changedHabits.get(habit._id.toString()) ||
      new Set<number>(habit.completedDays || []);

    if (completionData.completed) {
      set.add(dateInt);
    } else {
      set.delete(dateInt);
    }

    changedHabits.set(habit._id.toString(), set);
    created.push(
      completionFromDay(habit._id, dateInt, completionData.completed ?? true)
    );
  }

  const bulkOps = Array.from(changedHabits.entries()).map(
    ([habitId, days]) => ({
      updateOne: {
        filter: { _id: habitId },
        update: { $set: { completedDays: Array.from(days) } },
      },
    })
  );

  if (bulkOps.length > 0) {
    await HabitModel.bulkWrite(bulkOps as any);
  }

  return { created, changedHabitIds: Array.from(changedHabits.keys()) };
};

export const removeCompletionFromHabit = async (
  id: string
): Promise<{ removed: boolean; habitId?: string }> => {
  const [habitId, dateIntStr] = id.split("-");
  if (!habitId || !dateIntStr) return { removed: false };
  const dateInt = parseInt(dateIntStr, 10);

  const habit = await findHabitById(habitId);
  if (!habit || !habit.completedDays) return { removed: false };

  const before = habit.completedDays.length;
  const updated = habit.completedDays.filter((d) => d !== dateInt);
  if (updated.length === before) return { removed: false };

  await updateHabitDocument(habitId, { completedDays: updated });
  return { removed: true, habitId };
};

export const updateCompletionOnHabit = async (
  completion: CompletionRecord
): Promise<{ updated: boolean; habitId?: string }> => {
  const { habitId, date, completed } = completion;
  const habit = await findHabitById(habitId);
  if (!habit) return { updated: false };

  const dateInt = dateStrToInt(date);
  const updatedDays = new Set(habit.completedDays || []);

  if (completed) {
    updatedDays.add(dateInt);
  } else {
    updatedDays.delete(dateInt);
  }

  await updateHabitDocument(habitId, {
    completedDays: Array.from(updatedDays),
  });
  return { updated: true, habitId };
};

export const replaceAllCompletionsOnHabits = async (
  completions: CompletionRecord[],
  userId?: string
): Promise<void> => {
  // If userId provided, only fetch/update that user's habits (uses index)
  const habits = userId
    ? await HabitModel.find({ userId }).lean<Habit[]>()
    : await HabitModel.find().lean<Habit[]>();
  const habitMap = new Map<string, Habit>();

  habits.forEach((h) => habitMap.set(h._id.toString(), { ...h, completedDays: [] }));

  completions.forEach((c) => {
    if (!c.completed) return;
    const habit = habitMap.get(c.habitId.toString());
    if (!habit) return;
    const dayInt = dateStrToInt(c.date);
    const set = new Set(habit.completedDays || []);
    set.add(dayInt);
    habit.completedDays = Array.from(set);
  });

  const bulkOps = Array.from(habitMap.values()).map((habit) => ({
    updateOne: {
      filter: { _id: habit._id },
      update: { $set: { completedDays: habit.completedDays } },
    },
  }));

  if (bulkOps.length > 0) {
    await HabitModel.bulkWrite(bulkOps as any);
  }
};
