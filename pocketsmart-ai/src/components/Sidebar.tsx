import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, CreditCard, Target, Sparkles, TrendingUp, PiggyBank,
  RefreshCw, BarChart3, MessageCircle, FileText, Bell, Settings, LogOut, Wallet,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: CreditCard },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
  { to: "/goals", label: "Savings Goals", icon: PiggyBank },
  { to: "/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/chat", label: "AI Assistant", icon: MessageCircle },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-ink-900/80 backdrop-blur-xl border-r border-white/[0.06]">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-500 to-violet-500">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="font-display text-lg font-semibold text-haze">PocketSmart</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-electric-500/15 text-electric-400"
                  : "text-mist hover:bg-white/[0.05] hover:text-haze"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-400">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-haze">{user?.name}</p>
            <p className="truncate text-xs text-mist">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="rounded-lg p-2 text-mist transition hover:bg-white/[0.06] hover:text-coral"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
