import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", income: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, Number(form.income) || 0);
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-haze">Create your account</h1>
      <p className="mt-1 text-sm text-mist">Takes less than a minute.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label-text">Full name</label>
          <input required className="input-field" value={form.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input type="email" required className="input-field" value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input type="password" required minLength={6} className="input-field" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
        </div>
        <div>
          <label className="label-text">Monthly income (₹)</label>
          <input type="number" min={0} className="input-field" value={form.income}
                 onChange={(e) => setForm({ ...form, income: e.target.value })} placeholder="30000" />
        </div>
        {error && <p className="text-sm text-coral">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Get Started"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        Already have an account? <Link to="/login" className="text-electric-400 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
