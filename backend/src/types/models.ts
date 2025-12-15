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

export interface BackupData {
  habits: Habit[];
  completions: CompletionRecord[];
  notes: DailyNote[];
  settings: Settings;
  timestamp: string;
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
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  lastBackupDate: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
