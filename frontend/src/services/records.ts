const API_BASE_URL = "http://localhost:5002/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Record {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
  habitName: string;
  habitTag: string;
  goalValue: number;
}

interface DailyStats {
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}

interface DailyRecords {
  date: string;
  records: Record[];
  stats: DailyStats;
}

interface WeeklyRecords {
  startDate: string;
  endDate: string;
  records: DailyRecords[];
}

interface MonthlyRecords {
  year: number;
  month: number;
  records: DailyRecords[];
}

export class RecordsService {
  /**
   * Get daily records for a specific date
   * @param date - Date in YYYY-MM-DD format
   */
  static async getDailyRecords(date: string): Promise<DailyRecords> {
    const response = await fetch(`${API_BASE_URL}/records/daily/${date}`);
    const result: ApiResponse<DailyRecords> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch daily records");
    }

    return result.data;
  }

  /**
   * Get weekly records starting from a specific date
   * @param startDate - Start date in YYYY-MM-DD format
   */
  static async getWeeklyRecords(startDate: string): Promise<WeeklyRecords> {
    const response = await fetch(`${API_BASE_URL}/records/weekly/${startDate}`);
    const result: ApiResponse<WeeklyRecords> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch weekly records");
    }

    return result.data;
  }

  /**
   * Get monthly records for a specific year and month
   * @param year - Year (e.g., 2024)
   * @param month - Month (1-12)
   */
  static async getMonthlyRecords(
    year: number,
    month: number
  ): Promise<MonthlyRecords> {
    const response = await fetch(
      `${API_BASE_URL}/records/monthly/${year}/${month}`
    );
    const result: ApiResponse<MonthlyRecords> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch monthly records");
    }

    return result.data;
  }

  /**
   * Get habit records for a specific habit
   * @param habitId - ID of the habit
   */
  static async getHabitRecords(habitId: string): Promise<Record[]> {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/records`);
    const result: ApiResponse<Record[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch habit records");
    }

    return result.data;
  }

  /**
   * Mark a habit as complete for a specific date
   * @param habitId - ID of the habit
   * @param date - Date in YYYY-MM-DD format
   */
  static async markHabitComplete(
    habitId: string,
    date: string
  ): Promise<Record> {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date }),
    });

    const result: ApiResponse<Record> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to mark habit as complete");
    }

    return result.data;
  }

  /**
   * Delete a completion record
   * @param habitId - ID of the habit
   * @param date - Date in YYYY-MM-DD format
   */
  static async deleteCompletion(habitId: string, date: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/habits/${habitId}/complete/${date}`,
      {
        method: "DELETE",
      }
    );

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete completion");
    }
  }

  /**
   * Toggle a habit completion for a specific date
   * @param habitId - ID of the habit
   * @param date - Date in YYYY-MM-DD format
   */
  static async toggleCompletion(
    habitId: string,
    date: string
  ): Promise<Record> {
    const response = await fetch(`${API_BASE_URL}/completions/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ habitId, date }),
    });

    const result: ApiResponse<Record> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to toggle completion");
    }

    return result.data;
  }
}
