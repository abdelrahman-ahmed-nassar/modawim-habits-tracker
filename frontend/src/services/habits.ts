import axios from "axios";
import { Habit } from "@shared/types/habit";

const API_BASE_URL = "http://localhost:5002/api";

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
    const response = await axios.get(
      `${API_BASE_URL}/habits${includeInactive ? "?active=all" : ""}`
    );
    return response.data.data;
  }

  /**
   * Get a single habit by ID
   * @param id - The ID of the habit
   */
  async getHabit(id: string): Promise<Habit> {
    const response = await axios.get(`${API_BASE_URL}/habits/${id}`);
    return response.data.data;
  }

  /**
   * Create a new habit
   * @param habit - The habit data
   */
  async createHabit(habit: CreateHabitRequest): Promise<Habit> {
    const response = await axios.post(`${API_BASE_URL}/habits`, habit);
    return response.data.data;
  }

  /**
   * Update an existing habit
   * @param id - The ID of the habit
   * @param habit - The updated habit data
   */
  async updateHabit(id: string, habit: UpdateHabitRequest): Promise<Habit> {
    const response = await axios.put(`${API_BASE_URL}/habits/${id}`, habit);
    return response.data.data;
  }

  /**
   * Delete a habit
   * @param id - The ID of the habit
   */
  async deleteHabit(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/habits/${id}`);
  }

  /**
   * Get all records for a habit
   * @param id - The ID of the habit
   */
  async getHabitRecords(id: string): Promise<HabitRecord[]> {
    const response = await axios.get(`${API_BASE_URL}/habits/${id}/records`);
    return response.data.data;
  }

  /**
   * Mark a habit as complete for a specific date
   * @param id - The ID of the habit
   * @param date - The date in ISO format
   */
  async markHabitComplete(id: string, date: string): Promise<HabitRecord> {
    const response = await axios.post(`${API_BASE_URL}/habits/${id}/complete`, {
      date,
    });
    return response.data.data;
  }

  /**
   * Delete a habit completion for a specific date
   * @param id - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteHabitCompletion(id: string, date: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/habits/${id}/complete/${date}`);
  }

  /**
   * Archive a habit
   * @param id - The ID of the habit
   */
  async archiveHabit(id: string): Promise<Habit> {
    const response = await axios.post(`${API_BASE_URL}/habits/${id}/archive`);
    return response.data.data;
  }

  /**
   * Restore an archived habit
   * @param id - The ID of the habit
   */
  async restoreHabit(id: string): Promise<Habit> {
    const response = await axios.post(`${API_BASE_URL}/habits/${id}/restore`);
    return response.data.data;
  }

  /**
   * Get a random habit
   */
  async getRandomHabit(): Promise<Habit> {
    const response = await axios.get(`${API_BASE_URL}/habits/random/pick`);
    return response.data.data;
  }

  /**
   * Sync analytics for all habits or a specific habit
   * This recalculates streaks and counters based on actual completion data
   * @param habitId - Optional habit ID to sync only that habit
   */
  async syncAnalytics(habitId?: string): Promise<Habit | Habit[]> {
    const url = habitId
      ? `${API_BASE_URL}/habits/${habitId}/sync-analytics`
      : `${API_BASE_URL}/habits/sync-analytics`;

    const response = await axios.post(url);
    return response.data.data;
  }

  /**
   * Reorder habits
   * @param habitIds - Array of habit IDs in desired order
   */
  async reorderHabits(habitIds: string[]): Promise<Habit[]> {
    const response = await axios.put(`${API_BASE_URL}/habits/reorder`, {
      habitIds,
    });
    return response.data.data;
  }
}

export const habitsService = new HabitsService();
