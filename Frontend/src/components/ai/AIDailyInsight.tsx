import { useEffect, useState } from "react";
import api from "../../configs/api";
import { SparklesIcon, RefreshCwIcon } from "lucide-react";

interface Insight {
  insight: string;
  type: "success" | "warning" | "tip" | "motivation";
  emoji: string;
}

const typeStyles = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-200",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    label: "On Track!",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-200",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    label: "Heads Up",
  },
  tip: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    label: "Pro Tip",
  },
  motivation: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-800 dark:text-purple-200",
    badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    label: "Let's Go!",
  },
};

const AIDailyInsight = () => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/api/ai/daily-insight");
      setInsight(data.result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-500">AI Insight unavailable</p>
          </div>
          <button
            onClick={fetchInsight}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    );
  }

  const style = typeStyles[insight.type] || typeStyles.tip;

  return (
    <div className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl leading-none mt-0.5">{insight.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                {style.label}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                AI Insight
              </span>
            </div>
            <p className={`text-sm leading-relaxed font-medium ${style.text}`}>
              {insight.insight}
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsight}
          className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          title="Refresh insight"
        >
          <RefreshCwIcon className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default AIDailyInsight;
