import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  Home,
  Calendar,
  Settings,
  BookOpen,
  Heart,
  Mail,
  Github,
  MessageCircle,
  Calculator,
} from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const location = useLocation();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const currentYear = format(new Date(), "yyyy");

  const navigation = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: `/daily/${todayDate}`, icon: Calendar, label: "اليومي" },
    { path: "/weekly", icon: Calendar, label: "الأسبوعي" },
    { path: "/monthly", icon: Calendar, label: "الشهري" },
    { path: `/yearly/${currentYear}`, icon: Calendar, label: "السنوي" },
    { path: "/notes", icon: BookOpen, label: "اليوميات" },
    { path: "/counters", icon: Calculator, label: "العدادات" },
    { path: "/settings", icon: Settings, label: "التحكم فالعادات" },
  ];

  return (
    <aside
      className={
        "h-full w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col"
      }
    >
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              // Special handling for Daily route to match any date
              const isActive =
                item.label === "اليومي"
                  ? location.pathname.startsWith("/daily")
                  : item.label === "الأسبوعي"
                  ? location.pathname.startsWith("/weekly")
                  : item.label === "الشهري"
                  ? location.pathname.startsWith("/monthly")
                  : item.label === "السنوي"
                  ? location.pathname.startsWith("/yearly")
                  : location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={isMobile ? onClose : undefined}
                    className={`flex items-center space-x-reverse space-x-2 p-2 rounded transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with creator info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-3">
            {/* Hadith quote */}
            <div className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                "أَحَبُّ الأعمالِ إلى اللهِ أدْومُها و إن قَلَّ"
              </p>
            </div>

            {/* Creator info */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-reverse space-x-1 text-xs text-gray-600 dark:text-gray-400">
                <span>صنع بـ</span>
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                <span>بواسطة</span>
              </div>
              <p className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
                عبدالرحمن نصار
              </p>

              {/* Contact links */}
              <div className="flex items-center justify-center space-x-reverse space-x-3 pt-2">
                <a
                  href="mailto:abdelrhman.ahmed.nassar@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="البريد الإلكتروني"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/201003685977"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
