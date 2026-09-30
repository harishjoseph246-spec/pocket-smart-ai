import { Outlet, Link } from "react-router-dom";
import { Wallet } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-500 to-violet-500">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-haze">PocketSmart AI</span>
        </Link>
        <div className="glass-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
