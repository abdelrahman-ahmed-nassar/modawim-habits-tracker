import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Flame,
  Download,
  Award,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import { analyticsService } from "../services/analytics";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { getArabicMonthName, getArabicDayName } from "../utils/dateUtils";

// Updated interface to match backend response structure
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

// No interface needed since we're navigating directly

const Monthly: React.FC = () => {
  const { year: yearParam, month: monthParam } = useParams();
  const navigate = useNavigate();

  // Current month state
  const [currentDate, setCurrentDate] = useState(() => {
    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10) - 1; // Convert to 0-based month
      return new Date(year, month, 1);
    }
    return new Date();
  });

  // Data state
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch monthly data
  const fetchMonthlyData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);

    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Convert to 1-based month

      const data = await analyticsService.getMonthlyAnalytics(year, month);
      setMonthlyData(data);

      // Update URL without causing navigation
      const newPath = `/monthly/${year}/${month}`;
      if (window.location.pathname !== newPath) {
        window.history.replaceState(null, "", newPath);
      }
    } catch (err) {
      console.error("Error fetching monthly data:", err);
      setError("Failed to load monthly data");
      toast.error("Failed to load monthly analytics");
    } finally {
      setLoading(false);
    }
  }, []);
  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    navigate(`/monthly/${year}/${month}`);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    navigate(`/monthly/${year}/${month}`);
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setCurrentDate(today);
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    navigate(`/monthly/${year}/${month}`);
  };
  // Handle day click - redirect to daily page
  const handleDayClick = (dayData: {
    date: string;
    totalHabits: number;
    count: number;
    completionRate: number;
  }) => {
    if (dayData.totalHabits === 0) return;

    // Navigate directly to the daily page for the selected date
    navigate(`/daily/${dayData.date}`);
  };

  // Export data function
  const exportMonthData = () => {
    if (!monthlyData) return;

    const csvData = [
      [
        "Date",
        "Day of Week",
        "Total Habits",
        "Completed Habits",
        "Completion Rate (%)",
      ],
      ...monthlyData.dailyCompletionCounts.map((day) => [
        day.date,
        day.dayName,
        day.totalHabits.toString(),
        day.count.toString(),
        (day.completionRate * 100).toFixed(1),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-${monthlyData.year}-${monthlyData.month
      .toString()
      .padStart(2, "0")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Monthly data exported successfully!");
  }; // Initialize data
  useEffect(() => {
    fetchMonthlyData(currentDate);
  }, [fetchMonthlyData, currentDate]);

  // Handle URL parameter changes when navigating directly or refreshing
  useEffect(() => {
    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10) - 1; // Convert to 0-based month
      const urlDate = new Date(year, month, 1);

      // Only update if the URL date is different from current date
      if (urlDate.getTime() !== currentDate.getTime()) {
        setCurrentDate(urlDate);
      }
    }
  }, [yearParam, monthParam, currentDate]); // React to URL parameter changes

  // Calendar grid setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Add padding days for calendar grid
  const startDay = getDay(monthStart);
  const paddingStart = Array.from({ length: startDay }, () => null);
  const paddingEnd = Array.from(
    { length: 42 - (calendarDays.length + startDay) },
    () => null
  );
  const allDays = [...paddingStart, ...calendarDays, ...paddingEnd];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading monthly analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={() => fetchMonthlyData(currentDate)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            العرض الشهري
          </h1>
          <Button
            onClick={goToCurrentMonth}
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
          >
            الشهر الحالي
          </Button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Export Button */}
          <Button
            onClick={exportMonthData}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            تصدير
          </Button>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
            <Button
              onClick={goToPreviousMonth}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center min-w-[140px]">
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                {getArabicMonthName(format(currentDate, "MMMM"))}{" "}
                {format(currentDate, "yyyy")}
              </p>
            </div>

            <Button
              onClick={goToNextMonth}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {monthlyData && (
        <>
          {/* Monthly Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Completion Rate */}
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">التقدم الشهري</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      monthlyData.monthlyStats.overallCompletionRate * 100
                    )}
                    %
                  </div>
                  <Progress
                    value={monthlyData.monthlyStats.overallCompletionRate * 100}
                    variant="default"
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {monthlyData.monthlyStats.totalCompletions} إكمالات
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Best Day */}
            {monthlyData.monthlyStats.bestDay && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">أفضل يوم</h3>
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {format(
                        new Date(monthlyData.monthlyStats.bestDay.date),
                        "MMM d"
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(
                        monthlyData.monthlyStats.bestDay.completionRate * 100
                      )}
                      % إكمال
                    </div>
                    <Link
                      to={`/daily/${monthlyData.monthlyStats.bestDay.date}`}
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
                    >
                      عرض التفاصيل ←
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Most Productive Habit */}
            {monthlyData.monthlyStats.mostProductiveHabit && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">أفضل عادة</h3>
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
                      {monthlyData.monthlyStats.mostProductiveHabit}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      الأكثر استمراريةً هذا الشهر
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Best Streak */}
            {monthlyData.monthlyStats.bestStreakHabit && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">أطول سلسلة</h3>
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
                      {monthlyData.monthlyStats.bestStreakHabit}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      أقوى سلسلة هذا الشهر
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>{" "}
          {/* Daily Cards Grid */}
          <Card className="shadow-sm hover:shadow-md transition-all mb-8">
            <CardHeader>
              <h3 className="text-base md:text-lg font-semibold">
                التقدم اليومي
              </h3>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {/* Make calendar horizontally scrollable on very small screens */}
              <div className="overflow-x-auto md:overflow-visible">
                <div className="min-w-[520px] md:min-w-0">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
                    {[
                      "الأحد",
                      "الإثنين",
                      "الثلاثاء",
                      "الأربعاء",
                      "الخميس",
                      "الجمعة",
                      "السبت",
                    ].map((day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 py-1 md:py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid with Cards */}
                  <div className="grid grid-cols-7 gap-1 md:gap-3">
                    {allDays.map((date, index) => {
                      if (!date) {
                        return (
                          <div key={index} className="h-20 sm:h-24 md:h-36"></div>
                        );
                      }

                      const dayData = monthlyData.dailyCompletionCounts.find(
                        (d) => isSameDay(new Date(d.date), date)
                      );

                      const completionRate = dayData
                        ? dayData.completionRate * 100
                        : 0;
                      const isCurrentDay = isToday(date);
                      const hasHabits = dayData && dayData.totalHabits > 0;

                      // Get completion rate color
                      const getCompletionColor = (rate: number) => {
                        if (rate === 0)
                          return "text-gray-400 dark:text-gray-500";
                        if (rate < 30) return "text-red-500 dark:text-red-400";
                        if (rate < 60)
                          return "text-yellow-500 dark:text-yellow-400";
                        if (rate < 80) return "text-blue-500 dark:text-blue-400";
                        return "text-green-500 dark:text-green-400";
                      };

                      const getBorderColor = (rate: number) => {
                        if (rate === 0)
                          return "border-gray-200 dark:border-gray-700";
                        if (rate < 30)
                          return "border-red-200 dark:border-red-800";
                        if (rate < 60)
                          return "border-yellow-200 dark:border-yellow-800";
                        if (rate < 80)
                          return "border-blue-200 dark:border-blue-800";
                        return "border-green-200 dark:border-green-800";
                      };

                      const getBackgroundColor = (rate: number) => {
                        if (rate === 0) return "bg-gray-50 dark:bg-gray-800";
                        if (rate < 30) return "bg-red-50 dark:bg-red-900/20";
                        if (rate < 60)
                          return "bg-yellow-50 dark:bg-yellow-900/20";
                        if (rate < 80) return "bg-blue-50 dark:bg-blue-900/20";
                        return "bg-green-50 dark:bg-green-900/20";
                      };

                      return (
                        <div
                          key={date.toISOString()}
                          className={`
            h-24 md:h-36 rounded-lg border transition-all duration-200 
            ${getBorderColor(completionRate)}
            ${getBackgroundColor(completionRate)}
            ${isCurrentDay ? "ring-2 ring-blue-500" : ""}
            ${
              hasHabits
                ? "hover:shadow-md cursor-pointer hover:scale-[1.02]"
                : "cursor-default opacity-75"
            }
            p-2 md:p-3 flex flex-col justify-between relative overflow-hidden
          `}
                          onClick={() => hasHabits && handleDayClick(dayData)}
                        >
                          {/* Date Header */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm sm:text-base md:text-lg font-bold ${
                                isCurrentDay
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {format(date, "d")}
                            </span>
                            {isCurrentDay && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>

                          {/* Progress Info */}
                          {hasHabits ? (
                            <div className="mt-auto">
                              {/* Habit Count & Day Name in one row */}
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                                  {dayData.count}/{dayData.totalHabits}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                  {dayData.dayName.slice(0, 3)}
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    completionRate === 0
                                      ? "bg-gray-300"
                                      : completionRate < 30
                                      ? "bg-red-500"
                                      : completionRate < 60
                                      ? "bg-yellow-500"
                                      : completionRate < 80
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${completionRate}%` }}
                                ></div>
                              </div>

                              {/* Completion Rate */}
                              <div
                                className={`text-sm sm:text-base md:text-xl font-bold ${getCompletionColor(
                                  completionRate
                                )}`}
                              >
                                {Math.round(completionRate)}%
                              </div>
                            </div>
                          ) : (
                            <div className="mt-auto">
                              <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                                No habits
                              </div>
                            </div>
                          )}

                          {/* Activity Indicator (small dots for visual enhancement) */}
                          {hasHabits && (
                            <div className="absolute top-1 right-1">
                              <div
                                className={`flex space-x-0.5 ${
                                  completionRate >= 80
                                    ? "opacity-80"
                                    : "opacity-40"
                                }`}
                              >
                                {[
                                  ...Array(
                                    Math.min(3, Math.ceil(dayData.count / 2))
                                  ),
                                ].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full ${
                                      completionRate >= 80
                                        ? "bg-green-500"
                                        : completionRate >= 60
                                        ? "bg-blue-500"
                                        : completionRate >= 30
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Day of Week Performance */}
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardHeader title="Day of Week Performance" />
              <CardContent className="p-6">
                <div className="space-y-4">
                  {monthlyData.dayOfWeekStats.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">
                          {day.dayName}
                        </div>
                        <div className="flex-1">
                          <Progress
                            value={day.successRate * 100}
                            variant={
                              day.successRate > 0.7
                                ? "success"
                                : day.successRate > 0.4
                                ? "warning"
                                : "error"
                            }
                            className="h-2 w-32"
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round(day.successRate * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Top Habits */}
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardHeader title="Top Performing Habits" />
              <CardContent className="p-6">
                <div className="space-y-4">
                  {monthlyData.habitStats.slice(0, 5).map((habit) => (
                    <div
                      key={habit.habitId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {habit.habitName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {habit.completedDaysCount}/{habit.activeDaysCount}{" "}
                            days
                          </div>
                        </div>
                        <Badge
                          variant={
                            habit.tag === "Health"
                              ? "success"
                              : habit.tag === "Work"
                              ? "primary"
                              : "default"
                          }
                          size="sm"
                        >
                          {habit.tag}
                        </Badge>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {Math.round(habit.completionRate * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {habit.currentStreak} day streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>{" "}
          </div>{" "}
          {/* Daily Completion Trend Chart */}
          <Card className="shadow-sm hover:shadow-md transition-all mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Daily Completion Trend
                </h3>
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تتبع معدلات إتمام عاداتك اليومية طوال الشهر لاكتشاف الأنماط
                  والحفاظ على الاستمرارية.
                </p>
              </div>
              <div className="h-80">
                <ReactApexChart
                  options={
                    {
                      chart: {
                        type: "line",
                        height: 350,
                        toolbar: {
                          show: false,
                        },
                        animations: {
                          enabled: true,
                          speed: 800,
                          animateGradually: {
                            enabled: true,
                            delay: 150,
                          },
                          dynamicAnimation: {
                            enabled: true,
                            speed: 350,
                          },
                        },
                      },
                      stroke: {
                        curve: "smooth",
                        width: 3,
                      },
                      colors: ["#10B981"],
                      grid: {
                        borderColor: "#E5E7EB",
                        strokeDashArray: 3,
                      },
                      xaxis: {
                        categories: monthlyData.dailyCompletionCounts.map(
                          (day) => {
                            const date = new Date(day.date);
                            const monthAbbr = format(date, "MMM");
                            const dayNum = format(date, "dd");
                            return `${getArabicMonthName(monthAbbr)} ${dayNum}`;
                          }
                        ),
                        labels: {
                          rotate: -45,
                          rotateAlways: true,
                          style: {
                            fontSize: "12px",
                            colors: "#6B7280",
                          },
                        },
                      },
                      yaxis: {
                        title: {
                          text: "معدل الإنجاز (%)",
                          style: {
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#374151",
                          },
                        },
                        min: 0,
                        max: 100,
                        labels: {
                          formatter: function (val: number) {
                            return Math.round(val) + "%";
                          },
                          style: {
                            colors: "#6B7280",
                          },
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: function (val: number) {
                            return Math.round(val) + "%";
                          },
                        },
                        x: {
                          formatter: function (
                            _val: number,
                            { dataPointIndex }
                          ) {
                            const dayData =
                              monthlyData.dailyCompletionCounts[dataPointIndex];
                            const date = new Date(dayData.date);
                            const dayNameEng = format(date, "EEEE");
                            const monthAbbr = format(date, "MMM");
                            const dayNum = format(date, "dd");
                            const dayName = getArabicDayName(dayNameEng);
                            const monthName = getArabicMonthName(monthAbbr);
                            return `${dayName}، ${monthName} ${dayNum} - ${dayData.count}/${dayData.totalHabits} عادات مكتملة`;
                          },
                        },
                      },
                      markers: {
                        size: 4,
                        colors: ["#10B981"],
                        strokeColors: "#fff",
                        strokeWidth: 2,
                        hover: {
                          size: 6,
                        },
                      },
                      fill: {
                        type: "gradient",
                        gradient: {
                          shade: "light",
                          type: "vertical",
                          shadeIntensity: 0.5,
                          gradientToColors: ["#34D399"],
                          inverseColors: false,
                          opacityFrom: 0.7,
                          opacityTo: 0.3,
                          stops: [0, 100],
                        },
                      },
                    } as ApexOptions
                  }
                  series={[
                    {
                      name: "Completion Rate",
                      data: monthlyData.dailyCompletionCounts.map((day) =>
                        Math.round((day.completionRate || 0) * 100)
                      ),
                    },
                  ]}
                  type="line"
                  height={350}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Average:{" "}
                  {Math.round(
                    monthlyData.monthlyStats.overallCompletionRate * 100
                  )}
                  %
                </span>
                <span>
                  Total Completions: {monthlyData.monthlyStats.totalCompletions}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Monthly;
