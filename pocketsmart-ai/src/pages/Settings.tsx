import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [income, setIncome] = useState(user?.monthly_income?.toString() || "");
  const [savingsTarget, setSavingsTarget] = useState(user?.savings_target?.toString() || "");
  const [goal, setGoal] = useState(user?.financial_goal || "");
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/auth/onboarding", {
      monthly_income: Number(income) || 0,
      rent: 0, food_budget: 0, transport_budget: 0, entertainment_budget: 0,
      education_budget: 0, other_fixed_expenses: 0,
      savings_target: Number(savingsTarget) || 0, financial_goal: goal,
    });
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">Settings</h1>
        <p className="mt-1 text-sm text-mist">Update your profile and financial defaults.</p>
      </div>

      <form onSubmit={save} className="glass-card space-y-4 p-6">
        <div>
          <label className="label-text">Name</label>
          <input className="input-field" value={user?.name || ""} disabled />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input className="input-field" value={user?.email || ""} disabled />
        </div>
        <div>
          <label className="label-text">Monthly income (₹)</label>
          <input type="number" min={0} className="input-field" value={income} onChange={(e) => setIncome(e.target.value)} />
        </div>
        <div>
          <label className="label-text">Monthly savings target (₹)</label>
          <input type="number" min={0} className="input-field" value={savingsTarget} onChange={(e) => setSavingsTarget(e.target.value)} />
        </div>
        <div>
          <label className="label-text">Financial goal</label>
          <input className="input-field" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full">Save changes</button>
        {saved && <p className="text-center text-sm text-mint">Saved.</p>}
      </form>
    </div>
  );
}
