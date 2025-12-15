import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";

const NotFound = () => {
  return (
    <PageContainer title="الصفحة غير موجودة" showBreadcrumbs={false}>
      <div className="flex flex-col items-center justify-center space-y-6 py-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          <Compass className="w-8 h-8" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            عذراً، لم نعثر على الصفحة المطلوبة.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            تأكد من صحة الرابط أو عد للصفحة الرئيسية لمتابعة التصفح.
          </p>
        </div>
        <div className="flex items-center space-x-reverse space-x-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 hover:text-white text-white transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link
            to="/notes"
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            تصفح اليوميات
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFound;

