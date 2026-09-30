import type { Budget } from "../types";

const statusStyle: Record<Budget["status"], { bar: string; text: string; label: string }> = {
  normal: { bar: "bg-electric-500", text: "text-mist", label: "On track" },
  near_limit: { bar: "bg-amber", text: "text-amber", label: "Near limit" },
  exceeded: { bar: "bg-coral", text: "text-coral", label: "Exceeded" },
};

export default function BudgetProgress({ budget }: { budget: Budget }) {
  const style = statusStyle[budget.status];
  const width = Math.min(budget.percent_used, 100);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-haze">{budget.category}</span>
        <span className="text-mist">
          ₹{budget.spent.toLocaleString()} / ₹{budget.limit_amount.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${width}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className={`text-xs ${style.text}`}>{style.label}</span>
        <span className="text-xs text-mist">{budget.percent_used}%</span>
      </div>
    </div>
  );
}
