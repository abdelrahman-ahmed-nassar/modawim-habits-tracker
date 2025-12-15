import React, { useState } from "react";
import MotivationalPopup from "../components/ui/MotivationalPopup";
import Button from "../components/ui/Button";
import { useEffect } from "react";
import { SettingsService } from "../services/settings";

/**
 * Demo page to test the Motivational Popup
 * This page is not part of the main app routes
 */
const MotivationalPopupDemo: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [enableRandomNote, setEnableRandomNote] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.getSettings();
        if (settings && typeof settings.enableRandomNote === "boolean") {
          setEnableRandomNote(settings.enableRandomNote);
          setShowPopup(settings.enableRandomNote);
        } else {
          setEnableRandomNote(true);
          setShowPopup(true);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    loadSettings();
  }, []);

  const forceShowPopup = () => {
    if (!enableRandomNote) {
      return;
    }
    setShowPopup(false);
    // Re-render the component to trigger the fetch
    setTimeout(() => {
      setShowPopup(true);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Motivational Popup Demo
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            About This Component
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The Motivational Popup displays every time users open or refresh the
            website. It shows a random habit with its motivation note to keep
            users engaged.
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
            <li>Beautiful gradient design with animations</li>
            <li>Shows habit name, description, and motivation note</li>
            <li>Displays current stats (streak, best streak, total)</li>
            <li>Appears on every page load/refresh</li>
            <li>Responsive and mobile-friendly</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Test Controls
          </h2>
          <div className="space-y-4">
            <div>
              <Button onClick={forceShowPopup} className="w-full">
                Show Popup Again
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Fetches a new random habit and shows the popup
              </p>
            </div>

            <div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Reloads the page to see the popup again with a new random habit
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Behavior
          </h2>
          <div className="text-gray-600 dark:text-gray-400 space-y-2">
            <p>✅ Shows on every page load</p>
            <p>✅ Fetches a different random habit each time</p>
            <p>✅ No localStorage or cookies used</p>
            <p>✅ Always motivates users when they visit</p>
          </div>
        </div>
      </div>

      {/* The popup component */}
      {enableRandomNote && showPopup && (
        <MotivationalPopup onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default MotivationalPopupDemo;
