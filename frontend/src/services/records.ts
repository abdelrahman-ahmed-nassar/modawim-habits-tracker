import apiService from "./api";

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
    const res = await apiService.get<DailyRecords>(
      `/records/daily/${date}`
    );
    return res.data;
  }

  /**
   * Get weekly records starting from a specific date
   * @param startDate - Start date in YYYY-MM-DD format
   */
  static async getWeeklyRecords(startDate: string): Promise<WeeklyRecords> {
    const res = await apiService.get<WeeklyRecords>(
      `/records/weekly/${startDate}`
    );
    return res.data;
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
    const res = await apiService.get<MonthlyRecords>(
      `/records/monthly/${year}/${month}`
    );
    return res.data;
  }

  /**
   * Get habit records for a specific habit
   * @param habitId - ID of the habit
   */
  static async getHabitRecords(habitId: string): Promise<Record[]> {
    const res = await apiService.get<Record[]>(
      `/habits/${habitId}/records`
    );
    return res.data;
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
    const res = await apiService.post<Record>(
      `/habits/${habitId}/complete`,
      { date }
    );
    return res.data;
  }

  /**
   * Delete a completion record
   * @param habitId - ID of the habit
   * @param date - Date in YYYY-MM-DD format
   */
  static async deleteCompletion(habitId: string, date: string): Promise<void> {
    await apiService.delete<void>(
      `/habits/${habitId}/complete/${date}`
    );
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
    const res = await apiService.post<Record>("/completions/toggle", {
      habitId,
      date,
    });
    return res.data;
  }
}
