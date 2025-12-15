import { Habit } from "@shared/types/habit";
import apiService from "./api";

interface CreateHabitRequest {
  name: string;
  description?: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  tag: string;
  goalValue: number;
  motivationNote?: string;
  isActive?: boolean;
}

type UpdateHabitRequest = CreateHabitRequest;

interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
}

class HabitsService {
  /**
   * Get all habits
   * @param includeInactive - Whether to include inactive habits (defaults to false)
   */
  async getAllHabits(includeInactive: boolean = false): Promise<Habit[]> {
    const res = await apiService.get<Habit[]>(
      `/habits${includeInactive ? "?active=all" : ""}`
    );
    return res.data;
  }

  /**
   * Get a single habit by ID
   * @param id - The ID of the habit
   */
  async getHabit(id: string): Promise<Habit> {
    const res = await apiService.get<Habit>(`/habits/${id}`);
    return res.data;
  }

  /**
   * Create a new habit
   * @param habit - The habit data
   */
  async createHabit(habit: CreateHabitRequest): Promise<Habit> {
    const res = await apiService.post<Habit>("/habits", habit);
    return res.data;
  }

  /**
   * Update an existing habit
   * @param id - The ID of the habit
   * @param habit - The updated habit data
   */
  async updateHabit(id: string, habit: UpdateHabitRequest): Promise<Habit> {
    const res = await apiService.put<Habit>(`/habits/${id}`, habit);
    return res.data;
  }

  /**
   * Delete a habit
   * @param id - The ID of the habit
   */
  async deleteHabit(id: string): Promise<void> {
    await apiService.delete<void>(`/habits/${id}`);
  }

  /**
   * Get all records for a habit
   * @param id - The ID of the habit
   */
  async getHabitRecords(id: string): Promise<HabitRecord[]> {
    const res = await apiService.get<HabitRecord[]>(`/habits/${id}/records`);
    return res.data;
  }

  /**
   * Mark a habit as complete for a specific date
   * @param id - The ID of the habit
   * @param date - The date in ISO format
   */
  async markHabitComplete(id: string, date: string): Promise<HabitRecord> {
    const res = await apiService.post<HabitRecord>(`/habits/${id}/complete`, {
      date,
    });
    return res.data;
  }

  /**
   * Delete a habit completion for a specific date
   * @param id - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteHabitCompletion(id: string, date: string): Promise<void> {
    await apiService.delete<void>(`/habits/${id}/complete/${date}`);
  }

  /**
   * Archive a habit
   * @param id - The ID of the habit
   */
  async archiveHabit(id: string): Promise<Habit> {
    const res = await apiService.post<Habit>(`/habits/${id}/archive`);
    return res.data;
  }

  /**
   * Restore an archived habit
   * @param id - The ID of the habit
   */
  async restoreHabit(id: string): Promise<Habit> {
    const res = await apiService.post<Habit>(`/habits/${id}/restore`);
    return res.data;
  }

  /**
   * Get a random habit
   */
  async getRandomHabit(): Promise<Habit> {
    const res = await apiService.get<Habit>("/habits/random/pick");
    return res.data;
  }

  /**
   * Sync analytics for all habits or a specific habit
   * This recalculates streaks and counters based on actual completion data
   * @param habitId - Optional habit ID to sync only that habit
   */
  async syncAnalytics(habitId?: string): Promise<Habit | Habit[]> {
    const url = habitId
      ? `/habits/${habitId}/sync-analytics`
      : "/habits/sync-analytics";

    const res = await apiService.post<Habit | Habit[]>(url);
    return res.data;
  }

  /**
   * Reorder habits
   * @param habitIds - Array of habit IDs in desired order
   */
  async reorderHabits(habitIds: string[]): Promise<Habit[]> {
    const res = await apiService.put<Habit[]>("/habits/reorder", {
      habitIds,
    });
    return res.data;
  }
}

export const habitsService = new HabitsService();
