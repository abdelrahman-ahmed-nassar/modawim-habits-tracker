export interface Habit {
  id: string;
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[]; // weekdays (0-6) or month dates (1-31)
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
  createdAt: string;
  motivationNote?: string;
  isActive: boolean;
  order?: number; // Order for custom sorting
}

// Re-export for backward compatibility
export type { Habit as default };
