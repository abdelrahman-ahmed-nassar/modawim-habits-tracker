import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { Smile, Zap, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { DailyNote } from "@shared/types/note";

interface NotesCalendarProps {
  currentDate: Date;
  calendarData: {
    year: number;
    month: number;
    totalNotes: number;
    calendarData: Record<
      string,
      {
        hasNote: boolean;
        mood?: string;
        productivityLevel?: string;
        contentLength: number;
      }
    >;
  } | null;
  onNoteSelect: (note: DailyNote) => void;
  onNoteUpdate: () => void;
}

const NotesCalendar: React.FC<NotesCalendarProps> = ({
  currentDate,
  calendarData,
}) => {
  const navigate = useNavigate();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Get all days in the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Create a grid that starts on Sunday
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());

  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  
  // Debug calendar data whenever it changes
  React.useEffect(() => {
    const debugCalendarData = () => {
      if (!calendarData) {
        console.log("Calendar data is null or undefined");
        return;
      }
    };
    // Call debug function once
    debugCalendarData();
  }, [calendarData]);



  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    navigate(`/daily/${dateStr}?tab=notes`);
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return null;

    // Extract emoji from mood string (format: "😊 Great")
    const emoji = mood.split(" ")[0];
    return emoji;
  };

  const getProductivityColor = (level?: string) => {
    if (!level) return "gray";

    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes("very high") || lowerLevel.includes("🚀"))
      return "purple";
    if (lowerLevel.includes("high") || lowerLevel.includes("⚡"))
      return "green";
    if (lowerLevel.includes("medium") || lowerLevel.includes("✅"))
      return "blue";
    if (lowerLevel.includes("low") || lowerLevel.includes("🐌"))
      return "yellow";
    if (lowerLevel.includes("very low") || lowerLevel.includes("😴"))
      return "red";
    return "gray";
  };

  const getProductivityBadgeVariant = (level?: string) => {
    const color = getProductivityColor(level);
    switch (color) {
      case "purple":
      case "green":
        return "success";
      case "blue":
        return "primary";
      case "yellow":
        return "warning";
      case "red":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <Card>
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
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
                className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              // Add a null check to make sure calendarData and calendarData.calendarData exist
              const dayData = calendarData?.calendarData
                ? calendarData.calendarData[dateStr]
                : undefined;
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isCurrentDay = isToday(date);
              const hasNote = dayData?.hasNote || false;
              const isHovered = hoveredDay === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`relative p-3 min-h-[80px] border rounded-lg cursor-pointer transition-all duration-200 ${
                    isCurrentMonth
                      ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                  } ${
                    isCurrentDay
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "hover:border-blue-300 dark:hover:border-blue-600"
                  } ${
                    hasNote
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : ""
                  } ${isHovered ? "shadow-md scale-102" : ""}`}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => setHoveredDay(dateStr)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentDay
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : isCurrentMonth
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {format(date, "d")}
                    </span>

                    {hasNote && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  {/* Note Indicators */}
                  {hasNote && dayData && (
                    <div className="space-y-1">
                      {/* Mood Indicator */}
                      {dayData.mood && (
                        <div className="flex items-center justify-center">
                          <span className="text-lg">
                            {getMoodEmoji(dayData.mood)}
                          </span>
                        </div>
                      )}

                      {/* Productivity Badge */}
                      {dayData.productivityLevel && (
                        <div className="flex justify-center">
                          <Badge
                            variant={getProductivityBadgeVariant(
                              dayData.productivityLevel
                            )}
                            size="sm"
                            className="text-xs px-1 py-0.5"
                          >
                            <Zap className="w-2 h-2 mr-1" />
                            {dayData.productivityLevel.split(" ")[0]}
                          </Badge>
                        </div>
                      )}

                      {/* Content Length Indicator */}
                      {dayData.contentLength && dayData.contentLength > 0 && (
                        <div className="flex justify-center">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FileText className="w-2 h-2 mr-1" />
                            <span>
                              {dayData.contentLength > 1000
                                ? "1k+"
                                : dayData.contentLength > 500
                                ? "500+"
                                : dayData.contentLength}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Note Button (on hover for days without notes) */}
                  {!hasNote && isHovered && isCurrentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-lg">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        يوم جديد
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Legend */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            دليل التقويم
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                يحتوي على تدوين يوميات
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">
                يوم التدوين
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Smile className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                تم تتبع المزاج
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">
                تم تتبع الإنتاجية
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotesCalendar;
