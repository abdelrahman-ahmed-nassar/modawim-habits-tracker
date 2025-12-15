import { v4 as uuidv4 } from "uuid";
import { readData, writeData, ensureFileExists } from "./fileStorageService";
import {
  Habit,
  CompletionRecord,
  DailyNote,
  HabitAnalytics,
  NoteTemplate,
} from "@shared/types";
import type { User } from "@shared/types";
// File names (collections)
const USERS_FILE = "users.json";
const HABITS_FILE = "habits.json";
const NOTES_FILE = "notes.json";

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
 * USERS COLLECTION HELPERS
 */
export const getUsers = async (): Promise<User[]> => {
  return await readData<User[]>(USERS_FILE);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  return user || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsers();
  const normalized = email.toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized);
  return user || null;
};

export const saveUser = async (user: User): Promise<User> => {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);

  if (index === -1) {
    users.push(user);
  } else {
    users[index] = user;
  }

  await writeData(USERS_FILE, users);
  return user;
};

export const deleteUserById = async (userId: string): Promise<boolean> => {
  const users = await getUsers();
  const initialLength = users.length;
  const filtered = users.filter((u) => u.id !== userId);
  if (filtered.length === initialLength) {
    return false;
  }
  await writeData(USERS_FILE, filtered);
  return true;
};

/**
 * Initialize the data files if they don't exist
 */
export const initializeData = async (): Promise<void> => {
  // Core collections
  await ensureFileExists(USERS_FILE, []);
  await ensureFileExists(HABITS_FILE, []);
  await ensureFileExists(NOTES_FILE, []);

  console.log("Data files initialized");
};

/**
 * Get all habits
 * @returns Promise with all habits
 */
export const getHabits = async (): Promise<Habit[]> => {
  return await readData<Habit[]>(HABITS_FILE);
};

/**
 * Get a habit by ID
 * @param id The habit ID to find
 * @returns The habit if found, null otherwise
 */
export const getHabitById = async (id: string): Promise<Habit | null> => {
  const habits = await getHabits();
  const habit = habits.find((h) => h.id === id);
  return habit || null;
};

/**
 * Create a new habit
 * @param habit The habit data to create (without ID)
 * @returns The created habit with ID
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
  const habits = await getHabits();

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

  habits.push(newHabit);
  await writeData(HABITS_FILE, habits);

  return newHabit;
};

/**
 * Update a habit
 * @param id The habit ID to update
 * @param habitData The habit data to update
 * @returns The updated habit if successful, null if not found
 */
export const updateHabit = async (
  id: string,
  habitData: Partial<Habit>
): Promise<Habit | null> => {
  const habits = await getHabits();
  const index = habits.findIndex((h) => h.id === id);

  if (index === -1) {
    return null;
  }

  // Prevent overriding certain fields
  const { id: _, createdAt, ...updateData } = habitData;

  const updatedHabit = {
    ...habits[index],
    ...updateData,
  };

  habits[index] = updatedHabit;
  await writeData(HABITS_FILE, habits);

  return updatedHabit;
};

/**
 * Delete a habit
 * @param id The habit ID to delete
 * @returns Whether the deletion was successful
 */
export const deleteHabit = async (id: string): Promise<boolean> => {
  const habits = await getHabits();
  const initialLength = habits.length;

  const filteredHabits = habits.filter((h) => h.id !== id);

  if (filteredHabits.length === initialLength) {
    return false;
  }

  await writeData(HABITS_FILE, filteredHabits);
  return true;
};

/**
 * Replace all habits with a new set
 * @param habits New set of habits
 */
export const replaceAllHabits = async (habits: Habit[]): Promise<void> => {
  await writeData(HABITS_FILE, habits);
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
  const habits = await getHabits();
  return habits
    .filter((h) => (h.completedDays || []).includes(targetInt))
    .map((h) => completionFromDay(h.id, targetInt, true));
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
  const habits = await getHabits();
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
  for (const [habitId, days] of changedHabits.entries()) {
    await updateHabit(habitId, { completedDays: Array.from(days) });
    await updateHabitStreaks(habitId);
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
 * Convert completion records to a daily status map
 * @param habit The habit
 * @param completions Completion records for the habit
 * @returns Map of dates to completion status
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
 * @param dailyCompletions Map of dates to completion status
 * @param repetition Habit repetition type
 * @param specificDays Specific days for weekly/monthly habits
 * @returns Current streak count
 */
const calculateCurrentStreak = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number => {
  // Convert map to array of [date, completed] pairs and sort by date (most recent first)
  const sortedCompletions = Array.from(dailyCompletions.entries()).sort(
    (a, b) => b[0].localeCompare(a[0])
  );

  if (sortedCompletions.length === 0) return 0;

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Get the most recent completion date
  const mostRecentDate = new Date(sortedCompletions[0][0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Calculate days since most recent completion
  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check if the streak is still "current" based on repetition pattern
  // A streak is only current if the last completion is recent enough
  if (repetition === "daily") {
    // For daily habits, we need completion from yesterday or today to have a current streak
    if (daysSinceLastCompletion > 1) return 0;
  } else if (repetition === "weekly") {
    // For weekly habits, allow up to 7 days gap
    if (daysSinceLastCompletion > 7) return 0;
  } else if (repetition === "monthly") {
    // For monthly habits, allow up to 31 days gap
    if (daysSinceLastCompletion > 31) return 0;
  }

  let streak = 0;

  // Go backwards from the most recent date
  for (let i = 0; i < sortedCompletions.length; i++) {
    const [dateStr, completed] = sortedCompletions[i];
    const date = new Date(dateStr);

    // If there's a gap in consecutive dates, or the habit wasn't completed, break
    if (i > 0) {
      const prevDate = new Date(sortedCompletions[i - 1][0]);
      const dayDiff = Math.floor(
        (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      // For non-daily habits, need to handle differently
      if (repetition === "weekly" && dayDiff > 7) break;
      if (repetition === "monthly" && dayDiff > 31) break;
      if (repetition === "daily" && dayDiff > 1) break;
    }

    // If completed, increment streak
    if (completed) {
      streak++;
    } else {
      break; // Break on first non-completion
    }
  }

  return streak;
};

/**
 * Calculate all streaks in the history
 * @param dailyCompletions Map of dates to completion status
 * @param repetition Habit repetition type
 * @param specificDays Specific days for weekly/monthly habits
 * @returns Array of streak lengths
 */
const calculateAllStreaks = (
  dailyCompletions: Map<string, boolean>,
  repetition: "daily" | "weekly" | "monthly",
  specificDays?: number[]
): number[] => {
  // Convert map to array of [date, completed] pairs and sort by date (oldest first)
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

    // Check if there's a gap to the next date
    if (i < sortedCompletions.length - 1) {
      const currentDate = new Date(dateStr);
      const nextDate = new Date(sortedCompletions[i + 1][0]);
      const dayDiff = Math.floor(
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // For non-daily habits, need to handle differently
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

  // Add the last streak if there is one
  if (currentStreak > 0) {
    streaks.push(currentStreak);
  }

  return streaks;
};

/**
 * Get all daily notes
 * @returns Promise with all daily notes
 */
export const getNotes = async (): Promise<DailyNote[]> => {
  return await readData<DailyNote[]>(NOTES_FILE);
};

/**
 * Get a note by date
 * @param date The date to find in YYYY-MM-DD format
 * @returns The note if found, null otherwise
 */
export const getNoteByDate = async (
  date: string
): Promise<DailyNote | null> => {
  const notes = await getNotes();
  const note = notes.find((n) => n.date === date);
  return note || null;
};

/**
 * Create or update a daily note
 * @param noteData The note data
 * @returns The created or updated note
 */
export const saveNote = async (
  noteData: Omit<DailyNote, "id" | "createdAt" | "updatedAt">
): Promise<DailyNote> => {
  const notes = await getNotes();
  const now = new Date().toISOString();

  const existingIndex = notes.findIndex((n) => n.date === noteData.date);
  if (existingIndex >= 0) {
    // Update existing note
    notes[existingIndex] = {
      ...notes[existingIndex],
      content: noteData.content,
      mood: noteData.mood,
      productivityLevel: noteData.productivityLevel,
      updatedAt: now,
    };

    await writeData(NOTES_FILE, notes);
    return notes[existingIndex];
  } else {
    // Create new note
    const newNote: DailyNote = {
      id: uuidv4(),
      ...noteData,
      createdAt: now,
      updatedAt: now,
    };

    notes.push(newNote);
    await writeData(NOTES_FILE, notes);
    return newNote;
  }
};

/**
 * Update a note by ID
 * @param id The note ID to update
 * @param noteData The note data to update
 * @returns The updated note if successful, null if not found
 */
export const updateNote = async (
  id: string,
  noteData: Partial<Omit<DailyNote, "id" | "createdAt" | "updatedAt">>
): Promise<DailyNote | null> => {
  const notes = await getNotes();
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const updatedNote: DailyNote = {
    ...notes[index],
    ...noteData,
    updatedAt: now,
  };

  notes[index] = updatedNote;
  await writeData(NOTES_FILE, notes);

  return updatedNote;
};

/**
 * Delete a note
 * @param id The note ID to delete
 * @returns Whether the deletion was successful
 */
export const deleteNote = async (id: string): Promise<boolean> => {
  const notes = await getNotes();
  const initialLength = notes.length;

  const filteredNotes = notes.filter((n) => n.id !== id);

  if (filteredNotes.length === initialLength) {
    return false;
  }

  await writeData(NOTES_FILE, filteredNotes);
  return true;
};

/**
 * Delete all habits for a given user
 */
export const deleteHabitsByUserId = async (userId: string): Promise<void> => {
  const habits = await getHabits();
  const filtered = habits.filter((h) => h.userId !== userId);
  await writeData(HABITS_FILE, filtered);
};

/**
 * Delete all notes for a given user
 */
export const deleteNotesByUserId = async (userId: string): Promise<void> => {
  const notes = await getNotes();
  const filtered = notes.filter((n) => n.userId !== userId);
  await writeData(NOTES_FILE, filtered);
};

// Per-user settings helpers (embedded on User)

export const getUserSettings = async (
  userId: string
): Promise<User["settings"]> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user.settings;
};

export const updateUserSettings = async (
  userId: string,
  settingsData: Partial<User["settings"]>
): Promise<User["settings"]> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const updatedSettings: User["settings"] = {
    ...user.settings,
    ...settingsData,
  };

  await saveUser({ ...user, settings: updatedSettings });
  return updatedSettings;
};

/**
 * Reset all user-embedded data and remove user-owned habits/notes.
 */
export const resetUserData = async (userId: string): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Remove user-owned habits
  const habits = await getHabits();
  const filteredHabits = habits.filter((h) => h.userId !== userId);
  await writeData(HABITS_FILE, filteredHabits);

  // Remove user-owned notes
  const notes = await getNotes();
  const filteredNotes = notes.filter((n) => n.userId !== userId);
  await writeData(NOTES_FILE, filteredNotes);

  // Reset embedded data on the user
  const now = new Date().toISOString();
  const resetUser: User = {
    ...user,
    settings: { enableRandomNote: true },
    moods: [],
    productivityLevels: [],
    notesTemplates: [],
    counters: [],
    updatedAt: now,
  };

  await saveUser(resetUser);
};

/**
 * Calculate analytics for a habit
 * @param habitId The habit ID to calculate analytics for
 * @returns Analytics for the habit
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

  // Sort completions by date
  const sortedCompletions = [...completions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Total completions
  const totalCompletions = completions.filter((c) => c.completed).length;

  // Success rate
  const successRate = totalCompletions / completions.length;

  // Longest streak (just use the habit's bestStreak)
  const longestStreak = habit.bestStreak;

  // Calculate completion rates by day of week
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

  // Calculate success rates for each day
  const dayOfWeekRates = dayStats.map((stats, index) => ({
    dayOfWeek: index,
    successRate: stats.total > 0 ? stats.completed / stats.total : 0,
  }));

  // Find best and worst days
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

  // Prepare completion history
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
 * @param completions New set of completion records
 */
export const replaceAllCompletions = async (
  completions: CompletionRecord[]
): Promise<void> => {
  const habits = await getHabits();
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

  const updatedHabits = Array.from(habitMap.values());
  await writeData(HABITS_FILE, updatedHabits);
};


// Generic CRUD operations for any data file

/**
 * Get all items from a data file
 * @param dataFile The name of the data file without extension
 * @returns Promise with all items
 */
export const getAll = async <T>(dataFile: string): Promise<T[]> => {
  const fileName = `${dataFile}.json`;
  await ensureFileExists(fileName, []);
  return await readData<T[]>(fileName);
};

/**
 * Get an item by ID from a data file
 * @param dataFile The name of the data file without extension
 * @param id The ID of the item to get
 * @returns The item if found, null otherwise
 */
export const getById = async <T extends { id: string }>(
  dataFile: string,
  id: string
): Promise<T | null> => {
  const items = await getAll<T>(dataFile);
  const item = items.find((item) => item.id === id);
  return item || null;
};

/**
 * Add a new item to a data file
 * @param dataFile The name of the data file without extension
 * @param item The item to add
 */
export const add = async <T extends { id: string }>(
  dataFile: string,
  item: T
): Promise<T> => {
  const fileName = `${dataFile}.json`;
  const items = await getAll<T>(dataFile);
  items.push(item);
  await writeData(fileName, items);
  return item;
};

/**
 * Update an item in a data file
 * @param dataFile The name of the data file without extension
 * @param id The ID of the item to update
 * @param updatedItem The updated item data
 * @returns The updated item if found, null otherwise
 */
export const update = async <T extends { id: string }>(
  dataFile: string,
  id: string,
  updatedItem: T
): Promise<T | null> => {
  const fileName = `${dataFile}.json`;
  const items = await getAll<T>(dataFile);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = updatedItem;
  await writeData(fileName, items);
  return updatedItem;
};

/**
 * Remove an item from a data file
 * @param dataFile The name of the data file without extension
 * @param id The ID of the item to remove
 * @returns True if removed, false if not found
 */
export const remove = async <T extends { id: string }>(
  dataFile: string,
  id: string
): Promise<boolean> => {
  const fileName = `${dataFile}.json`;
  const items = await getAll<T>(dataFile);
  const initialLength = items.length;
  const filteredItems = items.filter((item) => item.id !== id);

  if (filteredItems.length === initialLength) {
    return false;
  }

  await writeData(fileName, filteredItems);
  return true;
};

// Export the dataService as an object for importing in other files
export const dataService = {
  getAll,
  getById,
  add,
  update,
  remove,
  // Existing methods
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  deleteHabitsByUserId,
  getCompletions,
  getCompletionsByHabitId,
  getCompletionsByDate,
  createCompletion,
  createCompletionsBatch,
  updateCompletion,
  deleteCompletion,
  getNotes,
  getNoteByDate,
  saveNote,
  updateNote,
  deleteNote,
  deleteNotesByUserId,
  deleteUserById,
  calculateHabitAnalytics,
  replaceAllCompletions,
  updateHabitStreaks,
};

// Initialize data on module load
initializeData()
  .then(() => console.log("Data service initialized"))
  .catch((err) => console.error("Data service initialization failed:", err));
