import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const fields: { key: keyof typeof initial; label: string; placeholder: string }[] = [
  { key: "monthly_income", label: "Monthly income (₹)", placeholder: "30000" },
  { key: "rent", label: "Rent (₹)", placeholder: "8000" },
  { key: "food_budget", label: "Food budget (₹)", placeholder: "5000" },
  { key: "transport_budget", label: "Transport budget (₹)", placeholder: "3000" },
  { key: "entertainment_budget", label: "Entertainment budget (₹)", placeholder: "2000" },
  { key: "education_budget", label: "Education expenses (₹)", placeholder: "2000" },
  { key: "other_fixed_expenses", label: "Other fixed expenses (₹)", placeholder: "1000" },
  { key: "savings_target", label: "Monthly savings target (₹)", placeholder: "7000" },
];

const initial = {
  monthly_income: "", rent: "", food_budget: "", transport_budget: "",
  entertainment_budget: "", education_budget: "", other_fixed_expenses: "",
  savings_target: "", financial_goal: "",
};

export default function Onboarding() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/onboarding", {
        monthly_income: Number(form.monthly_income) || 0,
        rent: Number(form.rent) || 0,
        food_budget: Number(form.food_budget) || 0,
        transport_budget: Number(form.transport_budget) || 0,
        entertainment_budget: Number(form.entertainment_budget) || 0,
        education_budget: Number(form.education_budget) || 0,
        other_fixed_expenses: Number(form.other_fixed_expenses) || 0,
        savings_target: Number(form.savings_target) || 0,
        financial_goal: form.financial_goal,
      });
      await refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not save your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-haze">Let's set up your budget</h1>
        <p className="mt-1 text-sm text-mist">
          A few quick numbers so PocketSmart AI can build your first budget.
        </p>

        <form onSubmit={submit} className="glass-card mt-6 space-y-5 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="label-text">{f.label}</label>
                <input
                  type="number" min={0} className="input-field" placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="label-text">Financial goal</label>
            <input
              className="input-field" placeholder="e.g. Save for a laptop, build an emergency fund"
              value={form.financial_goal}
              onChange={(e) => setForm({ ...form, financial_goal: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Setting up…" : "Generate my budget"}
          </button>
        </form>
      </div>
    </div>
  );
}
