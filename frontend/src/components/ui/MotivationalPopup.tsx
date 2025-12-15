import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Habit } from "@shared/types/habit";
import { habitsService } from "../../services/habits";

interface MotivationalPopupProps {
  onClose?: () => void;
}

const MotivationalPopup: React.FC<MotivationalPopupProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndShowMotivation();
  }, []);

  const fetchAndShowMotivation = async () => {
    try {
      // Fetch a random habit for the authenticated user
      const randomHabit = await habitsService.getRandomHabit();
      if (randomHabit) {
        setHabit(randomHabit);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching random habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (loading || !habit) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background:
                "radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg"
            style={{
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            <div className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200 dark:border-purple-700">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-tr-full" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-md"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Content */}
              <div className="relative p-8 pt-12">
                {/* Icon and Title */}
                <div className="flex flex-col items-center mb-6">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="mb-4 p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                    تذكير يومي بالعادة
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    دعنا نذكرك بأهمية عادة اليوم
                  </p>
                </div>

                {/* Habit Name */}
                <div className="mb-6 p-4 bg-white/60 dark:bg-gray-700/60 rounded-xl border border-purple-200 dark:border-purple-700 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {habit.name}
                    </h3>
                    {habit.tag && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                        {habit.tag}
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Motivation Note */}
                {habit.motivationNote && (
                  <div className="mb-6 relative">
                    <div className="absolute -right-2 -top-2 text-6xl text-purple-300 dark:text-purple-700 opacity-50 font-serif">
                      "
                    </div>
                    <div className="relative p-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-xl border-r-4 border-purple-500 dark:border-purple-400 shadow-inner">
                      <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium text-right">
                        {habit.motivationNote}
                      </p>
                    </div>
                    <div className="absolute -left-2 -bottom-2 text-6xl text-purple-300 dark:text-purple-700 opacity-50 font-serif rotate-180">
                      "
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg text-center border border-purple-100 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {habit.currentStreak}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      السلسلة الحالية
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg text-center border border-blue-100 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {habit.bestStreak}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      أفضل سلسلة
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg text-center border border-green-100 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {habit.currentCounter}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      العدد الكلي
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  هيا نبدأ اليوم! 💪
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MotivationalPopup;
