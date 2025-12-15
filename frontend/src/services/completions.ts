import apiService from "./api";

interface Completion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
}

class CompletionsService {
  /**
   * Get all completions for a specific date
   * @param date - The date in ISO format
   */
  async getDailyCompletions(date: string): Promise<Completion[]> {
    const res = await apiService.get<Completion[]>(
      `/completions/date/${date}`
    );
    return res.data;
  }

  /**
   * Get all completions for a specific habit
   * @param habitId - The ID of the habit
   */
  async getHabitCompletions(habitId: string): Promise<Completion[]> {
    const res = await apiService.get<Completion[]>(
      `/completions/habit/${habitId}`
    );
    return res.data;
  }

  /**
   * Get completions within a date range
   * @param startDate - The start date in ISO format
   * @param endDate - The end date in ISO format
   */
  async getCompletionsInRange(
    startDate: string,
    endDate: string
  ): Promise<Completion[]> {
    const res = await apiService.get<Completion[]>(
      `/completions/range/${startDate}/${endDate}`
    );
    return res.data;
  }
  /**
   * Create a new completion
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   * @param completed - Optional completion status (defaults to true)
   */
  async createCompletion(
    habitId: string,
    date: string,
    completed?: boolean
  ): Promise<Completion> {
    const requestData: {
      habitId: string;
      date: string;
      completed?: boolean;
    } = {
      habitId,
      date,
    };

    if (completed !== undefined) {
      requestData.completed = completed;
    }

    const res = await apiService.post<Completion>(
      "/completions",
      requestData
    );
    return res.data;
  }

  /**
   * Create multiple completions in a batch (prevents race conditions)
   * @param completions - Array of completion data
   */
  async createCompletionsBatch(
    completions: Array<{
      habitId: string;
      date: string;
      completed?: boolean;
    }>
  ): Promise<Completion[]> {
    const res = await apiService.post<Completion[]>(
      "/completions/batch",
      { completions }
    );
    return res.data;
  }

  /**
   * Toggle a completion status
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async toggleCompletion(habitId: string, date: string): Promise<Completion> {
    const res = await apiService.post<Completion>("/completions/toggle", {
      habitId,
      date,
    });
    return res.data;
  }

  /**
   * Delete a completion
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteCompletion(habitId: string, date: string): Promise<void> {
    await apiService.delete<void>(
      `/completions/${habitId}/${date}`
    );
  }

  /**
   * Mark a habit as complete for a specific date
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async markHabitComplete(habitId: string, date: string): Promise<Completion> {
    const res = await apiService.post<Completion>(
      `/habits/${habitId}/complete`,
      { date }
    );
    return res.data;
  }

  /**
   * Delete a habit completion for a specific date
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteHabitCompletion(habitId: string, date: string): Promise<void> {
    await apiService.delete<void>(
      `/habits/${habitId}/complete/${date}`
    );
  }
}

export const completionsService = new CompletionsService();
