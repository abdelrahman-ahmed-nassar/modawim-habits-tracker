// filepath: s:\projects\habits-tracker\frontend\src\components\settings\HabitsManager.tsx
import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  ArrowUpDown,
  Save,
  X,
} from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { toast } from "react-toastify";
import { habitsService } from "../../services/habits";
import { Habit } from "@shared/types/habit";

interface HabitFormData {
  name: string;
  description: string;
  tag: string;
  repetition: "daily" | "weekly" | "monthly";
  specificDays?: number[];
  goalValue: number;
  motivationNote?: string;
  isActive: boolean;
}

const defaultHabitData: HabitFormData = {
  name: "",
  description: "",
  tag: "",
  repetition: "daily",
  goalValue: 1,
  motivationNote: "",
  isActive: true,
};

const HabitsManager: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [currentHabitId, setCurrentHabitId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HabitFormData>(defaultHabitData);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedHabits, setReorderedHabits] = useState<Habit[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      // Explicitly request all habits including inactive ones
      const data = await habitsService.getAllHabits(true);
      setHabits(data);
      setError(null);
    } catch (err) {
      setError("فشل تحميل العادات");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Cleanup toasts when component unmounts to prevent stale messages
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleCloseForm = () => {
    // Clear any pending toasts when closing the form
    toast.dismiss();
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    setFormData(defaultHabitData);
    setSelectedDays([]);
    setFormMode("create");
    setCurrentHabitId(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (habit: Habit) => {
    setFormData({
      name: habit.name,
      description: habit.description || "",
      tag: habit.tag,
      repetition: habit.repetition,
      goalValue: habit.goalValue,
      motivationNote: habit.motivationNote || "",
      isActive: habit.isActive !== false, // Default to true if not specified
    });
    setSelectedDays(habit.specificDays || []);
    setFormMode("edit");
    setCurrentHabitId(habit.id);
    setShowForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access type

    if (name === "goalValue") {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 1, // Ensure it's a positive number
      });
    } else if (type === "checkbox" && name === "isActive") {
      setFormData({
        ...formData,
        isActive: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("اسم العادة مطلوب");
      return;
    }

    try {
      setIsSubmitting(true);

      const habitData = {
        ...formData,
        specificDays:
          formData.repetition !== "daily" ? selectedDays : undefined,
      };

      if (formMode === "create") {
        await habitsService.createHabit(habitData);
        toast.success("تم إنشاء العادة بنجاح");
      } else if (formMode === "edit" && currentHabitId) {
        await habitsService.updateHabit(currentHabitId, habitData);
        toast.success("تم تحديث العادة بنجاح");
      }

      await fetchHabits();
      setShowForm(false);
    } catch (err) {
      toast.error(
        formMode === "create" ? "فشل إنشاء العادة" : "فشل تحديث العادة"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذه العادة؟ سيؤدي هذا أيضًا إلى حذف جميع سجلات الإنجاز المرتبطة بها."
      )
    ) {
      return;
    }

    try {
      await habitsService.deleteHabit(id);
      toast.success("تم حذف العادة بنجاح");
      await fetchHabits();
    } catch (err) {
      toast.error("فشل حذف العادة");
      console.error(err);
    }
  };

  const handleToggleActive = async (habit: Habit) => {
    try {
      setIsSubmitting(true);
      // Create a request object with only the necessary fields
      const updateRequest = {
        name: habit.name,
        description: habit.description || "",
        tag: habit.tag,
        repetition: habit.repetition,
        specificDays: habit.specificDays,
        goalValue: habit.goalValue,
        motivationNote: habit.motivationNote || "",
        isActive: !habit.isActive,
      };

      await habitsService.updateHabit(habit.id, updateRequest);
      toast.success(`تم ${!habit.isActive ? "تفعيل" : "إيقاف"} العادة بنجاح`);
      await fetchHabits();
    } catch (err) {
      toast.error("فشل تحديث حالة العادة");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnterReorderMode = () => {
    // Sort habits by order field or use current order
    const sorted = [...habits].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      return orderA - orderB;
    });
    setReorderedHabits(sorted);
    setIsReorderMode(true);
  };

  const handleExitReorderMode = () => {
    setIsReorderMode(false);
    setReorderedHabits([]);
    setDraggedIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newHabits = [...reorderedHabits];
    const draggedHabit = newHabits[draggedIndex];

    // Remove from old position
    newHabits.splice(draggedIndex, 1);
    // Insert at new position
    newHabits.splice(index, 0, draggedHabit);

    setReorderedHabits(newHabits);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveReorder = async () => {
    try {
      setIsSubmitting(true);
      const habitIds = reorderedHabits.map((h) => h.id);
      await habitsService.reorderHabits(habitIds);
      toast.success("تم حفظ الترتيب بنجاح");
      await fetchHabits();
      setIsReorderMode(false);
      setReorderedHabits([]);
    } catch (err) {
      toast.error("فشل حفظ الترتيب");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDaySelector = () => {
    if (formData.repetition === "daily") {
      return null;
    }

    const days =
      formData.repetition === "weekly"
        ? [
            "الأحد",
            "الإثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
          ]
        : Array.from({ length: 31 }, (_, i) => `${i + 1}`);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {formData.repetition === "weekly" ? "أيام الأسبوع" : "أيام الشهر"}
        </label>
        <div className="flex flex-wrap gap-2">
          {days.map((day, index) => (
            <button
              key={index}
              type="button"
              className={`px-3 py-1 text-sm rounded-full ${
                selectedDays.includes(index)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              onClick={() => handleDayToggle(index)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Separate active and inactive habits
  const activeHabits = habits.filter((habit) => habit.isActive !== false);
  const inactiveHabits = habits.filter((habit) => habit.isActive === false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جارٍ تحميل العادات...</div>
        </CardContent>
      </Card>
    );
  }

  // Render a habit card
  const renderHabitCard = (habit: Habit) => (
    <Card key={habit.id}>
      <CardContent
        className={`p-4 ${habit.isActive === false ? "opacity-70" : ""}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{habit.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {habit.description}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              onClick={() => handleOpenEditForm(habit)}
            >
              <Edit size={16} />
            </button>
            <button
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              onClick={() => handleDelete(habit.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
            {habit.repetition === "daily"
              ? "يومي"
              : habit.repetition === "weekly"
              ? "أسبوعي"
              : "شهري"}
          </span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs">
            {habit.tag}
          </span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs">
            الهدف: {habit.goalValue} أيام
          </span>
          {habit.isActive === false && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
              غير نشط
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>السلسلة الحالية: {habit.currentStreak}</div>
          <div>أفضل سلسلة: {habit.bestStreak}</div>
        </div>
        <div className="mt-3 flex items-center">
          <button
            className="flex items-center text-sm font-medium"
            onClick={() => handleToggleActive(habit)}
            disabled={isSubmitting}
          >
            {habit.isActive !== false ? (
              <>
                <ToggleRight className="h-5 w-5 text-green-600 mr-1" />
                <span>نشط</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5 text-gray-400 mr-1" />
                <span>غير نشط</span>
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدير العادات</h2>
        <div className="flex gap-2">
          {!isReorderMode ? (
            <>
              <Button
                onClick={handleEnterReorderMode}
                variant="secondary"
                leftIcon={<ArrowUpDown size={16} />}
                disabled={habits.length === 0}
              >
                إعادة ترتيب
              </Button>
              <Button
                onClick={handleOpenCreateForm}
                leftIcon={<PlusCircle size={16} />}
              >
                إنشاء عادة
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleExitReorderMode}
                variant="secondary"
                leftIcon={<X size={16} />}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveReorder}
                leftIcon={<Save size={16} />}
                isLoading={isSubmitting}
              >
                حفظ الترتيب
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isReorderMode ? (
        // Reorder Mode
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                اسحب العادات لإعادة ترتيبها، ثم اضغط على "حفظ الترتيب" لتطبيق
                التغييرات.
              </p>
            </div>
            <div className="space-y-2">
              {reorderedHabits.map((habit, index) => (
                <div
                  key={habit.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border rounded-lg cursor-move transition-all ${
                    draggedIndex === index
                      ? "opacity-50 border-blue-500"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{habit.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {habit.tag}
                      </span>
                      {habit.isActive === false && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                          غير نشط
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : habits.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              لم يتم العثور على عادات. أنشئ عادتك الأولى!
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Habits Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">العادات النشطة</h3>
            {activeHabits.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeHabits.map((habit) => renderHabitCard(habit))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    لم يتم العثور على عادات نشطة.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Inactive Habits Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">العادات غير النشطة</h3>
            {inactiveHabits.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inactiveHabits.map((habit) => renderHabitCard(habit))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    لم يتم العثور على عادات غير نشطة.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Habit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={formMode === "create" ? "إنشاء عادة" : "تعديل عادة"}
        size="full"
        fullHeight={true}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <Input
            label="الوصف"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
          />
          <Input
            label="الوسم"
            name="tag"
            value={formData.tag}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <Select
            label="التكرار"
            name="repetition"
            value={formData.repetition}
            onChange={handleInputChange}
            options={[
              { value: "daily", label: "يومي" },
              { value: "weekly", label: "أسبوعي" },
              { value: "monthly", label: "شهري" },
            ]}
            fullWidth
          />
          {renderDaySelector()}
          <Input
            label="قيمة الهدف"
            name="goalValue"
            type="number"
            min="1"
            value={formData.goalValue.toString()}
            onChange={handleInputChange}
            required
            fullWidth
          />
          <Input
            label="ملاحظة تحفيزية (نية)"
            name="motivationNote"
            value={formData.motivationNote || ""}
            onChange={handleInputChange}
            fullWidth
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الحالة
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className="flex items-center focus:outline-none"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="h-6 w-6 text-green-600 mr-2" />
                    <span>نشط</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-6 w-6 text-gray-400 mr-2" />
                    <span>غير نشط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleCloseForm();
              }}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {formMode === "create" ? "إنشاء عادة" : "تحديث عادة"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HabitsManager;
