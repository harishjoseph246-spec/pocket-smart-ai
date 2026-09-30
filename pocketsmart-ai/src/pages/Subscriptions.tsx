import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import api from "../services/api";
import type { Subscription } from "../types";

const emptyForm = { name: "", amount: "", billing_cycle: "monthly", next_payment: "", category: "Entertainment" };

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Subscription[]>("/api/subscriptions");
      setSubs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/subscriptions", {
      name: form.name, amount: Number(form.amount), billing_cycle: form.billing_cycle,
      next_payment: form.next_payment || null, category: form.category,
    });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const toggleStatus = async (s: Subscription) => {
    await api.put(`/api/subscriptions/${s.id}`, { status: s.status === "active" ? "inactive" : "active" });
    load();
  };

  const remove = async (id: number) => {
    await api.delete(`/api/subscriptions/${id}`);
    load();
  };

  const monthlyCost = subs.filter((s) => s.status === "active").reduce(
    (sum, s) => sum + (s.billing_cycle === "yearly" ? s.amount / 12 : s.amount), 0);
  const annualCost = monthlyCost * 12;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-haze">Subscriptions</h1>
          <p className="mt-1 text-sm text-mist">Keep tabs on every recurring payment.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Add subscription</button>
      </div>

      <div className="glass-card p-5">
        <p className="text-sm text-mist">
          Your active subscriptions cost approximately{" "}
          <span className="font-semibold text-haze">₹{Math.round(monthlyCost).toLocaleString()}/month</span> — about{" "}
          <span className="font-semibold text-haze">₹{Math.round(annualCost).toLocaleString()}/year</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-mist">Loading…</p>
        ) : subs.length === 0 ? (
          <p className="text-sm text-mist">No subscriptions tracked yet.</p>
        ) : (
          subs.map((s) => (
            <div key={s.id} className={`glass-card p-5 ${s.status === "inactive" ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-500/15 text-electric-400">
                    <RefreshCw size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-haze">{s.name}</h3>
                    <p className="text-xs text-mist">{s.category}</p>
                  </div>
                </div>
                <button onClick={() => remove(s.id)} className="text-mist hover:text-coral"><Trash2 size={15} /></button>
              </div>
              <p className="mt-3 font-display text-xl font-semibold text-haze">
                ₹{s.amount.toLocaleString()} <span className="text-xs font-normal text-mist">/ {s.billing_cycle}</span>
              </p>
              {s.next_payment && <p className="mt-1 text-xs text-mist">Next payment: {new Date(s.next_payment).toLocaleDateString()}</p>}
              <button onClick={() => toggleStatus(s)} className="mt-3 text-xs font-medium text-electric-400 hover:underline">
                Mark as {s.status === "active" ? "inactive" : "active"}
              </button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass-card w-full max-w-sm bg-ink-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-haze">Add subscription</h2>
              <button onClick={() => setShowForm(false)} className="text-mist hover:text-haze"><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input required className="input-field" value={form.name}
                       onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Netflix" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Amount (₹)</label>
                  <input required type="number" min={0} className="input-field" value={form.amount}
                         onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Billing cycle</label>
                  <select className="input-field" value={form.billing_cycle}
                          onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">Next payment date</label>
                <input type="date" className="input-field" value={form.next_payment}
                       onChange={(e) => setForm({ ...form, next_payment: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Save subscription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
