import { useState, useRef } from "react";
import api from "../../configs/api";
import { SparklesIcon, Loader2Icon, CheckIcon, XIcon } from "lucide-react";

interface CalorieEstimate {
  name: string;
  calories: number;
  serving: string;
  confidence: "high" | "medium" | "low";
  breakdown: { protein: number; carbs: number; fat: number };
  tips: string;
}

interface Props {
  onUseEstimate: (name: string, calories: number) => void;
}

const confidenceColors = {
  high: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  medium: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
  low: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
};

const AICalorieEstimator = ({ onUseEstimate }: Props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<CalorieEstimate | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEstimate = async () => {
    const food = query.trim();
    if (!food) return;
    setLoading(true);
    setEstimate(null);
    setError("");
    try {
      const { data } = await api.post("/api/ai/estimate-calories", {
        foodName: food,
      });
      setEstimate(data.result);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Could not estimate. Try being more specific."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEstimate();
  };

  const handleUse = () => {
    if (!estimate) return;
    onUseEstimate(estimate.name, estimate.calories);
    setEstimate(null);
    setQuery("");
  };

  const handleDismiss = () => {
    setEstimate(null);
    setQuery("");
    setError("");
  };

  return (
    <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
          <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            AI Calorie Estimator
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Type any food — AI suggests calories instantly
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Dal Makhani, Chicken Biryani..."
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-purple-200 dark:border-purple-700 
          bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 
          outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors"
        />
        <button
          onClick={handleEstimate}
          disabled={!query.trim() || loading}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-slate-600
          text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              Estimate
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {estimate && (
        <div className="mt-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {estimate.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {estimate.serving}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estimate.calories}
              </p>
              <p className="text-xs text-slate-500">kcal</p>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
            {[
              { label: "Protein", val: estimate.breakdown.protein, color: "text-blue-500" },
              { label: "Carbs", val: estimate.breakdown.carbs, color: "text-orange-500" },
              { label: "Fat", val: estimate.breakdown.fat, color: "text-yellow-500" },
            ].map((m) => (
              <div key={m.label} className="px-3 py-2 text-center">
                <p className={`text-sm font-semibold ${m.color}`}>{m.val}g</p>
                <p className="text-xs text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Tip + confidence */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex-1">
              💡 {estimate.tips}
            </p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                confidenceColors[estimate.confidence]
              }`}
            >
              {estimate.confidence} confidence
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-3">
            <button
              onClick={handleDismiss}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400
              text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <XIcon className="w-4 h-4" />
              Dismiss
            </button>
            <button
              onClick={handleUse}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              Use This
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICalorieEstimator;
