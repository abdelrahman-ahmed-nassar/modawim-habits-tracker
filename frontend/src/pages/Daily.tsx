import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, subDays, isValid, parseISO } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Grid3X3,
  List,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { RecordsService } from "../services/records";
import { NotesService } from "../services/notes";
import { habitsService } from "../services/habits";
import { completionsService } from "../services/completions";
import HabitCard from "../components/features/HabitCard";
import DailyNotes from "../components/features/DailyNotes";
import Button from "../components/ui/Button";
import { getArabicDayName, getArabicMonthName } from "../utils/dateUtils";
import Progress from "../components/ui/Progress";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { DailyNote } from "@shared/types/note";

interface Record {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
  habitName: string;
  habitTag: string;
  goalValue: number;
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
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

interface TabData {
  tag: string;
  records: Record[];
  completed: number;
  total: number;
  completionRate: number;
}

const Daily: React.FC = () => {
  const { date: urlDate } = useParams<{ date: string }>();
  const navigate = useNavigate();

  // Initialize date from URL parameter or default to today
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (urlDate) {
      const parsed = parseISO(urlDate);
      if (isValid(parsed)) {
        return parsed;
      }
    }
    return new Date();
  });
  const [dailyRecords, setDailyRecords] = useState<DailyRecords | null>(null);
  const [dailyNote, setDailyNote] = useState<DailyNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [updatingHabits, setUpdatingHabits] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("habits");
  const [activeHabitTab, setActiveHabitTab] = useState<string>("الجميع");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);

  const formattedDate = format(currentDate, "yyyy-MM-dd");

  // Create Arabic display date
  const dayNameEnglish = format(currentDate, "EEEE");
  const monthNameEnglish = format(currentDate, "MMMM");
  const dayNumber = format(currentDate, "d");
  const year = format(currentDate, "yyyy");

  const dayName = getArabicDayName(dayNameEnglish);
  const monthName = getArabicMonthName(monthNameEnglish);

  const displayDate = `${dayName}، ${dayNumber} ${monthName} ${year}`;

  const fetchDailyData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }
      setTransitioning(false); // Clear transitioning state
      try {
        // First, get all active habits
        const allHabits = await habitsService.getAllHabits();
        const activeHabits = allHabits.filter((habit) => habit.isActive);

        // Filter habits based on repetition pattern and current date
        const currentDateObj = new Date(formattedDate);
        const dayOfWeek = currentDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayOfMonth = currentDateObj.getDate(); // 1-31

        const habitsForToday = activeHabits.filter((habit) => {
          // Check if habit was created before or on this date
          if (
            habit.createdAt &&
            habit.createdAt.split("T")[0] > formattedDate
          ) {
            return false;
          }

          // Filter based on repetition pattern
          if (habit.repetition === "daily") {
            return true; // Daily habits appear every day
          } else if (habit.repetition === "weekly") {
            // Weekly habits appear only on specific days of the week
            return habit.specificDays && habit.specificDays.includes(dayOfWeek);
          } else if (habit.repetition === "monthly") {
            // Monthly habits appear only on specific days of the month
            return (
              habit.specificDays && habit.specificDays.includes(dayOfMonth)
            );
          }

          return false; // Unknown repetition pattern
        });

        // Get existing completions for this date
        const existingCompletions =
          await completionsService.getDailyCompletions(formattedDate); // Create a map of existing completions for quick lookup
        const completionMap = new Map(
          existingCompletions.map((c) => [c.habitId, c])
        ); // Create records for habits scheduled for today, using existing completions or defaults
        const records = habitsForToday.map((habit) => {
          const completion = completionMap.get(habit.id);
          const completed = completion ? completion.completed : false;

          return {
            id: completion?.id || `temp-${habit.id}`,
            habitId: habit.id,
            date: formattedDate,
            completed,
            completedAt: completion?.completedAt || "",
            habitName: habit.name,
            habitTag: habit.tag,
            goalValue: habit.goalValue,
            // Add analytics data from habit object
            currentStreak: habit.currentStreak || 0,
            bestStreak: habit.bestStreak || 0,
            successRate: 0, // Will be calculated if needed
            currentCounter: habit.currentCounter || 0,
          };
        });

        // Calculate stats
        const completedHabits = records.filter((r) => r.completed).length;
        const totalHabits = records.length;
        const completionRate =
          totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

        // Set the daily records
        setDailyRecords({
          date: formattedDate,
          records,
          stats: {
            totalHabits,
            completedHabits,
            completionRate,
          },
        });

      } catch (error) {
        console.error("Error fetching daily data:", error);
        toast.error("Failed to load daily data");
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [formattedDate]
  );

  const fetchDailyNote = useCallback(async () => {
    try {
      const note = await NotesService.getNoteByDate(formattedDate);
      setDailyNote(note);
    } catch {
      // Note doesn't exist for this date or other error – just treat as empty
      setDailyNote(null);
    }
  }, [formattedDate]);
  useEffect(() => {
    fetchDailyData();
  }, [fetchDailyData]);

  // Lazy-load daily note only when the Notes tab is active
  useEffect(() => {
    if (activeTab === "notes") {
      fetchDailyNote();
    }
  }, [activeTab, fetchDailyNote]);
  // Handle URL parameter changes (only when urlDate changes)
  useEffect(() => {
    if (urlDate) {
      const parsed = parseISO(urlDate);
      if (isValid(parsed)) {
        setCurrentDate(parsed);
      }
    }
  }, [urlDate]); // Only depend on urlDate
  const goToPreviousDay = () => {
    setTransitioning(true);
    const newDate = subDays(currentDate, 1);
    const newFormattedDate = format(newDate, "yyyy-MM-dd");
    navigate(`/daily/${newFormattedDate}`);
  };

  const goToNextDay = () => {
    setTransitioning(true);
    const newDate = addDays(currentDate, 1);
    const newFormattedDate = format(newDate, "yyyy-MM-dd");
    navigate(`/daily/${newFormattedDate}`);
  };

  const goToToday = () => {
    const newDate = new Date();
    const newFormattedDate = format(newDate, "yyyy-MM-dd");

    // Only set transitioning if we're actually navigating to a different date
    if (newFormattedDate !== formattedDate) {
      setTransitioning(true);
      navigate(`/daily/${newFormattedDate}`);
    }
  };

  const syncAnalytics = async () => {
    setSyncingAnalytics(true);
    try {
      // Sync analytics for all habits
      await habitsService.syncAnalytics();

      // Refresh the daily data to show updated analytics
      await fetchDailyData(false);

      toast.success("تم تحديث الإحصائيات بنجاح");
    } catch (error) {
      console.error("Error syncing analytics:", error);
      toast.error("فشل تحديث الإحصائيات");
    } finally {
      setSyncingAnalytics(false);
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!dailyRecords) return;

    // Add habit to updating set to show loading state
    setUpdatingHabits((prev) => new Set(prev).add(habitId));

    // Optimistic update: Update UI immediately
    const optimisticRecords = { ...dailyRecords };
    const recordIndex = optimisticRecords.records.findIndex(
      (r) => r.habitId === habitId
    );
    if (recordIndex !== -1) {
      const currentRecord = optimisticRecords.records[recordIndex];
      const newCompleted = !currentRecord.completed;

      // Update the record
      optimisticRecords.records[recordIndex] = {
        ...currentRecord,
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : "",
      };

      // Recalculate stats
      const completedHabits = optimisticRecords.records.filter(
        (r) => r.completed
      ).length;
      const totalHabits = optimisticRecords.records.length;
      const completionRate =
        totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      optimisticRecords.stats = {
        totalHabits,
        completedHabits,
        completionRate,
      };

      // Update state immediately for smooth UX
      setDailyRecords(optimisticRecords);
    }
    try {
      // Make API call in background
      await RecordsService.toggleCompletion(habitId, formattedDate);

      // Fetch updated habit data to get the latest analytics (streaks, counter)
      const updatedHabit = await habitsService.getHabit(habitId);

      // Update the record with fresh analytics data
      if (updatedHabit && dailyRecords) {
        const updatedRecords = { ...dailyRecords };
        const recordIdx = updatedRecords.records.findIndex(
          (r) => r.habitId === habitId
        );
        if (recordIdx !== -1) {
          updatedRecords.records[recordIdx] = {
            ...updatedRecords.records[recordIdx],
            currentStreak: updatedHabit.currentStreak || 0,
            bestStreak: updatedHabit.bestStreak || 0,
            currentCounter: updatedHabit.currentCounter || 0,
          };
          setDailyRecords(updatedRecords);
        }
      }

      toast.success("Habit completion updated");
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      toast.error("Failed to update habit completion");

      // Revert optimistic update on error
      await fetchDailyData(false);
    } finally {
      // Remove habit from updating set
      setUpdatingHabits((prev) => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  const markAllComplete = async (tag: string) => {
    if (!dailyRecords) return;

    const habitsToComplete = dailyRecords.records.filter(
      (record) => record.habitTag === tag && !record.completed
    );

    if (habitsToComplete.length === 0) {
      toast.info(`All ${tag} habits are already complete`);
      return;
    }

    // Optimistic update: Update all habits in the tag immediately
    const optimisticRecords = { ...dailyRecords };
    const updatedRecords = optimisticRecords.records.map((record) => {
      if (record.habitTag === tag && !record.completed) {
        return {
          ...record,
          completed: true,
          completedAt: new Date().toISOString(),
        };
      }
      return record;
    });

    optimisticRecords.records = updatedRecords;

    // Recalculate stats
    const completedHabits = updatedRecords.filter((r) => r.completed).length;
    const totalHabits = updatedRecords.length;
    const completionRate =
      totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    optimisticRecords.stats = {
      totalHabits,
      completedHabits,
      completionRate,
    };

    // Update state immediately
    setDailyRecords(optimisticRecords);

    try {
      // Use batch API to create all completions in a single atomic operation
      // This prevents race conditions and ensures all habits are marked consistently
      const completionsToCreate = habitsToComplete.map((habit) => ({
        habitId: habit.habitId,
        date: formattedDate,
        completed: true,
      }));

      await completionsService.createCompletionsBatch(completionsToCreate);

      // Refresh from backend to avoid stale local state
      await fetchDailyData(false);
      toast.success(`All ${tag} habits marked as complete`);
    } catch (error) {
      console.error("Error marking all habits complete:", error);
      toast.error("Failed to mark all habits complete");

      // Revert optimistic update on error
      await fetchDailyData(false);
    }
  };

  const getTabsData = (): TabData[] => {
    if (!dailyRecords) return [];

    const tagGroups = new Map<string, Record[]>();

    // Group records by tag
    dailyRecords.records.forEach((record) => {
      const tag = record.habitTag || "Uncategorized";
      if (!tagGroups.has(tag)) {
        tagGroups.set(tag, []);
      }
      tagGroups.get(tag)!.push(record);
    });

    // Create tab data
    const tabs: TabData[] = [];

    // Add "All" tab
    tabs.push({
      tag: "الجميع",
      records: dailyRecords.records,
      completed: dailyRecords.stats.completedHabits,
      total: dailyRecords.stats.totalHabits,
      completionRate: dailyRecords.stats.completionRate,
    });

    // Add individual tag tabs
    tagGroups.forEach((records, tag) => {
      const completed = records.filter((r) => r.completed).length;
      const total = records.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      tabs.push({
        tag,
        records,
        completed,
        total,
        completionRate,
      });
    });

    return tabs;
  };

  const getCurrentTabData = (): TabData | null => {
    const tabs = getTabsData();
    return tabs.find((tab) => tab.tag === activeHabitTab) || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/2 sm:w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabsData = getTabsData();
  const currentTabData = getCurrentTabData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Date Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center justify-between md:justify-start space-x-3 space-x-reverse">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            المتابعة اليومية
          </h1>
          <Button
            onClick={goToToday}
            variant="secondary"
            size="sm"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            اليوم
          </Button>
          <Button
            onClick={syncAnalytics}
            variant="outline"
            size="sm"
            className="p-2"
            disabled={syncingAnalytics}
            title="تحديث الإحصائيات"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncingAnalytics ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="flex items-center justify-between md:justify-end space-x-3 space-x-reverse">
          <Button
            onClick={goToPreviousDay}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center max-w-[180px] sm:max-w-none">
            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-snug">
              {displayDate}
            </p>
          </div>

          <Button
            onClick={goToNextDay}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>{" "}
      {/* Overall Progress */}
      {dailyRecords && (
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">التقدم اليومي</h2>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300">
                {Math.round(dailyRecords.stats.completionRate)}%
              </div>
            </div>
            <Progress
              value={dailyRecords.stats.completionRate}
              className="h-3 mb-2 transition-all duration-500"
              variant="default"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300">
              {dailyRecords.stats.completedHabits} من{" "}
              {dailyRecords.stats.totalHabits} عادة مكتملة
            </p>
          </div>
        </Card>
      )}{" "}
      {/* Modern Main Tabs */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
          <nav className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 sm:space-x-reverse">
            {" "}
            <button
              onClick={() => setActiveTab("habits")}
              className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "habits"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>العادات</span>
              {dailyRecords && (
                <Badge
                  variant={activeTab === "habits" ? "default" : "primary"}
                  size="sm"
                  className={
                    activeTab === "habits" ? "bg-white/20 text-white" : ""
                  }
                >
                  {dailyRecords.stats.completedHabits}/
                  {dailyRecords.stats.totalHabits}
                </Badge>
              )}
            </button>{" "}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "notes"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>اليوميات</span>
              {dailyNote && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
      </div>
      {/* Tab Content */}
      {activeTab === "habits" && (
        <>
          {/* Enhanced Habit Tags Navigation with View Controls */}
          {tabsData.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2">
                  {tabsData.map((tab) => (
                    <button
                      key={tab.tag}
                      onClick={() => setActiveHabitTab(tab.tag)}
                      className={`group relative inline-flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                        activeHabitTab === tab.tag
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:scale-102"
                      }`}
                    >
                      <span className="font-semibold">{tab.tag}</span>
                      <div className="flex items-center space-x-1">
                        <Badge
                          variant={
                            tab.completionRate === 100
                              ? "success"
                              : activeHabitTab === tab.tag
                              ? "default"
                              : "default"
                          }
                          size="sm"
                          className={`
                            ${
                              activeHabitTab === tab.tag
                                ? "bg-white/20 text-white border-white/30"
                                : tab.completionRate === 100
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ""
                            }
                          `}
                        >
                          {tab.completed}/{tab.total}
                        </Badge>
                        {tab.completionRate === 100 && (
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              activeHabitTab === tab.tag
                                ? "text-white"
                                : "text-green-500"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>{" "}
                {/* Enhanced View Mode Controls */}
                <div className="flex items-center space-x-3 space-x-reverse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
                    العرض:
                  </span>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-1 flex">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-700"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      <span>شبكة</span>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-700"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>قائمة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}{" "}
          {/* Enhanced Mark All Complete Button */}
          {currentTabData &&
            activeHabitTab !== "الجميع" &&
            currentTabData.completed < currentTabData.total && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          إكمال كل عادات {activeHabitTab}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentTabData.total - currentTabData.completed} عادة
                          متبقية
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => markAllComplete(activeHabitTab)}
                      variant="primary"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 font-medium"
                    >
                      إكمال الكل
                    </Button>
                  </div>
                </div>
              </div>
            )}
          {/* Habits List */}
          {currentTabData && currentTabData.records.length > 0 ? (
            viewMode === "grid" ? (
              <div
                className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
                  transitioning ? "opacity-50" : "opacity-100"
                }`}
              >
                {" "}
                {currentTabData.records.map((record) => (
                  <HabitCard
                    key={record.habitId}
                    record={record}
                    onToggleCompletion={toggleHabitCompletion}
                    isUpdating={updatingHabits.has(record.habitId)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentTabData.records.map((record) => (
                  <HabitListItem
                    key={record.habitId}
                    record={record}
                    onToggleCompletion={toggleHabitCompletion}
                    isUpdating={updatingHabits.has(record.habitId)}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <div className="p-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  لا توجد عادات لهذا اليوم
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {activeHabitTab === "الجميع"
                    ? "ليس لديك أي عادات مجدولة لهذا التاريخ."
                    : `لم يتم العثور على عادات ${activeHabitTab} لهذا التاريخ.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={goToToday} variant="primary" size="sm">
                    الذهاب إلى اليوم
                  </Button>
                  <Button variant="outline" size="sm">
                    إدارة العادات
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
      {activeTab === "notes" && (
        <DailyNotes
          date={formattedDate}
          initialNote={dailyNote}
          onNoteUpdate={fetchDailyNote}
        />
      )}
    </div>
  );
};

export default Daily;

// HabitListItem Component for minimal checklist view
interface HabitListItemProps {
  record: Record;
  onToggleCompletion: (habitId: string) => void;
  isUpdating: boolean;
}

const HabitListItem: React.FC<HabitListItemProps> = ({
  record,
  onToggleCompletion,
  isUpdating,
}) => {
  const handleClick = () => {
    if (!isUpdating) {
      onToggleCompletion(record.habitId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-md ${
        record.completed
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
      } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Left side: Checkbox and habit info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {" "}
        {/* Minimal checkbox-style completion toggle */}
        <div
          className={`flex-shrink-0 w-6 h-6 border flex items-center justify-center transition-all duration-200 p-0 rounded-md ${
            record.completed
              ? "bg-blue-500 border-blue-500 text-white"
              : "border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400 bg-white dark:bg-gray-700"
          }`}
        >
          {isUpdating ? (
            <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            record.completed && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )
          )}
        </div>
        {/* Habit name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <h3
              className={`font-medium truncate transition-all duration-200 ${
                record.completed
                  ? "line-through text-gray-500 dark:text-gray-400"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {record.habitName}
            </h3>
            <Badge
              variant={record.completed ? "success" : "default"}
              size="sm"
              className="flex-shrink-0"
            >
              {record.habitTag}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side: Completion info */}
      <div className="flex-shrink-0 text-right">
        {record.completed && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{record.date}</span>
          </div>
        )}
        {!record.completed && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            الهدف: {record.goalValue} أيام
          </div>
        )}
      </div>
    </div>
  );
};
