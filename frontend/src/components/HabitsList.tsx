import { useEffect, useState } from "react";
import { habitsService } from "@/services/habits";
import type { Habit } from "@shared/types";

export default function HabitsList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await habitsService.getAllHabits();
        setHabits(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch habits");
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading habits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Habits</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <div
            key={habit._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-2">{habit.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {habit.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Current Streak: {habit.currentStreak}</span>
              <span>Best Streak: {habit.bestStreak}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm">
                {habit.repetition}
              </span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                {habit.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
