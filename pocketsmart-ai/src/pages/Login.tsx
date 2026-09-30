import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-haze">Welcome back</h1>
      <p className="mt-1 text-sm text-mist">Log in to see where your money's going.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label-text">Email</label>
          <input type="email" required className="input-field" value={email}
                 onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input type="password" required className="input-field" value={password}
                 onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-sm text-coral">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-mist">
        Demo account: demo@pocketsmart.ai / demo1234
      </p>
      <p className="mt-6 text-center text-sm text-mist">
        New here? <Link to="/register" className="text-electric-400 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
