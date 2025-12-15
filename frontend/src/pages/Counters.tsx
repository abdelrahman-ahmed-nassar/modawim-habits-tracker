import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, Target, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import PageContainer from "../components/layout/PageContainer";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { countersService } from "../services/counters";
import { Counter } from "@shared/types";

const Counters: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCounters, setUpdatingCounters] = useState<Set<string>>(
    new Set()
  );

  const fetchCounters = async () => {
    try {
      setIsLoading(true);
      const data = await countersService.getAllCounters();
      setCounters(data);
      setError(null);
    } catch (err) {
      setError("فشل تحميل العدادات");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounters();
  }, []);

  const handleIncrement = async (counter: Counter) => {
    const counterId = counter._id;
    setUpdatingCounters((prev) => new Set(prev).add(counterId));

    // Optimistically update the UI
    setCounters((prevCounters) =>
      prevCounters.map((c) =>
          c._id === counterId ? { ...c, currentCount: c.currentCount + 1 } : c
      )
    );

    try {
      await countersService.incrementCounter(counterId, counter.currentCount);
    } catch (err) {
      toast.error("فشل زيادة العداد");
      console.error(err);
      // Revert the optimistic update on error
      await fetchCounters();
    } finally {
      setUpdatingCounters((prev) => {
        const newSet = new Set(prev);
        newSet.delete(counterId);
        return newSet;
      });
    }
  };

  const handleDecrement = async (counter: Counter) => {
    if (counter.currentCount === 0) return;

    const counterId = counter._id;
    setUpdatingCounters((prev) => new Set(prev).add(counterId));

    // Optimistically update the UI
    setCounters((prevCounters) =>
      prevCounters.map((c) =>
        c._id === counterId
          ? { ...c, currentCount: Math.max(0, c.currentCount - 1) }
          : c
      )
    );

    try {
      await countersService.decrementCounter(counterId, counter.currentCount);
    } catch (err) {
      toast.error("فشل تقليل العداد");
      console.error(err);
      // Revert the optimistic update on error
      await fetchCounters();
    } finally {
      setUpdatingCounters((prev) => {
        const newSet = new Set(prev);
        newSet.delete(counterId);
        return newSet;
      });
    }
  };

  const getProgressColor = (counter: Counter) => {
    const progress =
      counter.goal > 0 ? (counter.currentCount / counter.goal) * 100 : 0;
    if (progress >= 100) return "text-green-600 dark:text-green-400";
    if (progress >= 75) return "text-blue-600 dark:text-blue-400";
    if (progress >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getProgressBarColor = (counter: Counter) => {
    const progress =
      counter.goal > 0 ? (counter.currentCount / counter.goal) * 100 : 0;
    if (progress >= 100) return "bg-green-600";
    if (progress >= 75) return "bg-blue-600";
    if (progress >= 50) return "bg-yellow-600";
    return "bg-gray-600";
  };

  const renderCounterCard = (counter: Counter) => {
    const progress =
      counter.goal > 0 ? (counter.currentCount / counter.goal) * 100 : 0;
    const isUpdating = updatingCounters.has(counter._id);
    const isComplete = counter.currentCount >= counter.goal;

    return (
      <Card key={counter._id} className={isComplete ? "border-green-500" : ""}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{counter.name}</h3>
              {counter.motivationNote && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {counter.motivationNote}
                </p>
              )}
            </div>
            {isComplete && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Target className="w-4 h-4 ml-1" />
                <span>مكتمل</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                التقدم
              </span>
              <span
                className={`text-2xl font-bold ${getProgressColor(counter)}`}
              >
                {counter.currentCount} / {counter.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`${getProgressBarColor(
                  counter
                )} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
              {progress.toFixed(1)}%
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <Button
              onClick={() => handleDecrement(counter)}
              disabled={isUpdating || counter.currentCount === 0}
              variant="outline"
              className="flex items-center px-6 py-3"
            >
              <Minus className="w-5 h-5" />
            </Button>

            <div className="text-4xl font-bold text-center min-w-[80px]">
              {counter.currentCount}
            </div>

            <Button
              onClick={() => handleIncrement(counter)}
              disabled={isUpdating}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {isComplete && counter.currentCount > counter.goal && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center">
              <div className="flex items-center justify-center text-purple-700 dark:text-purple-300">
                <TrendingUp className="w-4 h-4 ml-2" />
                <span className="text-sm font-medium">
                  تجاوزت الهدف بـ {counter.currentCount - counter.goal}!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer
      title="العدادات"
      isLoading={isLoading}
      error={error}
      showBreadcrumbs={false}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">العدادات</h1>
        <p className="text-gray-600 dark:text-gray-400">
          تتبع تقدمك اليومي نحو أهدافك
        </p>
      </div>

      {counters.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold mb-2">لا توجد عدادات</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              ابدأ بإنشاء عداد جديد من{" "}
              <Link
                to="/settings?tab=counters"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                صفحة الإعدادات
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counters.map(renderCounterCard)}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              يمكنك إضافة أو تعديل العدادات من{" "}
              <Link
                to="/settings?tab=counters"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                صفحة الإعدادات
              </Link>
            </p>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default Counters;
