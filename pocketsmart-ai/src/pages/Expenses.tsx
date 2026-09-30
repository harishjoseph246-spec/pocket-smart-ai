import { useEffect, useState } from "react";
import { Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import api from "../services/api";
import type { Expense } from "../types";
import { CATEGORIES } from "../types";

const emptyForm = {
  amount: "", description: "", merchant: "", category: "Other",
  expense_type: "Essential", date: new Date().toISOString().slice(0, 10),
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiSuggestion, setAiSuggestion] = useState<{ category: string; expense_type: string; merchant: string; confidence: number } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Expense[]>("/api/expenses", {
        params: { category: categoryFilter || undefined, search: search || undefined, sort_by: sortBy },
      });
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [categoryFilter, sortBy]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const runAI = async () => {
    if (!form.description || !form.amount) return;
    setAiLoading(true);
    try {
      const { data } = await api.post("/api/ai/categorize-expense", {
        description: form.description, amount: Number(form.amount),
      });
      setAiSuggestion(data);
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion) return;
    setForm({ ...form, category: aiSuggestion.category, expense_type: aiSuggestion.expense_type,
      merchant: form.merchant || aiSuggestion.merchant });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/expenses", {
      amount: Number(form.amount), description: form.description, merchant: form.merchant,
      category: form.category, expense_type: form.expense_type, date: form.date,
    });
    setForm(emptyForm);
    setAiSuggestion(null);
    setShowForm(false);
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/expenses/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-haze">Expenses</h1>
          <p className="mt-1 text-sm text-mist">Add, search, and manage every transaction.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input className="input-field pl-9" placeholder="Search expenses…" value={search}
                 onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="date">Sort by date</option>
          <option value="amount">Sort by amount</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-mist">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="p-8 text-center text-sm text-mist">No expenses found. Add your first one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-mist">
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-haze">{e.description}</p>
                      {e.merchant && <p className="text-xs text-mist">{e.merchant}</p>}
                    </td>
                    <td className="px-5 py-3 text-mist">{e.category}</td>
                    <td className="px-5 py-3 text-mist">{e.expense_type}</td>
                    <td className="px-5 py-3 text-mist">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right font-medium text-haze">₹{e.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => remove(e.id)} className="rounded-lg p-1.5 text-mist hover:bg-coral/10 hover:text-coral">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-card w-full max-w-md bg-ink-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-haze">Add expense</h2>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-haze"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-text">Description</label>
                <input required className="input-field" value={form.description}
                       onChange={(e) => setForm({ ...form, description: e.target.value })}
                       placeholder="e.g. Bought a shirt from Myntra" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Amount (₹)</label>
                  <input required type="number" min={0} className="input-field" value={form.amount}
                         onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Date</label>
                  <input required type="date" className="input-field" value={form.date}
                         onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>

              <button type="button" onClick={runAI} disabled={aiLoading || !form.description || !form.amount}
                      className="btn-secondary w-full">
                <Sparkles size={15} /> {aiLoading ? "Categorizing…" : "Let AI categorize this"}
              </button>

              {aiSuggestion && (
                <div className="rounded-xl border border-electric-500/30 bg-electric-500/10 p-3 text-sm">
                  <p className="text-haze">
                    AI suggests <span className="font-semibold">{aiSuggestion.category}</span> ·{" "}
                    {aiSuggestion.expense_type} · {Math.round(aiSuggestion.confidence * 100)}% confidence
                  </p>
                  <button type="button" onClick={applySuggestion} className="mt-2 text-xs font-medium text-electric-400 hover:underline">
                    Apply suggestion
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Category</label>
                  <select className="input-field" value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Type</label>
                  <select className="input-field" value={form.expense_type}
                          onChange={(e) => setForm({ ...form, expense_type: e.target.value })}>
                    <option>Essential</option>
                    <option>Non-essential</option>
                    <option>Recurring</option>
                    <option>One-time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Merchant (optional)</label>
                <input className="input-field" value={form.merchant}
                       onChange={(e) => setForm({ ...form, merchant: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Save expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
