import React from "react";
import { format, parseISO, addDays } from "date-fns";
import {
  BarChart2,
  Calendar,
  CheckCircle,
  Award,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface WeeklyAnalyticsProps {
  analytics: {
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
  };
}

const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({ analytics }) => {
  // Ensure habitStats exists and is an array before sorting
  const sortedHabitStats = [...(analytics.habitStats || [])].sort(
    (a, b) => b.successRate - a.successRate
  );

  // Ensure dailyStats exists and is an array before sorting
  const sortedDailyStats = [...(analytics.dailyStats || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  // Ensure we have all 7 days and the startDate is valid
  const startDate = analytics.startDate
    ? parseISO(analytics.startDate)
    : new Date();
  const allDailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(startDate, i), "yyyy-MM-dd");
    const existingStat = sortedDailyStats.find(
      (stat) => stat && stat.date === date
    );
    return (
      existingStat || {
        date,
        dayOfWeek: i,
        dayName: format(addDays(startDate, i), "EEEE"),
        totalHabits:
          (analytics.dailyStats && analytics.dailyStats[0]?.totalHabits) || 0,
        completedHabits: 0,
        completionRate: 0,
      }
    );
  });

  // Get top 5 performing habits
  const topHabits = sortedHabitStats.slice(0, 5);

  // Get bottom 5 performing habits, sorted from worst to best
  const bottomHabits = [...sortedHabitStats]
    .filter((habit) => habit.activeDaysCount > 0) // Only consider habits that were active
    .slice(-5)
    .sort((a, b) => a.successRate - b.successRate); // Sort worst performing first

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {" "}
        {/* Overall Success Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            معدل النجاح الكلي
          </h3>
          <div className="flex items-center">
            <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-2xl font-bold">
              {analytics.weeklyStats?.overallSuccessRate?.toFixed(1) || "0"}%
            </span>
          </div>
        </div>
        {/* Total Completions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            إجمالي الإنجازات
          </h3>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-2xl font-bold">
              {analytics.weeklyStats?.totalCompletions || 0}
            </span>
          </div>
        </div>
        {/* Most Productive Day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            أكثر الأيام إنتاجية
          </h3>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-xl font-bold">
                {analytics.weeklyStats?.mostProductiveDay?.dayName ||
                  "غير متوفر"}
              </span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
              {(analytics.weeklyStats?.mostProductiveDay?.completionRate || 0).toFixed(1)}%
              تم الإنجاز
            </div>
          </div>
        </div>{" "}
        {/* Best Performing Habit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            أفضل عادة
          </h3>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              <span
                className="text-lg font-bold truncate"
                title={
                  analytics.weeklyStats?.mostProductiveHabit?.habitName ||
                  "None"
                }
              >
                {analytics.weeklyStats?.mostProductiveHabit?.habitName ||
                  "لا يوجد"}
              </span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
              {analytics.weeklyStats?.mostProductiveHabit?.successRate
                ? (
                    analytics.weeklyStats.mostProductiveHabit.successRate * 100
                  ).toFixed(0)
                : "0"}
              % معدل النجاح
            </div>
          </div>
        </div>
      </div>
      {/* Daily Completion Chart */}{" "}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
          معدلات الإنجاز اليومية
        </h3>
        <div className="h-64 flex items-end justify-around gap-1">
          {allDailyStats.map((day) => {
            // Determine color based on completion rate
            let barColor = "bg-blue-500";
            if (day.completionRate >= 80) barColor = "bg-green-500";
            else if (day.completionRate < 40) barColor = "bg-amber-500";

            const dayDate = format(parseISO(day.date), "MMM d");

            return (
              <div key={day.date} className="flex flex-col items-center group">
                <div className="flex flex-col items-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="font-bold">
                    {Math.round(day.completionRate)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.completedHabits}/{day.totalHabits} تم الإنجاز
                  </div>
                </div>
                <div className="relative w-14 flex flex-col items-center justify-end h-48">
                  <div
                    className={`w-10 md:w-12 ${barColor} hover:w-12 transition-all rounded-t-lg shadow-sm hover:shadow absolute bottom-0`}
                    style={{
                      height: `${Math.max(
                        Math.min(day.completionRate, 100),
                        5
                      )}%`,
                    }}
                    title={`${day.dayName}: ${Math.round(
                      day.completionRate
                    )}% completed (${day.completedHabits}/${day.totalHabits})`}
                  ></div>
                  <div className="w-10 md:w-12 bg-gray-100 dark:bg-gray-700 absolute bottom-0 -z-10 h-full"></div>
                </div>
                <div className="mt-2 text-xs font-medium text-center">
                  {day.dayName.substring(0, 3)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {dayDate}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {/* Top & Bottom Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 5 Habits */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            أفضل العادات أداءً
          </h3>
          <div className="space-y-3">
            {topHabits.map((habit) => (
              <div
                key={habit.habitId}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium truncate" title={habit.habitName}>
                    {habit.habitName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {habit.completedDaysCount}/{habit.activeDaysCount} يوم تم
                    الإنجاز
                  </div>
                </div>
                <Badge
                  variant={habit.successRate > 0.7 ? "success" : "primary"}
                  size="sm"
                >
                  {(habit.successRate * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
            {topHabits.length === 0 && (
              <div className="text-center text-gray-500 italic py-2">
                لا توجد بيانات للعادات
              </div>
            )}
          </div>
        </Card>

        {/* Bottom 5 Habits */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
            عادات تحتاج إلى انتباه
          </h3>
          <div className="space-y-3">
            {bottomHabits.map((habit) => (
              <div
                key={habit.habitId}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium truncate" title={habit.habitName}>
                    {habit.habitName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {habit.completedDaysCount}/{habit.activeDaysCount} يوم تم
                    الإنجاز
                  </div>
                </div>
                <Badge
                  variant={habit.successRate < 0.3 ? "error" : "warning"}
                  size="sm"
                >
                  {(habit.successRate * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
            {bottomHabits.length === 0 && (
              <div className="text-center text-gray-500 italic py-2">
                لا توجد بيانات للعادات
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Weekly Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-500" />
          رؤى الأسبوع
        </h3>

        <div className="space-y-4">
          {" "}
          {/* Most productive day insight */}
          {analytics.weeklyStats?.mostProductiveDay && (
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">
                  أكثر أيامك إنتاجية كان يوم{" "}
                  {analytics.weeklyStats?.mostProductiveDay?.dayName ||
                    "غير معروف"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  أنجزت{" "}
                  {analytics.weeklyStats?.mostProductiveDay?.completedHabits ||
                    0}{" "}
                  من أصل{" "}
                  {analytics.weeklyStats?.mostProductiveDay?.totalHabits || 0}{" "}
                  عادة (
                  {(analytics.weeklyStats?.mostProductiveDay?.completionRate ||
                    0).toFixed(1)}
                  %).
                </p>
              </div>
            </div>
          )}
          {/* Least productive day insight */}
          {analytics.weeklyStats?.leastProductiveDay && (
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium">
                  أقل أيامك إنتاجية كان يوم{" "}
                  {analytics.weeklyStats?.leastProductiveDay?.dayName ||
                    "غير معروف"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  أنجزت فقط{" "}
                  {analytics.weeklyStats?.leastProductiveDay?.completedHabits ||
                    0}{" "}
                  من أصل{" "}
                  {analytics.weeklyStats?.leastProductiveDay?.totalHabits || 0}{" "}
                  عادة (
                  {(analytics.weeklyStats?.leastProductiveDay?.completionRate ||
                    0).toFixed(1)}
                  %).
                </p>
              </div>
            </div>
          )}{" "}
          {/* Best habit insight */}
          {analytics.weeklyStats?.mostProductiveHabit && (
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">
                  "
                  {analytics.weeklyStats?.mostProductiveHabit?.habitName ||
                    "غير معروف"}
                  " كانت أكثر عاداتك انتظامًا
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  أنجزتها في{" "}
                  {analytics.weeklyStats?.mostProductiveHabit
                    ?.completedDaysCount || 0}{" "}
                  من أصل{" "}
                  {analytics.weeklyStats?.mostProductiveHabit
                    ?.activeDaysCount || 0}{" "}
                  يوم نشط (
                  {analytics.weeklyStats?.mostProductiveHabit?.successRate
                    ? (
                        analytics.weeklyStats.mostProductiveHabit.successRate *
                        100
                      ).toFixed(0)
                    : "0"}
                  %).
                </p>
              </div>
            </div>
          )}
          {/* Overall performance insight */}
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2 flex-shrink-0">
              <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium">الأداء الكلي</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                هذا الأسبوع أنجزت {analytics.weeklyStats?.totalCompletions || 0}{" "}
                عادة بمعدل نجاح كلي{" "}
                {analytics.weeklyStats?.overallSuccessRate?.toFixed(1) || "0"}%.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyAnalytics;
