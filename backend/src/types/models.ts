import {
  Habit,
  CompletionRecord,
  DailyNote,
  HabitAnalytics,
} from "@shared/types";

// Extend shared types for backend-specific functionality

export interface HabitWithStats extends Habit {
  completionRate: number;
  lastCompletedAt?: string;
}

export interface CompletionRecordWithDetails extends CompletionRecord {
  habitName: string;
  streak: number;
}

export interface Settings {
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  notifications: {
    enabled: boolean;
    reminderTime: string;
  };
  reminderEnabled: boolean;
  reminderTime: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
