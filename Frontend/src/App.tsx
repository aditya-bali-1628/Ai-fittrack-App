import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import FoodLog from "./pages/FoodLog";
import ActivityLog from "./pages/ActivityLog";
import Profile from "./pages/Profile";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";
import Loading from "./components/ui/Loading";
import Onboarding from "./pages/Onboarding";
import AIWorkoutRecommender from "./pages/AIWorkoutRecommender"; // ← NEW
import AICoachChat from "./components/ai/AICoachChat";
 // ← NEW
import "./index.css";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, isUserFetched, onboardingCompleted } = useAppContext();

  if (!isUserFetched) {
    return <Loading />;
  }

  return (
    <>
      <Toaster />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/onboarding"
          element={user ? <Onboarding /> : <Navigate to="/login" />}
        />

        {/* Main App */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          {!onboardingCompleted ? (
            <Route index element={<Navigate to="/onboarding" />} />
          ) : (
            <>
              <Route index element={<Dashboard />} />
              <Route path="food" element={<FoodLog />} />
              <Route path="activity" element={<ActivityLog />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-workouts" element={<AIWorkoutRecommender />} /> {/* ← NEW */}
            </>
          )}
        </Route>
      </Routes>

      {/* ─── GLOBAL AI COACH CHAT FAB (NEW) ─── */}
      {/* Shows on all authenticated pages when onboarding is complete */}
      {user && onboardingCompleted && <AICoachChat />}
    </>
  );
};

export default App;
