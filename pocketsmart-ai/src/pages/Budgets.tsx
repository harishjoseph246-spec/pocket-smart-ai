import { useEffect, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import api from "../services/api";
import BudgetProgress from "../components/BudgetProgress";
import type { Budget } from "../types";
import { CATEGORIES } from "../types";

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Food", limit_amount: "" });
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recLoading, setRecLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Budget[]>("/api/budgets");
      setBudgets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    await api.post("/api/budgets", {
      category: form.category, limit_amount: Number(form.limit_amount),
      month: today.getMonth() + 1, year: today.getFullYear(),
    });
    setForm({ category: "Food", limit_amount: "" });
    setShowForm(false);
    load();
  };

  const generateSmartBudget = async () => {
    setRecLoading(true);
    try {
      const { data } = await api.post("/api/ai/budget-recommendation");
      setRecommendation(data);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-haze">Budgets</h1>
          <p className="mt-1 text-sm text-mist">Set category limits and track how you're doing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateSmartBudget} disabled={recLoading} className="btn-secondary">
            <Sparkles size={15} /> {recLoading ? "Thinking…" : "Generate Smart Budget"}
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Add budget</button>
        </div>
      </div>

      {recommendation && (
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-haze">
            <Sparkles size={16} className="text-violet-400" /> Recommended Allocation
          </h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Needs", value: recommendation.needs },
              { label: "Wants", value: recommendation.wants },
              { label: "Savings", value: recommendation.savings },
              { label: "Emergency Fund", value: recommendation.emergency_fund },
            ].map((r) => (
              <div key={r.label} className="rounded-xl bg-white/[0.03] p-4">
                <p className="text-xs text-mist">{r.label}</p>
                <p className="mt-1 font-display text-xl font-semibold text-haze">₹{r.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-mist">
            {recommendation.explanations.map((ex: string, i: number) => <li key={i}>• {ex}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <p className="text-sm text-mist">Loading…</p>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-mist">No budgets set for this month yet.</p>
        ) : (
          budgets.map((b) => (
            <div key={b.id} className="glass-card p-5">
              <BudgetProgress budget={b} />
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-card w-full max-w-sm bg-ink-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-haze">Add budget</h2>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-haze"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-text">Category</label>
                <select className="input-field" value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label-text">Monthly limit (₹)</label>
                <input required type="number" min={0} className="input-field" value={form.limit_amount}
                       onChange={(e) => setForm({ ...form, limit_amount: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Save budget</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
