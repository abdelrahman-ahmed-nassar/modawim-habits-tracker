import React from "react";
import { Target, Flame, TrendingUp } from "lucide-react";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Progress from "../ui/Progress";

interface Record {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string;
  habitName: string;
  habitTag: string;
  goalValue: number;
  // Analytics fields
  currentStreak: number;
  bestStreak: number;
  currentCounter: number;
}

interface HabitCardProps {
  record: Record;
  onToggleCompletion: (habitId: string) => void;
  isUpdating?: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({
  record,
  onToggleCompletion,
  isUpdating = false,
}) => {
  const getProgressValue = () => {
    return record.completed ? 100 : 0;
  };

  const getProgressDisplay = () => {
    return record.completed ? "مكتمل" : "غير مكتمل";
  };

  const progressValue = getProgressValue();

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md  flex flex-col flex${
        record.completed ? "ring-2 ring-green-200 dark:ring-green-800" : ""
      } min-h-[310px]`}
    >
      <CardHeader
        title={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate pr-2">
              {record.habitName}
            </h3>
            <Badge variant={record.completed ? "success" : "default"} size="sm">
              {record.habitTag}
            </Badge>
          </div>
        }
      />

      <CardContent className="flex flex-col justify-between  h-full">
        {/* Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">التقدم</span>
            <span className="font-medium">{getProgressDisplay()}</span>
          </div>
          <Progress
            value={progressValue}
            variant={record.completed ? "success" : "default"}
            className="h-2"
          />
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-sm font-medium">{record.currentStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              الحالي
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-medium">{record.bestStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              الأفضل
            </div>
          </div>{" "}
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-sm font-medium">{record.currentCounter}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              العداد
            </div>
          </div>
        </div>
        {/* Goal Type Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="info" size="sm">
            هدف السلسلة
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            الهدف: {record.goalValue} أيام
          </span>{" "}
        </div>{" "}
        <Button
          onClick={() => onToggleCompletion(record.habitId)}
          variant={record.completed ? "success" : "primary"}
          className="w-full"
          size="sm"
          disabled={isUpdating}
        >
          <div className="flex items-center justify-center space-x-2">
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>جارٍ التحديث...</span>
              </>
            ) : record.completed ? (
              <>
                <span>مكتمل 🎉</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-current rounded"></div>
                <span>وضع علامة مكتمل</span>
              </>
            )}
          </div>
        </Button>
        {/* Completion Time */}
      </CardContent>
    </Card>
  );
};

export default React.memo(HabitCard);
