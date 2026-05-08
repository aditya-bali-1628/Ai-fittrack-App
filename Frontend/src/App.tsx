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
import AIWorkoutRecommender from "./pages/AIWorkoutRecommender";
import AICoachChat from "./components/ai/AICoachChat";
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
          <Route
            index
            element={
              onboardingCompleted ? <Dashboard /> : <Navigate to="/onboarding" />
            }
          />
          <Route
            path="food"
            element={onboardingCompleted ? <FoodLog /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="activity"
            element={onboardingCompleted ? <ActivityLog /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="profile"
            element={onboardingCompleted ? <Profile /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="ai-workouts"
            element={onboardingCompleted ? <AIWorkoutRecommender /> : <Navigate to="/onboarding" />}
          />
        </Route>
      </Routes>

      {user && onboardingCompleted && <AICoachChat />}
    </>
  );
};

export default App;