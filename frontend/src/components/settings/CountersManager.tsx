import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { toast } from "react-toastify";
import { countersService } from "../../services/counters";
import { Counter } from "@shared/types";

interface CounterFormData {
  name: string;
  goal: number;
  motivationNote: string;
}

const defaultCounterData: CounterFormData = {
  name: "",
  goal: 0,
  motivationNote: "",
};

const CountersManager: React.FC = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [showForm, setShowForm] = useState(false);
  const [currentCounterId, setCurrentCounterId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CounterFormData>(defaultCounterData);

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

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleCloseForm = () => {
    toast.dismiss();
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    setFormData(defaultCounterData);
    setFormMode("create");
    setCurrentCounterId(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (counter: Counter) => {
    setFormData({
      name: counter.name,
      goal: counter.goal,
      motivationNote: counter.motivationNote || "",
    });
    setFormMode("edit");
    setCurrentCounterId(counter._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formMode === "create") {
        await countersService.createCounter({
          name: formData.name,
          goal: formData.goal,
          motivationNote: formData.motivationNote,
          currentCount: 0,
        });
        toast.success("تم إنشاء العداد بنجاح");
      } else if (currentCounterId) {
        await countersService.updateCounter(currentCounterId, {
          name: formData.name,
          goal: formData.goal,
          motivationNote: formData.motivationNote,
        });
        toast.success("تم تحديث العداد بنجاح");
      }

      await fetchCounters();
      handleCloseForm();
    } catch (err) {
      toast.error(
        formMode === "create" ? "فشل إنشاء العداد" : "فشل تحديث العداد"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العداد؟")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await countersService.deleteCounter(id);
      toast.success("تم حذف العداد بنجاح");
      await fetchCounters();
    } catch (err) {
      toast.error("فشل حذف العداد");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جارٍ تحميل العدادات...</div>
        </CardContent>
      </Card>
    );
  }

  const renderCounterCard = (counter: Counter) => {
    const progress =
      counter.goal > 0 ? (counter.currentCount / counter.goal) * 100 : 0;

    return (
      <Card key={counter._id}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{counter.name}</h3>
              {counter.motivationNote && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {counter.motivationNote}
                </div>
              )}
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <button
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                onClick={() => handleOpenEditForm(counter)}
              >
                <Edit size={16} />
              </button>
              <button
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                onClick={() => handleDelete(counter._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">التقدم</span>
              <span className="font-medium">
                {counter.currentCount} / {counter.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">إدارة العدادات</h2>
        <Button
          onClick={handleOpenCreateForm}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusCircle className="w-4 h-4 ml-2" />
          <span>إضافة عداد</span>
        </Button>
      </div>

      {error && (
        <Card className="mb-4">
          <CardContent className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {counters.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                لا توجد عدادات حالياً
              </p>
              <Button onClick={handleOpenCreateForm} variant="outline">
                إنشاء أول عداد
              </Button>
            </CardContent>
          </Card>
        ) : (
          counters.map(renderCounterCard)
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={formMode === "create" ? "إضافة عداد جديد" : "تعديل العداد"}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              اسم العداد *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="مثال: قراءة 60 صفحة من التفسير"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الهدف *
            </label>
            <Input
              type="number"
              min="0"
              value={formData.goal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goal: parseInt(e.target.value) || 0,
                })
              }
              placeholder="مثال: 8"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ملاحظة تحفيزية (نية)
            </label>
            <Input
              type="text"
              value={formData.motivationNote}
              onChange={(e) =>
                setFormData({ ...formData, motivationNote: e.target.value })
              }
              placeholder="مثال: خيركم من تعلم القرآن وعلمه"
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseForm}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "جارٍ الحفظ..."
                : formMode === "create"
                ? "إنشاء"
                : "تحديث"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CountersManager;
