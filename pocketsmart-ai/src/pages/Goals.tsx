import { useEffect, useState } from "react";
import { Plus, Target, X } from "lucide-react";
import api from "../services/api";
import type { Goal } from "../types";

const emptyForm = { goal_name: "", target_amount: "", saved_amount: "", target_date: "" };

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Goal[]>("/api/goals");
      setGoals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/goals", {
      goal_name: form.goal_name, target_amount: Number(form.target_amount),
      saved_amount: Number(form.saved_amount) || 0, target_date: form.target_date || null,
    });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-haze">Savings Goals</h1>
          <p className="mt-1 text-sm text-mist">Track progress toward what matters to you.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> New goal</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-mist">Loading…</p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-mist">No goals yet — create your first one.</p>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <Target size={17} />
                </div>
                <h3 className="font-semibold text-haze">{g.goal_name}</h3>
              </div>
              <p className="text-xs text-mist">Target: ₹{g.target_amount.toLocaleString()}</p>
              <p className="text-xs text-mist">Saved: ₹{g.saved_amount.toLocaleString()}</p>
              <p className="text-xs text-mist">Remaining: ₹{g.remaining.toLocaleString()}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500"
                     style={{ width: `${g.progress_percent}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-mist">
                <span>{g.progress_percent}% complete</span>
                {g.target_date && <span>Target: {new Date(g.target_date).toLocaleDateString()}</span>}
              </div>
              {g.required_monthly_saving != null && (
                <p className="mt-2 text-xs text-electric-400">
                  Save ~₹{g.required_monthly_saving.toLocaleString()}/month to hit your target date.
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-card w-full max-w-sm bg-ink-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-haze">New goal</h2>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-haze"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-text">Goal name</label>
                <input required className="input-field" value={form.goal_name}
                       onChange={(e) => setForm({ ...form, goal_name: e.target.value })} placeholder="New Laptop" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Target amount (₹)</label>
                  <input required type="number" min={0} className="input-field" value={form.target_amount}
                         onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Already saved (₹)</label>
                  <input type="number" min={0} className="input-field" value={form.saved_amount}
                         onChange={(e) => setForm({ ...form, saved_amount: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-text">Target date</label>
                <input type="date" className="input-field" value={form.target_date}
                       onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Save goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
