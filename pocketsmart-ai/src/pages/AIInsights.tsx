import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import api from "../services/api";
import type { InsightItem } from "../types";

const iconMap: Record<string, any> = {
  "trending-up": TrendingUp, "trending-down": TrendingDown,
  "alert-triangle": AlertTriangle, "alert-circle": AlertCircle, "check-circle": CheckCircle,
};

const impactTone: Record<string, string> = {
  positive: "border-mint/30 bg-mint/10 text-mint",
  negative: "border-coral/30 bg-coral/10 text-coral",
  neutral: "border-amber/30 bg-amber/10 text-amber",
};

export default function AIInsights() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post<InsightItem[]>("/api/ai/insights").then(({ data }) => setInsights(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">AI Insights</h1>
        <p className="mt-1 text-sm text-mist">Patterns in your spending, explained in plain language.</p>
      </div>

      {loading ? (
        <p className="text-sm text-mist">Analyzing your spending…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((ins, i) => {
            const Icon = iconMap[ins.icon] || CheckCircle;
            return (
              <div key={i} className="glass-card p-5">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border ${impactTone[ins.impact]}`}>
                  <Icon size={17} />
                </div>
                <h3 className="font-semibold text-haze">{ins.title}</h3>
                <p className="mt-1.5 text-sm text-mist">{ins.description}</p>
                <p className="mt-3 text-xs text-mist/70">{ins.category} · {ins.date}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
