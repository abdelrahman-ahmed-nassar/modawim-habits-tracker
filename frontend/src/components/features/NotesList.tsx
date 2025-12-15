import React, { useState, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Heart,
  Zap,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
} from "lucide-react";
import { DailyNote } from "@shared/types/note";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

interface NotesListProps {
  notes: DailyNote[];
  onNoteSelect: (note: DailyNote) => void;
  selectedNote: DailyNote | null;
  onNoteUpdate: () => void;
}

type SortBy = "date" | "length" | "mood" | "productivity";
type SortOrder = "asc" | "desc";

const NotesList: React.FC<NotesListProps> = ({
  notes,
  onNoteSelect,
  selectedNote,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterMood, setFilterMood] = useState("");
  const [filterProductivity, setFilterProductivity] = useState("");

  // Get unique moods and productivity levels for filters
  const { uniqueMoods, uniqueProductivityLevels } = useMemo(() => {
    const moods = new Set<string>();
    const productivityLevels = new Set<string>();

    notes.forEach((note) => {
      if (note.mood) moods.add(note.mood);
      if (note.productivityLevel)
        productivityLevels.add(note.productivityLevel);
    });

    return {
      uniqueMoods: Array.from(moods).sort(),
      uniqueProductivityLevels: Array.from(productivityLevels).sort(),
    };
  }, [notes]);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    // Apply text search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(term) ||
          note.mood?.toLowerCase().includes(term) ||
          note.productivityLevel?.toLowerCase().includes(term)
      );
    }

    // Apply mood filter
    if (filterMood) {
      filtered = filtered.filter((note) => note.mood === filterMood);
    }

    // Apply productivity filter
    if (filterProductivity) {
      filtered = filtered.filter(
        (note) => note.productivityLevel === filterProductivity
      );
    }

    // Sort notes
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "length":
          comparison = a.content.length - b.content.length;
          break;
        case "mood":
          comparison = (a.mood || "").localeCompare(b.mood || "");
          break;
        case "productivity":
          comparison = (a.productivityLevel || "").localeCompare(
            b.productivityLevel || ""
          );
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [notes, searchTerm, sortBy, sortOrder, filterMood, filterProductivity]);

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const handleNoteClick = (note: DailyNote) => {
    onNoteSelect(note);
  };

  const handleEditNote = (note: DailyNote, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/daily/${note.date}`);
  };

  const getPreviewText = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      "😊": "😊",
      "😢": "😢",
      "😡": "😡",
      "😰": "😰",
      "😴": "😴",
      "🤗": "🤗",
      "😎": "😎",
      "🤔": "🤔",
      "😔": "😔",
      "😌": "😌",
      Happy: "😊",
      Sad: "😢",
      Angry: "😡",
      Anxious: "😰",
      Tired: "😴",
      Excited: "🤗",
      Confident: "😎",
      Thoughtful: "🤔",
      Melancholy: "😔",
      Peaceful: "😌",
    };
    return moodEmojis[mood] || mood;
  };

  const getProductivityColor = (level: string) => {
    const colors: Record<string, string> = {
      High: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      colors[level] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث في اليوميات حسب المحتوى أو المزاج أو الإنتاجية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filters and Sort Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Controls (horizontal scroll on small screens) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                ترتيب حسب:
              </span>
              <div className="w-full sm:w-auto overflow-x-auto">
                <div className="inline-flex space-x-1 space-x-reverse">
                  {[
                    { key: "date" as SortBy, label: "التاريخ", icon: Calendar },
                    { key: "length" as SortBy, label: "الطول", icon: FileText },
                    { key: "mood" as SortBy, label: "المزاج", icon: Heart },
                    {
                      key: "productivity" as SortBy,
                      label: "الإنتاجية",
                      icon: Zap,
                    },
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={sortBy === key ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => handleSort(key)}
                      className="flex items-center space-x-1 space-x-reverse whitespace-nowrap"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                      {sortBy === key &&
                        (sortOrder === "asc" ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        ))}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 sm:space-x-4">
              {/* Mood Filter */}
              {uniqueMoods.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">جميع الحالات المزاجية</option>
                    {uniqueMoods.map((mood) => (
                      <option key={mood} value={mood}>
                        {getMoodEmoji(mood)} {mood}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Productivity Filter */}
              {uniqueProductivityLevels.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={filterProductivity}
                    onChange={(e) => setFilterProductivity(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">جميع مستويات الإنتاجية</option>
                    {uniqueProductivityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Notes Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          عرض {filteredAndSortedNotes.length} من {notes.length} تدوين يوميات
        </div>
        {(searchTerm || filterMood || filterProductivity) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setFilterMood("");
              setFilterProductivity("");
            }}
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredAndSortedNotes.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {notes.length === 0
                  ? "لا توجد ملاحظات بعد"
                  : "لا توجد ملاحظات تطابق الفلاتر"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {notes.length === 0
                  ? "ابدأ الكتابة لرؤية يومياتك هنا"
                  : "جرب تعديل معايير البحث أو الفلتر"}
              </p>
            </div>
          </Card>
        ) : (
          filteredAndSortedNotes.map((note) => (
            <Card
              key={note._id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedNote?._id === note._id
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => handleNoteClick(note)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(note.date)}
                    </div>
                    {note.mood && (
                      <Badge
                        variant="default"
                        className="flex items-center space-x-1"
                      >
                        <Heart className="w-3 h-3" />
                        <span>{getMoodEmoji(note.mood)}</span>
                      </Badge>
                    )}
                    {note.productivityLevel && (
                      <Badge
                        className={getProductivityColor(note.productivityLevel)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {note.productivityLevel}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {note.content.length} حرف
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditNote(note, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {getPreviewText(note.content)}
                </div>

                {note.content.length > 150 && (
                  <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 text-sm">
                    <Eye className="w-3 h-3 mr-1" />
                    انقر للقراءة المزيد
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesList;
