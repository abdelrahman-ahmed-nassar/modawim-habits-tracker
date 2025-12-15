import React, { useState, useEffect } from "react";
import { Save, Edit3, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Card, { CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import MarkdownEditor from "../ui/MarkdownEditor";
import { NotesService } from "../../services/notes";
import { TemplatesService } from "../../services/templates";
import { DailyNote } from "@shared/types/note";
import { NoteTemplate } from "@shared/types/template";

interface DailyNotesProps {
  date: string; // YYYY-MM-DD format
  initialNote: DailyNote | null;
  onNoteUpdate: () => void;
}

const DailyNotes: React.FC<DailyNotesProps> = ({
  date,
  initialNote,
  onNoteUpdate,
}) => {
  const [note, setNote] = useState<DailyNote | null>(initialNote);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [productivityLevel, setProductivityLevel] = useState("");
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [availableProductivityLevels, setAvailableProductivityLevels] =
    useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(true); // Default to RTL
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    setNote(initialNote);
    if (initialNote) {
      setContent(initialNote.content);
      setMood(initialNote.mood || "");
      setProductivityLevel(initialNote.productivityLevel || "");
    } else {
      setContent("");
      setMood("");
      setProductivityLevel("");
    }
  }, [initialNote]);

  useEffect(() => {
    fetchOptions();
    fetchTemplates();
  }, []);
  const fetchOptions = async () => {
    try {
      const [moods, productivityLevels] = await Promise.all([
        NotesService.getMoods(),
        NotesService.getProductivityLevels(),
      ]);
      setAvailableMoods(moods);
      setAvailableProductivityLevels(productivityLevels);
    } catch (error) {
      console.error("Error fetching options:", error);
      // Set default options if API call fails
      setAvailableMoods([
        "😊 Great",
        "🙂 Good",
        "😐 Okay",
        "😔 Poor",
        "😞 Terrible",
      ]);
      setAvailableProductivityLevels([
        "🚀 Very High",
        "⚡ High",
        "✅ Medium",
        "🐌 Low",
        "😴 Very Low",
      ]);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const fetchedTemplates = await TemplatesService.getAllTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("فشل تحميل قوالب اليوميات");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const applyTemplate = (template: NoteTemplate) => {
    // Process template content - replace variables
    let processedContent = template.template;
    const today = new Date();

    // Common template variables
    processedContent = processedContent.replace(
      /\{\{date\}\}/g,
      today.toLocaleDateString()
    );
    processedContent = processedContent.replace(
      /\{\{year\}\}/g,
      today.getFullYear().toString()
    );
    processedContent = processedContent.replace(
      /\{\{month\}\}/g,
      today.toLocaleString("default", { month: "long" })
    );

    // Weekly variables
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + (6 - today.getDay()));

    processedContent = processedContent.replace(
      /\{\{weekStart\}\}/g,
      weekStart.toLocaleDateString()
    );
    processedContent = processedContent.replace(
      /\{\{weekEnd\}\}/g,
      weekEnd.toLocaleDateString()
    );

    setContent(processedContent);
    setShowTemplateSelector(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.warning("الرجاء إدخال محتوى للتدوينة");
      return;
    }

    setLoading(true);
    try {
      if (note) {
        // Update existing note
        const updatedNote = await NotesService.updateNote(note._id, {
          content: content.trim(),
          mood: mood || undefined,
          productivityLevel: productivityLevel || undefined,
        });
        setNote(updatedNote);
        toast.success("تم تحديث التدوينة بنجاح");
      } else {
        // Create new note
        const newNote = await NotesService.createNote({
          date,
          content: content.trim(),
          mood: mood || undefined,
          productivityLevel: productivityLevel || undefined,
        });
        setNote(newNote);
        toast.success("تم إنشاء التدوينة بنجاح");
      }
      setIsEditing(false);
      onNoteUpdate();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("فشل حفظ التدوينة");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    if (!confirm("هل أنت متأكد من حذف هذه التدوينة؟")) return;

    setLoading(true);
    try {
      await NotesService.deleteNote(note._id);
      setNote(null);
      setContent("");
      setMood("");
      setProductivityLevel("");
      setIsEditing(false);
      toast.success("تم حذف التدوينة بنجاح");
      onNoteUpdate();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("فشل حذف التدوينة");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (note) {
      setContent(note.content);
      setMood(note.mood || "");
      setProductivityLevel(note.productivityLevel || "");
    } else {
      setContent("");
      setMood("");
      setProductivityLevel("");
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCreate = () => {
    setIsEditing(true);
    setContent("");
    setMood("");
    setProductivityLevel("");
  };

  return (
    <div className="space-y-6 [direction:rtl] ">
      {/* Note Display/Edit */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">التدوينه اليوميه</h2>
              <div className="flex items-center space-x-2">
                {note && !isEditing && (
                  <>
                    <Button
                      onClick={handleEdit}
                      variant="ghost"
                      size="sm"
                      className="p-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {!note && !isEditing && (
                  <Button
                    onClick={handleCreate}
                    variant="primary"
                    size="sm"
                    className="mr-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    يوم جديد
                  </Button>
                )}
              </div>
            </div>
          }
        />

        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {" "}
              {/* Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    محتوى التدوينة
                  </label>
                  <div className="relative">
                    <Button
                      onClick={() =>
                        setShowTemplateSelector(!showTemplateSelector)
                      }
                      variant="secondary"
                      size="sm"
                      className="flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      استخدام قالب
                    </Button>

                    {showTemplateSelector && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                        <div className="p-2">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                            اختر قالبًا
                          </div>
                          {isLoadingTemplates ? (
                            <div className="flex items-center justify-center p-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                جارٍ التحميل...
                              </span>
                            </div>
                          ) : templates.length > 0 ? (
                            templates.map((template) => (
                              <button
                                key={template._id}
                                onClick={() => applyTemplate(template)}
                                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                {template.name}
                              </button>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
                              لا توجد قوالب متاحة
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="ما الذي يدور في ذهنك اليوم؟ استخدم Markdown للتنسيق الغني..."
                  minHeight={300}
                  disabled={loading}
                  rtl={isRtl}
                  onRtlChange={setIsRtl}
                />
              </div>
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة المزاجية
                </label>
                <select
                  value={mood}
                  dir="ltr"
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">اختر الحالة المزاجية (اختياري)</option>
                  {availableMoods.map((moodOption) => (
                    <option key={moodOption} value={moodOption}>
                      {moodOption}
                    </option>
                  ))}
                </select>
              </div>
              {/* Productivity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مستوى الإنتاجية
                </label>
                <select
                  dir="ltr"
                  value={productivityLevel}
                  onChange={(e) => setProductivityLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">اختر مستوى الإنتاجية (اختياري)</option>
                  {availableProductivityLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="sm"
                  disabled={loading || !content.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "جارٍ الحفظ..." : "حفظ التدوينة"}
                </Button>
              </div>
            </div>
          ) : note ? (
            <div className="space-y-4">
              {/* Content Display */}
              <div className="prose dark:prose-invert max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  {note.mood && (
                    <div className="flex items-center space-x-1">
                      <span>الحالة المزاجية:</span>
                      <span className="font-medium">{note.mood}</span>
                    </div>
                  )}
                  {note.productivityLevel && (
                    <div className="flex items-center space-x-1">
                      <span>الإنتاجية:</span>
                      <span className="font-medium">
                        {note.productivityLevel}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  آخر تحديث: {new Date(note.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                لا توجد تدوينه لهذا اليوم بعد.
              </p>
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                يوم جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>{" "}
      {/* Quick Tips */}
      <Card>
        <CardHeader title="نصائح التأمل اليومي" />
        <CardContent>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                أفكار للمحتوى
              </h4>
              <div className="space-y-1">
                <p>• تأمل في إنجازاتك والتحديات التي واجهتها اليوم</p>
                <p>• سجل أي رؤى أو دروس تعلمتها</p>
                <p>• فكر فيما أنت ممتن له</p>
                <p>• خطط لكيفية جعل الغد أفضل</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                نصائح التنسيق
              </h4>
              <div className="space-y-1">
                <p>
                  • استخدم <strong>**غامق**</strong> للإنجازات المهمة
                </p>
                <p>
                  • أنشئ قوائم مهام بـ <code>- [ ]</code> لأهداف الغد
                </p>
                <p>
                  • أضف <em>*تأكيد*</em> للرؤى الرئيسية
                </p>
                <p>• استخدم القوالب للحصول على بنية يومية متسقة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(DailyNotes);
