import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  addYears,
  subYears,
  eachMonthOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart2,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { analyticsService } from "../services/analytics";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Progress from "../components/ui/Progress";
import ReactApexChart from "react-apexcharts";
import QuarterAnalytics from "../components/QuarterAnalytics";

interface YearlyMonthData {
  month: number;
  monthName: string;
  completionRate: number;
  totalCompletions: number;
  totalHabits: number;
}

interface YearlyQuarterData {
  quarter: number;
  startDate: string;
  endDate: string;
  completionRate: number;
  title: string;
}

interface YearlyAnalytics {
  year: number;
  months: YearlyMonthData[];
  quarters: YearlyQuarterData[];
  topHabits: Array<{
    habitId: string;
    habitName: string;
    completionRate: number;
  }>;
  yearlyStats: {
    totalHabits: number;
    totalCompletions: number;
    overallCompletionRate: number;
    bestMonth: {
      month: number;
      monthName: string;
      completionRate: number;
    } | null;
    worstMonth: {
      month: number;
      monthName: string;
      completionRate: number;
    } | null;
    bestHabit: {
      habitId: string;
      habitName: string;
      completionRate: number;
    } | null;
  };
}

const Yearly: React.FC = () => {
  const { year: yearParam } = useParams();
  const navigate = useNavigate();

  // Current year state
  const [currentDate, setCurrentDate] = useState(() => {
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      return new Date(year, 0, 1);
    }
    return new Date();
  });

  // Data state
  const [yearlyData, setYearlyData] = useState<YearlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate quarterly data for the current year
  const getQuarterData = useCallback((year: number): YearlyQuarterData[] => {
    return [
      {
        quarter: 1,
        startDate: `${year}-01-01`,
        endDate: `${year}-03-31`,
        completionRate: 0,
        title: "تحليل الربع الأول",
      },
      {
        quarter: 2,
        startDate: `${year}-04-01`,
        endDate: `${year}-06-30`,
        completionRate: 0,
        title: "تحليل الربع الثاني",
      },
      {
        quarter: 3,
        startDate: `${year}-07-01`,
        endDate: `${year}-09-30`,
        completionRate: 0,
        title: "تحليل الربع الثالث",
      },
      {
        quarter: 4,
        startDate: `${year}-10-01`,
        endDate: `${year}-12-31`,
        completionRate: 0,
        title: "تحليل الربع الرابع",
      },
    ];
  }, []);

  // Fetch yearly data by aggregating monthly analytics
  const fetchYearlyData = useCallback(
    async (date: Date) => {
      setLoading(true);
      setError(null);

      try {
        const year = date.getFullYear();
        const yearStart = startOfYear(date);
        const yearEnd = endOfYear(date);
        const monthsInYear = eachMonthOfInterval({
          start: yearStart,
          end: yearEnd,
        });

        // Fetch analytics for each month of the year
        const monthDataPromises = monthsInYear.map((monthDate) => {
          const monthYear = monthDate.getFullYear();
          const month = monthDate.getMonth() + 1; // 1-based month
          return analyticsService.getMonthlyAnalytics(monthYear, month);
        });

        const monthlyResults = await Promise.all(monthDataPromises);

        // Calculate aggregate yearly statistics
        let totalCompletions = 0;
        let overallCompletionRateSum = 0;
        let bestMonthRate = 0;
        let worstMonthRate = 1;
        let bestMonth: YearlyMonthData | null = null;
        let worstMonth: YearlyMonthData | null = null;
        const habitCompletionRates: Record<
          string,
          { count: number; total: number; name: string }
        > = {};

        // Process monthly data
        const monthsData: YearlyMonthData[] = monthlyResults.map(
          (data, index) => {
            const monthNum = index + 1;
            const monthDate = new Date(year, index, 1);
            const monthName = format(monthDate, "MMMM");
            const completionRate = data.monthlyStats.overallCompletionRate;
            totalCompletions += data.monthlyStats.totalCompletions; // Find best and worst months
            if (completionRate > bestMonthRate) {
              bestMonthRate = completionRate;
              bestMonth = {
                month: monthNum,
                monthName,
                completionRate,
                totalCompletions: data.monthlyStats.totalCompletions,
                totalHabits: data.monthlyStats.totalHabits,
              };
            }

            if (completionRate < worstMonthRate) {
              worstMonthRate = completionRate;
              worstMonth = {
                month: monthNum,
                monthName,
                completionRate,
                totalCompletions: data.monthlyStats.totalCompletions,
                totalHabits: data.monthlyStats.totalHabits,
              };
            }

            // Aggregate habit data
            data.habitStats.forEach((habit) => {
              if (!habitCompletionRates[habit.habitId]) {
                habitCompletionRates[habit.habitId] = {
                  count: 0,
                  total: 0,
                  name: habit.habitName,
                };
              }
              habitCompletionRates[habit.habitId].count +=
                habit.completedDaysCount;
              habitCompletionRates[habit.habitId].total +=
                habit.activeDaysCount;
            });

            overallCompletionRateSum += completionRate;

            return {
              month: monthNum,
              monthName,
              completionRate,
              totalCompletions: data.monthlyStats.totalCompletions,
              totalHabits: data.monthlyStats.totalHabits,
            };
          }
        );

        // Calculate yearly average completion rate
        const yearlyAvgCompletionRate =
          overallCompletionRateSum / monthsData.length;

        // Get top habits
        const topHabits = Object.entries(habitCompletionRates)
          .map(([habitId, data]) => ({
            habitId,
            habitName: data.name,
            completionRate: data.total > 0 ? data.count / data.total : 0,
          }))
          .sort((a, b) => b.completionRate - a.completionRate)
          .slice(0, 5);

        // Get quarter data
        const quarters = getQuarterData(year);

        // Create the yearly analytics data structure
        const yearlyAnalytics: YearlyAnalytics = {
          year,
          months: monthsData,
          quarters,
          topHabits,
          yearlyStats: {
            totalHabits: monthsData.length > 0 ? monthsData[0].totalHabits : 0,
            totalCompletions,
            overallCompletionRate: yearlyAvgCompletionRate,
            bestMonth,
            worstMonth,
            bestHabit: topHabits.length > 0 ? topHabits[0] : null,
          },
        };

        setYearlyData(yearlyAnalytics);

        // Update URL without causing navigation
        const newPath = `/yearly/${year}`;
        if (window.location.pathname !== newPath) {
          window.history.replaceState(null, "", newPath);
        }
      } catch (err) {
        console.error("Error fetching yearly data:", err);
        setError("Failed to load yearly data");
        toast.error("Failed to load yearly analytics");
      } finally {
        setLoading(false);
      }
    },
    [getQuarterData]
  );

  // Navigation functions
  const goToPreviousYear = () => {
    const newDate = subYears(currentDate, 1);
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    navigate(`/yearly/${year}`);
  };

  const goToNextYear = () => {
    const newDate = addYears(currentDate, 1);
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    navigate(`/yearly/${year}`);
  };

  const goToCurrentYear = () => {
    const today = new Date();
    setCurrentDate(today);
    const year = today.getFullYear();
    navigate(`/yearly/${year}`);
  };

  // Export data function
  const exportYearData = () => {
    if (!yearlyData) return;

    const csvData = [
      ["Month", "Completion Rate (%)", "Total Completions", "Total Habits"],
      ...yearlyData.months.map((month) => [
        month.monthName,
        (month.completionRate * 100).toFixed(1),
        month.totalCompletions.toString(),
        month.totalHabits.toString(),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yearly-habits-${yearlyData.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Yearly data exported successfully!");
  };

  // Initialize data
  useEffect(() => {
    fetchYearlyData(currentDate);
  }, [fetchYearlyData, currentDate]);

  // Handle URL parameter changes when navigating directly or refreshing
  useEffect(() => {
    if (yearParam) {
      const year = parseInt(yearParam, 10);
      const urlDate = new Date(year, 0, 1); // January 1st of the year

      // Only update if the URL date's year is different from current date's year
      if (urlDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(urlDate);
      }
    }
  }, [yearParam, currentDate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading yearly analytics...
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
          <Button onClick={() => fetchYearlyData(currentDate)}>
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
            العرض السنوي
          </h1>
          <Button
            onClick={goToCurrentYear}
            variant="secondary"
            size="sm"
            className="whitespace-nowrap"
          >
            السنة الحالية
          </Button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Export Button */}
          <Button
            onClick={exportYearData}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            تصدير
          </Button>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
            <Button
              onClick={goToPreviousYear}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center min-w-[100px]">
              <p className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                {yearlyData?.year || format(currentDate, "yyyy")}
              </p>
            </div>

            <Button
              onClick={goToNextYear}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {yearlyData && (
        <>
          {/* Yearly Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Completion Rate */}
            <Card className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold">
                    التقدم السنوي
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(
                      yearlyData.yearlyStats.overallCompletionRate * 100
                    )}
                    %
                  </div>
                  <Progress
                    value={yearlyData.yearlyStats.overallCompletionRate * 100}
                    variant="default"
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {yearlyData.yearlyStats.totalCompletions} إكمالات
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Best Month */}
            {yearlyData.yearlyStats.bestMonth && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold">
                      أفضل شهر
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {yearlyData.yearlyStats.bestMonth.monthName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(
                        yearlyData.yearlyStats.bestMonth.completionRate * 100
                      )}
                      % إكمال
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Worst Month */}
            {yearlyData.yearlyStats.worstMonth && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold">
                      يحتاج تحسين
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {yearlyData.yearlyStats.worstMonth.monthName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(
                        yearlyData.yearlyStats.worstMonth.completionRate * 100
                      )}
                      % إكمال
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Most Productive Habit */}
            {yearlyData.yearlyStats.bestHabit && (
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold">
                      أفضل عادة
                    </h3>
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
                      {yearlyData.yearlyStats.bestHabit.habitName}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(
                        yearlyData.yearlyStats.bestHabit.completionRate * 100
                      )}
                      % معدل النجاح
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Monthly Performance Chart */}
          <Card className="mb-8 shadow-sm">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg md:text-xl font-semibold">الأداء الشهري</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px] sm:h-[400px]">
                <ReactApexChart
                  options={{
                    chart: {
                      type: "bar",
                      toolbar: {
                        show: false,
                      },
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        columnWidth: "60%",
                      },
                    },
                    dataLabels: {
                      enabled: false,
                    },
                    stroke: {
                      width: 2,
                    },
                    grid: {
                      borderColor: "#e5e7eb",
                      row: {
                        colors: ["#f8fafc", "transparent"],
                        opacity: 0.5,
                      },
                    },
                    xaxis: {
                      categories: yearlyData.months.map(
                        (month) => month.monthName
                      ),
                      axisBorder: {
                        show: false,
                      },
                      axisTicks: {
                        show: false,
                      },
                    },
                    yaxis: {
                      title: {
                        text: "Completion Rate (%)",
                      },
                      max: 100,
                    },
                    fill: {
                      opacity: 1,
                    },
                    tooltip: {
                      y: {
                        formatter: function (val) {
                          return val.toFixed(1) + "%";
                        },
                      },
                    },
                    colors: ["#3b82f6"],
                  }}
                  series={[
                    {
                      name: "Completion Rate",
                      data: yearlyData.months.map((month) =>
                        Math.round(month.completionRate * 100)
                      ),
                    },
                  ]}
                  type="bar"
                  height={350}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Habits */}
          <Card className="mb-8 shadow-sm">
            <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg md:text-xl font-semibold">
                Top Performing Habits
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              {yearlyData.topHabits.length > 0 ? (
                <div className="space-y-4">
                  {yearlyData.topHabits.map((habit, index) => (
                    <div
                      key={habit.habitId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="font-medium truncate max-w-[200px] sm:max-w-none">
                          {habit.habitName}
                        </div>
                      </div>
                      <Badge variant="success">
                        {Math.round(habit.completionRate * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                  No habit data available for this year
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quarter Analytics */}
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            تحليل الأرباع السنوية
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {yearlyData.quarters.map((quarter) => (
              <QuarterAnalytics
                key={quarter.quarter}
                startDate={quarter.startDate}
                title={quarter.title}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Yearly;
