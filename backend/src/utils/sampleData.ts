import { v4 as uuidv4 } from "uuid";
import { Habit, CompletionRecord, DailyNote } from "@shared/types";
import { Settings } from "../types/models";
import {
  getTodayDateString,
  getDateDaysAgo,
  formatDateToString,
} from "./dateUtils";
import { writeData } from "../services/fileStorageService";

/**
 * Generate sample habits
 * @returns Array of sample habits
 */
export const generateSampleHabits = (): Habit[] => {
  const now = new Date().toISOString();

  return [
    {
      id: uuidv4(),
      name: "تمرين يومي",
      description: "على الأقل 30 دقيقة من النشاط البدني",
      tag: "صحة",
      repetition: "daily",
      goalValue: 1,
      currentStreak: 3,
      bestStreak: 5,
      currentCounter: 0,
      createdAt: getDateDaysAgo(30),
      motivationNote: "التمرين يحسن المزاج ومستويات الطاقة",
      isActive: true,
    },
    {
      id: uuidv4(),
      name: "قراءة كتاب",
      description: "قراءة 30 صفحة على الأقل",
      tag: "تعلم",
      repetition: "daily",
      goalValue: 30,
      currentStreak: 0,
      bestStreak: 7,
      currentCounter: 25,
      createdAt: getDateDaysAgo(45),
      isActive: true,
    },
    {
      id: uuidv4(),
      name: "مراجعة أسبوعية",
      description: "مراجعة الأهداف والتخطيط للأسبوع القادم",
      tag: "إنتاجية",
      repetition: "weekly",
      specificDays: [0], // Sunday
      goalValue: 1,
      currentStreak: 2,
      bestStreak: 4,
      currentCounter: 0,
      createdAt: getDateDaysAgo(60),
      motivationNote: "التخطيط المسبق يؤدي إلى نتائج أفضل",
      isActive: true,
    },
    {
      id: uuidv4(),
      name: "شرب الماء",
      description: "شرب 2 لتر من الماء على الأقل",
      tag: "صحة",
      repetition: "daily",
      goalValue: 8, // 8 glasses
      currentStreak: 1,
      bestStreak: 12,
      currentCounter: 6,
      createdAt: getDateDaysAgo(15),
      isActive: true,
    },
    {
      id: uuidv4(),
      name: "مراجعة الميزانية الشهرية",
      description: "مراجعة المصروفات وتحديث الميزانية",
      tag: "مالية",
      repetition: "monthly",
      specificDays: [1], // 1st day of month
      goalValue: 1,
      currentStreak: 2,
      bestStreak: 3,
      currentCounter: 0,
      createdAt: getDateDaysAgo(90),
      isActive: true,
    },
  ];
};

/**
 * Generate sample completion records for the provided habits
 * @param habits Array of habits to generate completions for
 * @param days Number of days to go back for generating data
 * @returns Array of completion records
 */
export const generateSampleCompletions = (
  habits: Habit[],
  days: number = 30
): CompletionRecord[] => {
  const completions: CompletionRecord[] = [];
  const today = new Date();

  habits.forEach((habit) => {
    // Generate completions for the specified number of past days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDateToString(date);

      // For daily habits, generate more consistent data
      if (habit.repetition === "daily") {
        const completed = Math.random() > 0.3; // 70% completion rate

        completions.push({
          id: uuidv4(),
          habitId: habit.id,
          date: dateStr,
          completed,
          completedAt: new Date(date).toISOString(),
        });
      }
      // For weekly habits, only generate on the specific days
      else if (
        habit.repetition === "weekly" &&
        habit.specificDays &&
        habit.specificDays.includes(date.getDay())
      ) {
        const completed = Math.random() > 0.2; // 80% completion rate

        completions.push({
          id: uuidv4(),
          habitId: habit.id,
          date: dateStr,
          completed,
          completedAt: new Date(date).toISOString(),
        });
      }
      // For monthly habits, only generate on the specific days
      else if (
        habit.repetition === "monthly" &&
        habit.specificDays &&
        habit.specificDays.includes(date.getDate())
      ) {
        const completed = Math.random() > 0.1; // 90% completion rate

        completions.push({
          id: uuidv4(),
          habitId: habit.id,
          date: dateStr,
          completed,
          completedAt: new Date(date).toISOString(),
        });
      }
    }
  });

  return completions;
};

/**
 * Generate sample daily notes
 * @param days Number of days to go back for generating notes
 * @returns Array of daily notes
 */
export const generateSampleNotes = (days: number = 10): DailyNote[] => {
  const notes: DailyNote[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date);
    const now = new Date(date).toISOString();

    // Skip some days randomly to make it more realistic
    if (Math.random() > 0.3) {
      notes.push({
        id: uuidv4(),
        date: dateStr,
        content: `تدوينة عينة لتاريخ ${dateStr}. اليوم كان ${
          Math.random() > 0.5 ? "مُنتج" : "صعب"
        }.`,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return notes;
};

/**
 * Generate default settings
 * @returns Settings object
 */
export const generateDefaultSettings = (): Settings => {
  return {
    userId: uuidv4(),
    theme: "system",
    language: "ar",
    notifications: {
      enabled: true,
      reminderTime: "09:00",
    },
    analytics: {
      cacheEnabled: true,
      cacheDuration: 5,
    },
    reminderEnabled: true,
    reminderTime: "20:00",
    backupEnabled: true,
    backupFrequency: "weekly",
    lastBackupDate: getDateDaysAgo(7),
  };
};

/**
 * Load sample data into the database
 */
export const loadSampleData = async (): Promise<void> => {
  try {
    console.log("Loading sample data...");

    // Generate habits
    const habits = generateSampleHabits();
    await writeData("habits.json", habits);

    // Generate completions
    const completions = generateSampleCompletions(habits);
    await writeData("completions.json", completions);

    // Generate notes
    const notes = generateSampleNotes();
    await writeData("notes.json", notes);

    // Generate settings
    const settings = generateDefaultSettings();
    await writeData("settings.json", settings);

    console.log("Sample data loaded successfully");
  } catch (error) {
    console.error("Error loading sample data:", error);
    throw error;
  }
};
