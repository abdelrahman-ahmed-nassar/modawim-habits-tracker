import React from "react";
import { Habit } from "@shared/types/habit";
import Card from "../ui/Card";
import { BarChart2, Clock, Flame } from "lucide-react";
import Badge from "../ui/Badge";

interface HabitOverviewProps {
  habits: Habit[];
  onSelectHabit: (habitId: string) => void;
}

const HabitOverview: React.FC<HabitOverviewProps> = ({
  habits,
  onSelectHabit,
}) => {
  // Group habits by tags
  const habitsByTag: Record<string, Habit[]> = {};

  habits.forEach((habit) => {
    const tag = habit.tag || "غير مصنف";
    if (!habitsByTag[tag]) {
      habitsByTag[tag] = [];
    }
    habitsByTag[tag].push(habit);
  });

  // Calculate completion stats
  const totalHabits = habits.length;
  const habitsWithStreak = habits.filter(
    (habit) => habit.currentStreak && habit.currentStreak > 0
  );
  const averageStreak =
    habitsWithStreak.length > 0
      ? habitsWithStreak.reduce(
          (sum, habit) => sum + (habit.currentStreak || 0),
          0
        ) / habitsWithStreak.length
      : 0;
  const highestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.bestStreak || 0),
    0
  );
  const habitWithHighestStreak = habits.find(
    (habit) => habit.bestStreak === highestStreak
  );

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
        نظرة عامة على العادات
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            إجمالي العادات النشطة
          </h3>
          <p className="text-2xl font-bold mt-1">{totalHabits}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            متوسط السلسلة الحالية
          </h3>
          <p className="text-2xl font-bold mt-1">
            {averageStreak.toFixed(1)} أيام
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            أعلى سلسلة
          </h3>
          <p className="text-2xl font-bold mt-1">
            {highestStreak} أيام
            {habitWithHighestStreak && (
              <span className="block text-sm font-normal mt-1 text-gray-600 dark:text-gray-300">
                {habitWithHighestStreak.name}
              </span>
            )}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-medium mb-3">العادات حسب الفئة</h3>

      <div className="space-y-6">
        {Object.entries(habitsByTag).map(([tag, habitsInTag]) => (
          <div key={tag} className="space-y-2">
            <div className="flex items-center">
              <Badge variant="primary" className="mr-2">
                {tag}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {habitsInTag.length} عادة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {habitsInTag.map((habit) => (
                <div
                  key={habit._id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => onSelectHabit(habit._id)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-base">{habit.name}</h4>
                    <span className="flex items-center text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">
                      <Flame className="w-3 h-3 mr-1" />
                      {habit.currentStreak || 0}
                    </span>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {habit.repetition}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      عرض التحليلات ←
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default HabitOverview;
