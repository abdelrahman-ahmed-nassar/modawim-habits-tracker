import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Weekly from "./pages/Weekly";
import Monthly from "./pages/Monthly";
import Yearly from "./pages/Yearly";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import Counters from "./pages/Counters";
import NotFound from "./pages/NotFound";
import MotivationalPopup from "./components/ui/MotivationalPopup";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { AuthService } from "./services/auth";
import { useEffect, useState } from "react";
import { SettingsService } from "./services/settings";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthed = AuthService.isAuthenticated();
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthed = AuthService.isAuthenticated();
  if (isAuthed) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [showMotivation, setShowMotivation] = useState(false);

  useEffect(() => {
    const init = async () => {
      const authed = AuthService.isAuthenticated();
      if (!authed) {
        setShowMotivation(false);
        return;
      }
      try {
        const settings = await SettingsService.getSettings();
        if (
          settings &&
          typeof (settings as any).enableRandomNote === "boolean"
        ) {
          setShowMotivation((settings as any).enableRandomNote);
        } else {
          setShowMotivation(true);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
        setShowMotivation(false);
      }
    };
    init();
  }, []);

  return (
    <div dir="rtl" className="rtl">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="daily" element={<Daily />} />
            <Route path="daily/:date" element={<Daily />} />
            <Route path="weekly" element={<Weekly />} />
            <Route path="weekly/:date" element={<Weekly />} />
            <Route path="monthly" element={<Monthly />} />
            <Route path="monthly/:year/:month" element={<Monthly />} />
            <Route path="yearly" element={<Yearly />} />
            <Route path="yearly/:year" element={<Yearly />} />
            <Route path="notes" element={<Notes />} />
            <Route path="counters" element={<Counters />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      {showMotivation && <MotivationalPopup />}
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg"
      />
    </div>
  );
}

export default App;
