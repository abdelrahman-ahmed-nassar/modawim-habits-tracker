export interface Habit {
  id: string;
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
  createdAt: string;
  motivationNote?: string;
  isActive: boolean;
}
export type { Habit as default };
