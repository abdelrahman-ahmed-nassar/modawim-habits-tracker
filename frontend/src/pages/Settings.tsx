import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase,
  MessageSquare,
  Zap,
  FileText,
  Database,
  Calculator,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import PageContainer from "../components/layout/PageContainer";
import HabitsManager from "../components/settings/HabitsManager";
import MoodsManager from "../components/settings/MoodsManager";
import ProductivityLevelsManager from "../components/settings/ProductivityLevelsManager";
import TemplatesManager from "../components/settings/TemplatesManager";
import CountersManager from "../components/settings/CountersManager";
import ConfirmationModal from "../components/ui/ConfirmationModal";

type SettingsTab =
  | "habits"
  | "moods"
  | "productivity"
  | "templates"
  | "counters";

const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabParam &&
      ["habits", "moods", "productivity", "templates", "counters"].includes(
        tabParam
      )
      ? tabParam
      : "habits"
  );
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const isLoading = false;
  const error = null;

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleTabChange = (newTab: SettingsTab) => {
    // Clear any existing toasts when switching tabs to prevent stale messages
    toast.dismiss();
    setActiveTab(newTab);
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const response = await axios.post("http://localhost:5002/api/backup");
      if (response.data.success) {
        toast.success("تم إنشاء النسخة الاحتياطية بنجاح!");
      } else {
        toast.error("فشل إنشاء النسخة الاحتياطية");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error(
        "فشل إنشاء النسخة الاحتياطية. تحقق من وحدة التحكم للحصول على التفاصيل."
      );
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsResettingData(true);
      const response = await axios.delete(
        "http://localhost:5002/api/settings/reset-data"
      );
      if (response.data.success) {
        toast.success("تم حذف جميع البيانات بنجاح!");
        setShowResetConfirmation(false);
        // Optionally reload the page to reflect the changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("فشل حذف البيانات");
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("فشل حذف البيانات. تحقق من وحدة التحكم للحصول على التفاصيل.");
    } finally {
      setIsResettingData(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "habits":
        return <HabitsManager />;
      case "moods":
        return <MoodsManager />;
      case "productivity":
        return <ProductivityLevelsManager />;
      case "templates":
        return <TemplatesManager />;
      case "counters":
        return <CountersManager />;
      default:
        return <div>اختر تبويبة</div>;
    }
  };

  return (
    <PageContainer
      title="الإعدادات"
      isLoading={isLoading}
      error={error}
      showBreadcrumbs={false}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          إدارة عاداتك، حالاتك المزاجية، مستويات الإنتاجية، وقوالب اليوميات
        </p>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8 space-x-reverse">
            {" "}
            <button
              onClick={() => handleTabChange("habits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "habits"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 ml-2" />
                <span>العادات</span>
              </div>
            </button>{" "}
            <button
              onClick={() => handleTabChange("moods")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "moods"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 ml-2" />
                <span>الحالات المزاجية</span>
              </div>
            </button>{" "}
            <button
              onClick={() => handleTabChange("productivity")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "productivity"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 ml-2" />
                <span>مستويات الإنتاجية</span>
              </div>
            </button>{" "}
            <button
              onClick={() => handleTabChange("templates")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 ml-2" />
                <span>قوالب اليوميات</span>
              </div>
            </button>{" "}
            <button
              onClick={() => handleTabChange("counters")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "counters"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <div className="flex items-center">
                <Calculator className="w-4 h-4 ml-2" />
                <span>العدادات</span>
              </div>
            </button>
          </nav>
        </div>

        {renderTabContent()}

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-4">إجراءات النظام</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="w-4 h-4 ml-2" />
              {isCreatingBackup
                ? "جارٍ إنشاء النسخة الاحتياطية..."
                : "إنشاء نسخة احتياطية"}
            </button>

            <button
              onClick={() => setShowResetConfirmation(true)}
              disabled={isResettingData}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              إعادة تعيين البيانات
            </button>
          </div>
        </div>

        {/* Reset Data Confirmation Modal */}
        <ConfirmationModal
          isOpen={showResetConfirmation}
          onClose={() => setShowResetConfirmation(false)}
          onConfirm={handleResetData}
          title="تحذير: حذف جميع البيانات"
          message={`هل أنت متأكد من رغبتك في حذف جميع البيانات؟

سيتم حذف:
• جميع العادات
• جميع سجلات الإنجاز
• جميع اليوميات
• جميع العدادات
• جميع الوسوم

⚠️ هذا الإجراء لا يمكن التراجع عنه!
تأكد من إنشاء نسخة احتياطية قبل المتابعة.`}
          confirmText="نعم، احذف جميع البيانات"
          cancelText="إلغاء"
          isDangerous={true}
          isLoading={isResettingData}
        />
      </div>
    </PageContainer>
  );
};

export default Settings;
