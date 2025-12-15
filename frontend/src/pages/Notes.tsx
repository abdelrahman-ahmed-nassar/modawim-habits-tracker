import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  List,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import NotesCalendar from "../components/features/NotesCalendar";
import NotesList from "../components/features/NotesList";
import NotesAnalytics from "../components/features/NotesAnalytics";
import { NotesService } from "../services/notes";
import { DailyNote } from "@shared/types/note";

type ViewMode = "calendar" | "list" | "analytics";

const Notes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const mode = searchParams.get("view") as ViewMode;
    return ["calendar", "list", "analytics"].includes(mode) ? mode : "calendar";
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<{
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
  } | null>(null);
  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null);

  const fetchAllNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await NotesService.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = useCallback(async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await NotesService.getNotesCalendar(year, month);
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      toast.error("فشل تحميل بيانات التقويم");
    }
  }, [currentDate]);

  // Update URL when view mode changes
  useEffect(() => {
    setSearchParams({ view: viewMode });
  }, [viewMode, setSearchParams]);

  // Fetch all notes on component mount
  useEffect(() => {
    fetchAllNotes();
  }, []);

  // Fetch calendar data when current date changes (for calendar view)
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchCalendarData();
    }
  }, [currentDate, viewMode, fetchCalendarData]);

  const handleDateNavigation = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleNoteSelect = (note: DailyNote) => {
    setSelectedNote(note);
  };

  const handleNoteUpdate = () => {
    fetchAllNotes();
    if (viewMode === "calendar") {
      fetchCalendarData();
    }
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "calendar":
        return <CalendarIcon className="w-4 h-4" />;
      case "list":
        return <List className="w-4 h-4" />;
      case "analytics":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading && viewMode !== "calendar") {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            اليوميات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {viewMode === "calendar" && "عرض يومياتك على تقويم شهري"}
            {viewMode === "list" && "تصفح جميع يومياتك بترتيب زمني"}
            {viewMode === "analytics" && "تحليل أنماط الكتابة والرؤى الخاصة بك"}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="w-full overflow-x-auto">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm space-x-1 space-x-reverse">
            {(["calendar", "list", "analytics"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center space-x-2 space-x-reverse px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {getViewModeIcon(mode)}
                <span className="capitalize">
                  {mode === "calendar"
                    ? "تقويم"
                    : mode === "list"
                    ? "قائمة"
                    : "تحليلات"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View Navigation (only show for calendar mode) */}
      {viewMode === "calendar" && (
        <Card>
          <div className="px-3 py-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center flex-wrap gap-2 sm:space-x-4 sm:space-x-reverse">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {format(currentDate, "MMMM yyyy", { locale: arSA })}
                </h2>
                <Badge variant="default" size="sm">
                  {calendarData?.totalNotes || 0} تدوين يوميات هذا الشهر
                </Badge>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateNavigation("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-1 text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setCurrentDate(new Date())}
                >
                  اليوم
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateNavigation("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {viewMode === "calendar" && (
          <NotesCalendar
            currentDate={currentDate}
            calendarData={calendarData}
            onNoteSelect={handleNoteSelect}
            onNoteUpdate={handleNoteUpdate}
          />
        )}

        {viewMode === "list" && (
          <NotesList
            notes={notes}
            onNoteSelect={handleNoteSelect}
            selectedNote={selectedNote}
            onNoteUpdate={handleNoteUpdate}
          />
        )}

        {viewMode === "analytics" && <NotesAnalytics notes={notes} />}
      </div>
    </div>
  );
};

export default Notes;
