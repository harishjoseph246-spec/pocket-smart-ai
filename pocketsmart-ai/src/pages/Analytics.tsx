import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../services/api";
import { CATEGORY_COLORS } from "../types";

export default function Analytics() {
  const [summary, setSummary] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.get("/api/analytics/summary").then(({ data }) => setSummary(data));
    api.get("/api/analytics/health-indicators").then(({ data }) => setHealth(data));
  }, []);

  if (!summary || !health) return <p className="text-sm text-mist">Crunching the numbers…</p>;

  const categoryData = Object.entries(summary.spending_by_category as Record<string, number>)
    .map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Total Income", value: `₹${summary.total_income.toLocaleString()}` },
    { label: "Total Expenses", value: `₹${summary.total_expenses.toLocaleString()}` },
    { label: "Average Daily Spending", value: `₹${summary.average_daily_spending.toLocaleString()}` },
    { label: "Savings Rate", value: `${summary.savings_rate}%` },
    { label: "Largest Category", value: summary.largest_category || "—" },
    { label: "Month-over-Month Change", value: `${summary.month_over_month_change}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">Financial Analytics</h1>
        <p className="mt-1 text-sm text-mist">The full picture, measured.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <p className="text-xs text-mist">{s.label}</p>
            <p className="mt-1 font-display text-xl font-semibold text-haze">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-haze">Spending by Category</h2>
        {categoryData.length === 0 ? (
          <p className="py-10 text-center text-sm text-mist">No expenses recorded this month.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#8C94AB" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#8C94AB" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#E7EAF3" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {categoryData.map((d) => <Cell key={d.name} fill={CATEGORY_COLORS[d.name] || "#8C94AB"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-haze">Financial Health Indicators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(health).map(([key, v]: any) => (
            <div key={key} className="glass-card p-5">
              <p className="text-xs capitalize text-mist">{key.replace(/_/g, " ")}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-haze">{v.value}%</p>
              <p className="mt-2 text-xs text-mist/80">{v.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
