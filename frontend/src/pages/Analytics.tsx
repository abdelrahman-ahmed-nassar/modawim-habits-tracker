import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart2,
  ArrowLeft,
  Award,
  Flame,
  Calendar,
  Percent,
  RefreshCw,
} from "lucide-react";
import { analyticsService } from "../services/analytics";
import { habitsService } from "../services/habits";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Progress from "../components/ui/Progress";
import Badge from "../components/ui/Badge";
import OverallAnalytics from "../components/features/OverallAnalytics";
import HabitOverview from "../components/features/HabitOverview";
import EnhancedAnalyticsCharts from "../components/features/EnhancedAnalyticsCharts";
import AnalyticsSkeleton from "../components/skeletons/AnalyticsSkeleton";
import HabitDetailSkeleton from "../components/skeletons/HabitDetailSkeleton";
import { Habit } from "@shared/types/habit";
import { HabitAnalytics, EnhancedHabitAnalytics } from "../services/analytics";
import { toast } from "react-toastify";

interface HabitCardProps {
  habit: Habit;
  onClick: (habitId: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onClick }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => onClick(habit._id)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{habit.name}</h3>{" "}
          {habit.tag && <Badge variant="primary">{habit.tag}</Badge>}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {habit.description || "لا يوجد وصف"}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <Flame className="w-4 h-4 mr-1 text-orange-500" />
              السلسلة الحالية: {habit.currentStreak || 0}
            </span>
            <span className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-yellow-500" />
              أفضل سلسلة: {habit.bestStreak || 0}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>هدف السلسلة</span>
              <span>
                {habit.currentStreak || 0}/{habit.goalValue}
              </span>
            </div>
            <Progress
              value={((habit.currentStreak || 0) / habit.goalValue) * 100}
              className="h-2"
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-right text-blue-600 dark:text-blue-400">
          <span className="flex items-center justify-end">
            <BarChart2 className="w-3 h-3 mr-1" />
            عرض التحليلات
          </span>
        </div>
      </div>
    </Card>
  );
};

const HabitDetailView: React.FC<{ habitId: string; onBack: () => void }> = ({
  habitId,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [habitAnalytics, setHabitAnalytics] = useState<HabitAnalytics | null>(
    null
  );
  const [enhancedAnalytics, setEnhancedAnalytics] =
    useState<EnhancedHabitAnalytics | null>(null);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30days");

  const periodOptions = [
    { value: "7days", label: "آخر 7 أيام" },
    { value: "30days", label: "آخر 30 يوماً" },
    { value: "90days", label: "آخر 90 يوماً" },
    { value: "365days", label: "آخر سنة" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsData, habitData, enhancedData] = await Promise.all([
          analyticsService.getHabitAnalytics(habitId),
          habitsService.getHabit(habitId),
          analyticsService.getEnhancedHabitAnalytics(habitId, selectedPeriod),
        ]);
        setHabitAnalytics(analyticsData);
        setHabit(habitData);
        setEnhancedAnalytics(enhancedData);
      } catch (error) {
        console.error("Failed to fetch habit analytics:", error);
        toast.error("فشل تحميل تحليلات العادة");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [habitId, selectedPeriod]);

  if (loading) {
    return (
      <div className="p-6">
        <HabitDetailSkeleton />
      </div>
    );
  }

  if (!habitAnalytics || !habit || !enhancedAnalytics) {
    return (
      <div className="text-center p-8">
        <p>لا توجد بيانات تحليلية متاحة لهذه العادة.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> العودة إلى العادات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
          <h2 className="text-2xl font-bold ml-2">{habit.name}</h2>
          {habit.tag && (
            <Badge variant="primary" className="ml-2">
              {habit.tag}
            </Badge>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            الفترة:
          </span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              معدل النجاح
            </h3>
            <div className="flex items-center">
              <Percent className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {enhancedAnalytics.basicStats?.successRate
                  ? (enhancedAnalytics.basicStats.successRate * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              السلسلة الحالية
            </h3>
            <div className="flex items-center">
              <Flame className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">
                {enhancedAnalytics.basicStats?.currentStreak || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              أفضل سلسلة
            </h3>
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">
                {enhancedAnalytics.basicStats?.bestStreak || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              الأيام المكتملة
            </h3>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">
                {enhancedAnalytics.basicStats?.completedDays || 0}/
                {enhancedAnalytics.basicStats?.totalDays || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Analytics Charts */}
      <EnhancedAnalyticsCharts analytics={enhancedAnalytics} />

      {/* Legacy Completion History Chart (keep for now as fallback) */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">سجل الإنجاز الأخير</h3>
        {habitAnalytics.completionHistory &&
        habitAnalytics.completionHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex space-x-1 min-w-fit">
              {habitAnalytics.completionHistory
                .slice(-30)
                .map((entry, index: number) => {
                  const date = new Date(entry.date);
                  const day = date.getDate();
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-md ${
                          entry.completed
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        } flex items-center justify-center text-white text-sm font-medium`}
                      >
                        {day}
                      </div>
                      <span className="text-xs mt-1">
                        {date.toLocaleDateString(undefined, { month: "short" })}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">لا يوجد سجل إنجاز متاح</p>
        )}
      </Card>

      {/* Habit Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">تفاصيل العادة</h3>
        <div className="space-y-4">
          <p>
            <span className="font-medium">نمط التكرار:</span>{" "}
            {habit.repetition.charAt(0).toUpperCase() +
              habit.repetition.slice(1)}
          </p>
          <p>
            <span className="font-medium">نوع الهدف:</span>{" "}
            سلسلة
          </p>
          {habit.motivationNote && (
            <p>
              <span className="font-medium">ملاحظة التحفيز:</span>{" "}
              {habit.motivationNote}
            </p>
          )}
          <p>
            <span className="font-medium">تاريخ الإنشاء:</span>{" "}
            {new Date(habit.createdAt).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">فترة التحليل:</span>{" "}
            {enhancedAnalytics.period?.description} (
            {new Date(enhancedAnalytics.period?.startDate).toLocaleDateString()}{" "}
            - {new Date(enhancedAnalytics.period?.endDate).toLocaleDateString()}
            )
          </p>
        </div>
      </Card>
    </div>
  );
};

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { habitId } = useParams<{ habitId?: string }>();
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(
    habitId || null
  );
  const [viewMode, setViewMode] = useState<"habits" | "overall">("habits");
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);

  // Check if current route is /analytics/overview
  useEffect(() => {
    if (window.location.pathname.endsWith("/overview")) {
      setViewMode("overall");
    }
  }, []);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        const habitsData = await habitsService.getAllHabits();
        // Get only active habits
        const activeHabits = habitsData.filter((habit) => habit.isActive);
        setHabits(activeHabits);
      } catch (error) {
        console.error("Failed to fetch habits:", error);
        toast.error("فشل تحميل العادات");
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  // Update selectedHabitId when the URL parameter changes
  useEffect(() => {
    if (habitId) {
      setSelectedHabitId(habitId);
    }
  }, [habitId]);

  const handleHabitClick = (habitId: string) => {
    setSelectedHabitId(habitId);
    navigate(`/analytics/${habitId}`);
  };

  const handleBack = () => {
    setSelectedHabitId(null);
    navigate("/analytics");
  };

  const syncAnalytics = async () => {
    setSyncingAnalytics(true);
    try {
      // Sync analytics for all habits
      await habitsService.syncAnalytics();

      // Refresh the habits data to show updated analytics
      const habitsData = await habitsService.getAllHabits();
      const activeHabits = habitsData.filter((habit) => habit.isActive);
      setHabits(activeHabits);

      toast.success("تم تحديث الإحصائيات بنجاح");
    } catch (error) {
      console.error("Error syncing analytics:", error);
      toast.error("فشل تحديث الإحصائيات");
    } finally {
      setSyncingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <AnalyticsSkeleton />
      </div>
    );
  }
  if (selectedHabitId) {
    return (
      <div className="p-6">
        <HabitDetailView habitId={selectedHabitId} onBack={handleBack} />
      </div>
    );
  }
  if (viewMode === "overall") {
    return (
      <div className="p-6">
        <OverallAnalytics onBack={() => setViewMode("habits")} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">لوحة التحليلات</h1>
        <p className="text-gray-600 dark:text-gray-400">
          تتبع أداء عاداتك وحدد الاتجاهات لتحسين اتساقك.
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={syncAnalytics}
              disabled={syncingAnalytics}
              className="p-2"
              title="تحديث الإحصائيات"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncingAnalytics ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="outline" onClick={() => setViewMode("overall")}>
              <BarChart2 className="w-4 h-4 mr-2" /> التحليلات الشاملة
            </Button>
          </div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">لم يتم العثور على عادات</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            أنشئ عادة لبدء تتبع التحليلات
          </p>
          <Button className="mt-4" onClick={() => navigate("/settings")}>
            إنشاء عادة
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Habits Overview Section */}
          <HabitOverview habits={habits} onSelectHabit={handleHabitClick} />

          {/* Individual Habit Cards Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">جميع العادات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  onClick={handleHabitClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
