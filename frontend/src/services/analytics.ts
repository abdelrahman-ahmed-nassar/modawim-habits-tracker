import axios from "axios";

const API_BASE_URL = "http://localhost:5002/api";

interface AnalyticsOverview {
  totalHabits: number;
  activeHabitsCount: number;
  completedToday: number;
  mostConsistentHabits: Array<{
    habitId: string;
    habitName: string;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
    currentCounter: number;
  }>;
  longestStreakHabit: {
    habitName: string;
    bestStreak: number;
  };
  last30DaysSuccessRate: number;
  bestDayOfWeek: {
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalCompletions: number;
  };
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalCompletions: number;
  }>;
}

export interface HabitAnalytics {
  habitId: string;
  habitName: string;
  successRate: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
  completionHistory: Array<{
    date: string;
    completed: boolean;
  }>;
}

interface DailyAnalytics {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  habits: Array<{
    habitId: string;
    habitName: string;
    completed: boolean;
    value: number;
  }>;
}

interface WeeklyAnalytics {
  startDate: string;
  endDate: string;
  dailyStats: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>;
  weeklyStats: {
    overallSuccessRate: number;
    totalCompletions: number;
    mostProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    leastProductiveDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    };
    mostProductiveHabit: {
      habitId: string;
      habitName: string;
      activeDaysCount: number;
      completedDaysCount: number;
      successRate: number;
      completedDates: string[];
    };
  };
  habitStats: Array<{
    habitId: string;
    habitName: string;
    activeDaysCount: number;
    completedDaysCount: number;
    successRate: number;
    completedDates: string[];
  }>;
}

interface MonthlyAnalytics {
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  dailyCompletionCounts: Array<{
    date: string;
    dayOfWeek: number;
    dayName: string;
    count: number;
    totalHabits: number;
    completionRate: number;
  }>;
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    dayName: string;
    successRate: number;
    totalHabits: number;
    completedHabits: number;
  }>;
  habitStats: Array<{
    habitId: string;
    habitName: string;
    tag: string;
    activeDaysCount: number;
    completedDaysCount: number;
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
  }>;
  monthlyStats: {
    totalHabits: number;
    totalCompletions: number;
    overallCompletionRate: number;
    mostProductiveHabit: string | null;
    bestStreakHabit: string | null;
    bestDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      count: number;
      totalHabits: number;
      completionRate: number;
    } | null;
    worstDay: {
      date: string;
      dayOfWeek: number;
      dayName: string;
      count: number;
      totalHabits: number;
      completionRate: number;
    } | null;
  };
}

interface QuarterAnalytics {
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyData: Array<{
    date: string;
    completionRate: number;
  }>;
}

export interface EnhancedHabitAnalytics {
  habitId: string;
  habitName: string;
  period: {
    startDate: string;
    endDate: string;
    description: string;
  };
  basicStats: {
    totalDays: number;
    completedDays: number;
    successRate: number;
    currentStreak: number;
    bestStreak: number;
  };
  counterStats: {
    totalValue: number;
    goalValue: number;
    progress: number;
    completions: Array<{
      date: string;
      value: number;
    }>;
  } | null;
  dayOfWeekStats: Array<{
    dayOfWeek: number;
    totalDays: number;
    completedDays: number;
    successRate: number;
    dayName: string;
  }>;
  bestDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  worstDay: {
    dayOfWeek: number;
    dayName: string;
  } | null;
  topStreaks: Array<{
    startDate: string;
    endDate: string;
    length: number;
  }>;
  monthlyTrends: Array<{
    month: number;
    successRate: number;
    completions: number;
    monthName: string;
  }>;
}

interface NotesAnalyticsOverview {
  totalNotes: number;
  dateRange: {
    start: string;
    end: string;
  };
  moodDistribution: Record<string, number>;
  productivityDistribution: Record<string, number>;
  trendsOverTime: Array<{
    date: string;
    noteCount: number;
    avgMoodScore: number;
    avgProductivityScore: number;
  }>;
  insights: string[];
}

interface MoodTrends {
  trends: Array<{
    period: string;
    averageMoodScore: number;
    moodDistribution: Record<string, number>;
  }>;
  overallTrend: "improving" | "declining" | "stable";
  insights: string[];
}

interface ProductivityCorrelation {
  correlations: Array<{
    habitId: string;
    habitName: string;
    correlationScore: number;
    significance: "high" | "medium" | "low";
  }>;
  productivityTrends: Array<{
    date: string;
    averageProductivity: number;
    completedHabits: number;
  }>;
  insights: string[];
}

interface NotesCalendar {
  year: number;
  month: number;
  notes: Array<{
    date: string;
    hasNote: boolean;
    mood: string;
    productivityLevel: string;
    notePreview: string;
  }>;
}

export class AnalyticsService {
  /**
   * Get overall analytics data
   */
  async getOverallAnalytics(): Promise<AnalyticsOverview> {
    const response = await axios.get(`${API_BASE_URL}/analytics/overview`);
    return response.data.data;
  }

  /**
   * Get analytics for a specific habit
   * @param habitId - The ID of the habit
   */
  async getHabitAnalytics(habitId: string): Promise<HabitAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/habits/${habitId}`
    );
    return response.data.data;
  }

  /**
   * Get enhanced analytics for a specific habit with detailed data
   * @param habitId - The ID of the habit
   * @param period - The period for analytics (7days, 30days, 90days, 365days)
   */
  async getEnhancedHabitAnalytics(
    habitId: string,
    period: string = "30days"
  ): Promise<EnhancedHabitAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/habits/${habitId}?period=${period}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a specific date
   * @param date - The date in ISO format
   */
  async getDailyAnalytics(date: string): Promise<DailyAnalytics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/daily/${date}`);
    return response.data.data;
  }

  /**
   * Get analytics for a week starting from a specific date
   * @param startDate - The start date in ISO format
   */
  async getWeeklyAnalytics(startDate: string): Promise<WeeklyAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/weekly/${startDate}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a specific month
   * @param year - The year
   * @param month - The month (1-12)
   */
  async getMonthlyAnalytics(
    year: number,
    month: number
  ): Promise<MonthlyAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/monthly/${year}/${month}`
    );
    return response.data.data;
  }

  /**
   * Get analytics for a quarter period starting from a specific date
   * @param startDate - The start date in YYYY-MM-DD format
   */
  async getQuarterAnalytics(startDate: string): Promise<QuarterAnalytics> {
    const response = await axios.get(
      `${API_BASE_URL}/analytics/quarter/${startDate}`
    );
    return response.data.data;
  }

  /**
   * Get notes analytics overview
   * @param startDate - Optional start date in YYYY-MM-DD format
   * @param endDate - Optional end date in YYYY-MM-DD format
   */
  async getNotesAnalyticsOverview(
    startDate?: string,
    endDate?: string
  ): Promise<NotesAnalyticsOverview> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `${API_BASE_URL}/notes/analytics/overview?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get mood trends from notes
   * @param startDate - Optional start date in YYYY-MM-DD format
   * @param endDate - Optional end date in YYYY-MM-DD format
   * @param period - Grouping period: "day", "week", "month"
   */
  async getMoodTrends(
    startDate?: string,
    endDate?: string,
    period: "day" | "week" | "month" = "day"
  ): Promise<MoodTrends> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("period", period);

    const response = await axios.get(
      `${API_BASE_URL}/notes/analytics/mood-trends?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get productivity correlation with habits
   * @param startDate - Optional start date in YYYY-MM-DD format
   * @param endDate - Optional end date in YYYY-MM-DD format
   */
  async getProductivityCorrelation(
    startDate?: string,
    endDate?: string
  ): Promise<ProductivityCorrelation> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `${API_BASE_URL}/notes/analytics/productivity-correlation?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get notes calendar for a specific month
   * @param year - Year number
   * @param month - Month number (1-12)
   */
  async getNotesCalendar(year: number, month: number): Promise<NotesCalendar> {
    const response = await axios.get(
      `${API_BASE_URL}/notes/calendar/${year}/${month}`
    );
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();
