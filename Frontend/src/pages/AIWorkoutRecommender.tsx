import { useEffect, useState } from "react";
import api from "../configs/api";
import Card from "../assets/ui/Card";
import {
  DumbbellIcon,
  FlameIcon,
  TimerIcon,
  SparklesIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ZapIcon,
} from "lucide-react";

interface Exercise {
  name: string;
  duration: number;
  estimatedCalories: number;
  intensity: "low" | "medium" | "high";
  description: string;
  exercises: string[];
  emoji: string;
}

interface Recommendations {
  recommendations: Exercise[];
  weeklyPlan: string;
}

const intensityConfig = {
  low: {
    label: "Low",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-500 dark:text-red-400",
    dot: "bg-red-400",
  },
};

const AIWorkoutRecommender = () => {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: res } = await api.get("/api/ai/workout-recommendations");
      setData(res.result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 animate-pulse"
          >
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="text-center py-8">
        <SparklesIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Could not load recommendations right now
        </p>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Try Again
        </button>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 bg-white dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-500" />
            AI Workouts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personalized for your goal & history
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Refresh"
        >
          <RefreshCwIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <div className="p-4 lg:p-6 space-y-4 pb-24">
        {/* Weekly plan banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
          <div className="flex items-start gap-3">
            <ZapIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-purple-100 mb-1">Weekly Plan Tip</p>
              <p className="text-sm font-medium">{data.weeklyPlan}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {data.recommendations.map((rec, idx) => {
            const intensity = intensityConfig[rec.intensity] || intensityConfig.medium;
            const isOpen = expanded === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                {/* Card Header */}
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                      {rec.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">
                          {rec.name}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${intensity.bg} ${intensity.text}`}
                        >
                          {intensity.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <TimerIcon className="w-3.5 h-3.5" />
                          {rec.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FlameIcon className="w-3.5 h-3.5 text-orange-400" />
                          ~{rec.estimatedCalories} kcal
                        </span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUpIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rec.description}
                    </p>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <DumbbellIcon className="w-3.5 h-3.5" />
                        Exercises
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {rec.exercises.map((ex, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${intensity.dot}`} />
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                              {ex}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Navigate to ActivityLog - user can manually log after doing workout
                        window.location.href = "/activity";
                      }}
                      className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm 
                      font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <DumbbellIcon className="w-4 h-4" />
                      Start & Log This Workout
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIWorkoutRecommender;
