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
    bestDayOfWeek?: number;
    worstDayOfWeek?: number;
    longestStreak?: number;
    totalCompletions?: number;
    averageCompletionsPerWeek?: number;
}
export interface OverallAnalytics {
    totalHabits: number;
    activeHabitsCount: number;
    completedToday: number;
    mostConsistentHabits: Array<{
        habitId: string;
        habitName: string;
        successRate: number;
        currentStreak: number;
        bestStreak: number;
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
export interface DailyAnalytics {
    date: string;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
    habits: Array<{
        habitId: string;
        habitName: string;
        completed: boolean;
    }>;
}
export interface WeeklyAnalytics {
    startDate: string;
    endDate: string;
    totalHabits: number;
    completionRate: number;
    dailyStats: Array<{
        date: string;
        completedHabits: number;
        completionRate: number;
    }>;
}
export interface MonthlyAnalytics {
    year: number;
    month: number;
    totalHabits: number;
    completionRate: number;
    dailyStats: Array<{
        date: string;
        completedHabits: number;
        completionRate: number;
    }>;
}
export interface QuarterAnalytics {
    startDate: string;
    endDate: string;
    totalDays: number;
    dailyData: Array<{
        date: string;
        completionRate: number;
    }>;
}
export type { HabitAnalytics as default };
