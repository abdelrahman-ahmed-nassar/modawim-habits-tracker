import { DailyNote } from "@shared/types/note";
import apiService from "./api";

export class NotesService {
  /**
   * Get all notes
   */
  static async getAllNotes(): Promise<DailyNote[]> {
    const res = await apiService.get<DailyNote[]>("/notes");
    return res.data;
  }

  /**
   * Get note by date
   * @param date - Date in YYYY-MM-DD format
   */
  static async getNoteByDate(date: string): Promise<DailyNote> {
    const res = await apiService.get<DailyNote>(`/notes/${date}`);
    return res.data;
  }

  /**
   * Create a new note
   */
  static async createNote(
    note: Omit<DailyNote, "_id" | "createdAt" | "updatedAt" | "userId">
  ): Promise<DailyNote> {
    const res = await apiService.post<DailyNote>("/notes", note);
    return res.data;
  }

  /**
   * Update an existing note
   */
  static async updateNote(
    id: string,
    note: Partial<Omit<DailyNote, "_id" | "date" | "createdAt" | "updatedAt">>
  ): Promise<DailyNote> {
    const res = await apiService.put<DailyNote>(`/notes/${id}`, note);
    return res.data;
  }

  /**
   * Delete a note
   */
  static async deleteNote(id: string): Promise<void> {
    await apiService.delete<void>(`/notes/${id}`);
  }
  /**
   * Get available moods
   */
  static async getMoods(): Promise<string[]> {
    const res = await apiService.get<string[]>(
      "/options/moods",
      { params: { legacy: "true" } }
    );
    return res.data;
  }

  /**
   * Add a new mood
   */
  static async addMood(mood: string): Promise<void> {
    await apiService.post<void>("/options/moods", { mood });
  }

  /**
   * Remove a mood
   */
  static async removeMood(mood: string): Promise<void> {
    await apiService.delete<void>(`/options/moods/${encodeURIComponent(mood)}`);
  }
  /**
   * Get available productivity levels
   */
  static async getProductivityLevels(): Promise<string[]> {
    const res = await apiService.get<string[]>(
      "/options/productivity-levels",
      { params: { legacy: "true" } }
    );
    return res.data;
  }

  /**
   * Add a new productivity level
   */
  static async addProductivityLevel(level: string): Promise<void> {
    await apiService.post<void>("/options/productivity-levels", { level });
  }
  /**
   * Remove a productivity level
   */
  static async removeProductivityLevel(level: string): Promise<void> {
    await apiService.delete<void>(
      `/options/productivity-levels/${encodeURIComponent(level)}`
    );
  }

  /**
   * Get notes analytics overview
   */ static async getNotesAnalytics(): Promise<{
    totalNotes: number;
    notesWithMood: number;
    notesWithProductivity: number;
    moodDistribution: Record<string, number>;
    productivityDistribution: Record<string, number>;
    monthlyFrequency: Record<string, number>;
    avgContentLength: number;
    longestStreak: number;
    currentStreak: number;
    avgMoodValue: number | null;
    avgProductivityValue: number | null;
    moodValueMap: Record<string, number>;
    productivityValueMap: Record<string, number>;
    monthlyMoodScores: Record<
      string,
      { avg: number; count: number; sum: number }
    >;
    monthlyProductivityScores: Record<
      string,
      { avg: number; count: number; sum: number }
    >;
    completionRate: {
      mood: number;
      productivity: number;
    };
  }> {
    const res = await apiService.get<{
      totalNotes: number;
      notesWithMood: number;
      notesWithProductivity: number;
      moodDistribution: Record<string, number>;
      productivityDistribution: Record<string, number>;
      monthlyFrequency: Record<string, number>;
      avgContentLength: number;
      longestStreak: number;
      currentStreak: number;
      avgMoodValue: number | null;
      avgProductivityValue: number | null;
      moodValueMap: Record<string, number>;
      productivityValueMap: Record<string, number>;
      monthlyMoodScores: Record<
        string,
        { avg: number; count: number; sum: number }
      >;
      monthlyProductivityScores: Record<
        string,
        { avg: number; count: number; sum: number }
      >;
      completionRate: {
        mood: number;
        productivity: number;
      };
    }>("/notes/analytics/overview");

    return res.data;
  }

  /**
   * Get mood trends over time
   */ static async getMoodTrends(
    startDate?: string,
    endDate?: string
  ): Promise<{
    trends: Array<{
      month: string;
      averageMood: number;
      count: number;
      distribution: Array<{
        label: string;
        value: number;
        count: number;
      }>;
    }>;
    moodValueMap: Record<string, number>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await apiService.get<{
      trends: Array<{
        month: string;
        averageMood: number;
        count: number;
        distribution: Array<{
          label: string;
          value: number;
          count: number;
        }>;
      }>;
      moodValueMap: Record<string, number>;
    }>("/notes/analytics/mood-trends", {
      params: Object.fromEntries(params.entries()),
    });

    return res.data;
  }

  /**
   * Get productivity correlation with habits
   */ static async getProductivityCorrelation(): Promise<{
    correlations: Array<{
      habitId: string;
      habitName: string;
      datesCompletedCount: number;
      datesNotCompletedCount: number;
      avgProductivityWithCompletion: number | null;
      avgProductivityWithoutCompletion: number | null;
      productivityImpact: number | null;
    }>;
    productivityValueMap: Record<string, number>;
  }> {
    const res = await apiService.get<{
      correlations: Array<{
        habitId: string;
        habitName: string;
        datesCompletedCount: number;
        datesNotCompletedCount: number;
        avgProductivityWithCompletion: number | null;
        avgProductivityWithoutCompletion: number | null;
        productivityImpact: number | null;
      }>;
      productivityValueMap: Record<string, number>;
    }>("/notes/analytics/productivity-correlation");

    return res.data;
  }

  /**
   * Get calendar data for notes
   */ static async getNotesCalendar(
    year: number,
    month: number
  ): Promise<{
    year: number;
    month: number;
    totalNotes: number;
    calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    >;
  }> {
    const res = await apiService.get<{
      year: number;
      month: number;
      notes: Array<{
        date: string;
        id: string;
        hasContent: boolean;
        contentPreview: string;
        mood?: string;
        moodValue?: number;
        productivityLevel?: string;
        productivityValue?: number;
      }>;
    }>(`/notes/calendar/${year}/${month}`);

    // Transform the data to the format expected by the NotesCalendar component
    const calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    > = {};

    // Populate the calendar data with entries from the notes array
    if (res.data.notes && Array.isArray(res.data.notes)) {
      res.data.notes.forEach((note) => {
        if (note.date) {
          calendarData[note.date] = {
            hasNote: true,
            mood: note.mood,
            productivityLevel: note.productivityLevel,
            contentLength: note.hasContent
              ? note.contentPreview?.length || 0
              : 0,
          };
        }
      });
    }

    return {
      year: res.data.year,
      month: res.data.month,
      totalNotes: res.data.notes?.length || 0,
      calendarData: calendarData,
    };
  }
}
