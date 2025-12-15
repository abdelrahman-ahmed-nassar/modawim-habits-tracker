import { Menu, UserCircle } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { format } from "date-fns";
import { getArabicDayName, getArabicMonthName } from "../../utils/dateUtils";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const now = new Date();
  const dayNameEnglish = format(now, "EEEE");
  const monthNameEnglish = format(now, "MMMM");
  const dayNumber = format(now, "d");
  const year = format(now, "yyyy");

  const dayName = getArabicDayName(dayNameEnglish);
  const monthName = getArabicMonthName(monthNameEnglish);

  const currentDate = `${dayName}، ${dayNumber} ${monthName} ${year}`;

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between lg:justify-between">
        {/* Menu button - shown on mobile, positioned at edge */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Logo - centered on mobile, left-aligned on desktop */}
        <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
            مداوم
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center hidden sm:block">
            أدومها وإن قل
          </p>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-reverse space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            {currentDate}
          </span>
          <ThemeToggle />
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            aria-label="الملف الشخصي"
          >
            <UserCircle className="w-5 h-5" />
            <span className="hidden sm:inline">الملف الشخصي</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
