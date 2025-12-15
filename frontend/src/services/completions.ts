import axios from "axios";

const API_BASE_URL = "http://localhost:5002/api";

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
    const response = await axios.get(
      `${API_BASE_URL}/completions/date/${date}`
    );
    return response.data.data;
  }

  /**
   * Get all completions for a specific habit
   * @param habitId - The ID of the habit
   */
  async getHabitCompletions(habitId: string): Promise<Completion[]> {
    const response = await axios.get(
      `${API_BASE_URL}/completions/habit/${habitId}`
    );
    return response.data.data;
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
    const response = await axios.get(
      `${API_BASE_URL}/completions/range/${startDate}/${endDate}`
    );
    return response.data.data;
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

    const response = await axios.post(
      `${API_BASE_URL}/completions`,
      requestData
    );
    return response.data.data;
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
    const response = await axios.post(`${API_BASE_URL}/completions/batch`, {
      completions,
    });
    return response.data.data;
  }

  /**
   * Toggle a completion status
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async toggleCompletion(habitId: string, date: string): Promise<Completion> {
    const response = await axios.post(`${API_BASE_URL}/completions/toggle`, {
      habitId,
      date,
    });
    return response.data.data;
  }

  /**
   * Delete a completion
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteCompletion(habitId: string, date: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/completions/${habitId}/${date}`);
  }

  /**
   * Mark a habit as complete for a specific date
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async markHabitComplete(habitId: string, date: string): Promise<Completion> {
    const response = await axios.post(
      `${API_BASE_URL}/habits/${habitId}/complete`,
      {
        date,
      }
    );
    return response.data.data;
  }

  /**
   * Delete a habit completion for a specific date
   * @param habitId - The ID of the habit
   * @param date - The date in ISO format
   */
  async deleteHabitCompletion(habitId: string, date: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/habits/${habitId}/complete/${date}`);
  }
}

export const completionsService = new CompletionsService();
