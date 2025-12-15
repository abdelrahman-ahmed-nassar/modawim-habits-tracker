export interface CreateHabitDto {
  name: string;
  description?: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  goalValue: number;
  motivationNote?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
