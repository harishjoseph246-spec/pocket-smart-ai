import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import {
  Wallet, Sparkles, PieChart, TrendingUp, PiggyBank, MessageCircle,
  ArrowRight, ShieldCheck, Lock, UserCheck, Zap, BarChart3,
  ChevronRight, Star, Menu, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Zap,
    title: "AI Expense Analysis",
    desc: "Real-time classification of transactions into granular categories with confidence scores and audits.",
    color: "from-electric-500/20 to-electric-600/5",
    accent: "text-electric-400",
    border: "hover:border-electric-500/30",
  },
  {
    icon: PieChart,
    title: "Smart Budget Planning",
    desc: "Dynamically allocates spending limits across tags, obligations, and goals — and tells you why.",
    color: "from-violet-500/20 to-violet-600/5",
    accent: "text-violet-400",
    border: "hover:border-violet-500/30",
  },
  {
    icon: PiggyBank,
    title: "Savings Goals",
    desc: "Set milestone-based ETD calculations that update your daily spending allowance in real time.",
    color: "from-mint/20 to-mint/5",
    accent: "text-mint",
    border: "hover:border-mint/30",
  },
  {
    icon: BarChart3,
    title: "Spending Insights",
    desc: "Proactively surfaces merchant-level price, optimal substitution, and discretionary outlier alerts.",
    color: "from-amber/20 to-amber/5",
    accent: "text-amber",
    border: "hover:border-amber/30",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    desc: "Synthesizes spending patterns to autonomously generate actionable, high-return savings nudges.",
    color: "from-electric-500/20 to-violet-500/10",
    accent: "text-electric-400",
    border: "hover:border-electric-500/30",
  },
  {
    icon: TrendingUp,
    title: "Financial Reports",
    desc: "Institutional-grade multi-period summaries you can export — designed for smarter health visibility.",
    color: "from-violet-500/20 to-electric-500/5",
    accent: "text-violet-400",
    border: "hover:border-violet-500/30",
  },
];

const transactions = [
  { icon: "🍔", label: "Food & Dining", amount: "₹450", type: "debit", cat: "Food" },
  { icon: "🚕", label: "Transport", amount: "₹280", type: "debit", cat: "Travel" },
  { icon: "🛒", label: "Shopping", amount: "₹1,250", type: "debit", cat: "Shopping" },
  { icon: "💻", label: "Subscription", amount: "₹799", type: "debit", cat: "Tech" },
  { icon: "☕", label: "Coffee Shop", amount: "₹160", type: "debit", cat: "Food" },
  { icon: "💰", label: "Salary Credit", amount: "₹42,000", type: "credit", cat: "Income" },
];

const spendingBars = [
  { label: "Food & Dining", pct: 68, color: "from-electric-500 to-electric-400", glow: "shadow-electric" },
  { label: "Transport", pct: 42, color: "from-violet-500 to-violet-400", glow: "shadow-violet" },
  { label: "Shopping", pct: 85, color: "from-coral to-amber", glow: "shadow-coral" },
  { label: "Subscriptions", pct: 31, color: "from-mint to-electric-400", glow: "shadow-mint" },
];

const stats = [
  { label: "Total Expenses", value: 21500, prefix: "₹", suffix: "", desc: "Tracked this month" },
  { label: "Current Savings", value: 8500, prefix: "₹", suffix: "", desc: "Across all goals" },
  { label: "Savings Rate", value: 28, prefix: "", suffix: "%", desc: "Of monthly income" },
  { label: "Monthly Improvement", value: 12, prefix: "+", suffix: "%", desc: "vs. last month" },
];

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#insights", label: "Insights" },
  { href: "#about", label: "About" },
];

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────────── */
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            prefix +
            Math.round(v).toLocaleString("en-IN") +
            suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, value, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED BAR
───────────────────────────────────────────────────────────── */
function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color} relative`}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <span className="absolute right-0 top-0 h-full w-4 rounded-full bg-white/40 blur-sm" />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TRANSACTION STREAM
───────────────────────────────────────────────────────────── */
function TransactionStream() {
  const [visible, setVisible] = useState<number[]>([0]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let idx = 1;
    const interval = setInterval(() => {
      setVisible((prev) => {
        const next = [...prev, idx % transactions.length];
        return next.slice(-4);
      });
      idx++;
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {visible.map((tIdx, position) => {
        const tx = transactions[tIdx];
        return (
          <motion.div
            key={`${tIdx}-${position}`}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setActive(tIdx)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer
              ${active === tIdx
                ? "bg-electric-500/10 border border-electric-500/20"
                : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05]"
              }`}
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-base"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {tx.icon}
              </motion.span>
              <div>
                <p className="text-xs font-medium text-haze">{tx.label}</p>
                <p className="text-[10px] text-mist">{tx.cat}</p>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-xs font-semibold ${tx.type === "credit" ? "text-mint" : "text-haze"}`}
            >
              {tx.type === "credit" ? "+" : "-"}{tx.amount}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MINI CHART (SVG sparkline)
───────────────────────────────────────────────────────────── */
function MiniChart() {
  const points = [20, 35, 28, 48, 38, 55, 42, 60, 52, 68, 58, 72];
  const max = Math.max(...points);
  const w = 200, h = 60;
  const coords = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - (p / max) * (h - 8),
  ]);
  const pathD = coords
    .map((c, i) => (i === 0 ? `M ${c[0]} ${c[1]}` : `L ${c[0]} ${c[1]}`))
    .join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;
  const ref = useRef<SVGPathElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F6BFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4F6BFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#4F6BFF" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <motion.path
        ref={ref}
        d={pathD}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {coords.map((c, i) => (
        <motion.circle
          key={i}
          cx={c[0]}
          cy={c[1]}
          r="2.5"
          fill="#4F6BFF"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.4 + i * 0.04, duration: 0.3 }}
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroGlowOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const dashboardY = useTransform(scrollY, [0, 600], [0, 60]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 40));
    return () => unsub();
  }, [scrollY]);

  /* prefers-reduced-motion */
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeUp = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="min-h-screen bg-ink-950 overflow-x-hidden">
      {/* ── AMBIENT BACKGROUND ─────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {/* Radial glows */}
        <div className="absolute -left-64 -top-32 h-[700px] w-[700px] rounded-full bg-electric-500/[0.07] blur-[140px]" />
        <div className="absolute -right-48 top-0 h-[600px] w-[600px] rounded-full bg-violet-500/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-electric-500/[0.04] blur-[100px]" />
        {/* Faint grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(79,107,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(79,107,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-electric-400/40"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={prefersReduced ? {} : {
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-ink-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        }`}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-500 to-violet-500 shadow-[0_0_20px_rgba(79,107,255,0.4)]">
              <Wallet size={17} className="text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-electric-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-base font-semibold text-haze tracking-tight">
              PocketSmart <span className="text-electric-400">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-mist hover:text-haze transition-colors duration-200 relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-electric-400 to-violet-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-mist hover:text-haze transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(79,107,255,0.3)] hover:shadow-[0_0_30px_rgba(79,107,255,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-mist hover:text-haze p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl px-6 py-4 space-y-3"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-mist hover:text-haze py-2 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center">Log in</Link>
              <Link to="/register" className="btn-primary flex-1 text-center">Get Started</Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Left — copy */}
          <div>
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-500/25 bg-electric-500/10 px-3.5 py-1.5 text-xs font-medium text-electric-400"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-electric-400" />
              </span>
              AI-Powered Financial Intelligence
            </motion.div>

            <motion.h1
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl font-semibold leading-[1.12] text-haze sm:text-5xl lg:text-[3.4rem]"
            >
              Take Control of{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-electric-400 via-violet-400 to-electric-400 bg-clip-text text-transparent animate-gradient-x">
                  Your Money
                </span>
              </span>{" "}
              with AI
            </motion.h1>

            <motion.p
              initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="mt-5 max-w-lg text-base leading-relaxed text-mist sm:text-lg"
            >
              PocketSmart AI helps you understand your spending, build smarter
              budgets, reach your savings goals, and make better financial
              decisions.
            </motion.p>

            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.44 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(79,107,255,0.35)] hover:shadow-[0_0_40px_rgba(79,107,255,0.55)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
              >
                Get Started
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-haze hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
              >
                Explore Features
                <ChevronRight size={14} className="text-mist" />
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              {[
                { icon: Lock, label: "256-bit Encrypted" },
                { icon: Star, label: "₹400Cr+ Analyzed" },
                { icon: ShieldCheck, label: "4.9/5 Rated" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-mist">
                  <Icon size={13} className="text-electric-400" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — dashboard preview */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: prefersReduced ? 0 : dashboardY }}
            className="relative"
          >
            {/* Glow behind dashboard */}
            <motion.div
              style={{ opacity: heroGlowOpacity }}
              className="pointer-events-none absolute -inset-10 rounded-3xl"
            >
              <div className="absolute inset-0 rounded-3xl bg-electric-500/[0.12] blur-[60px]" />
              <div className="absolute inset-0 rounded-3xl bg-violet-500/[0.08] blur-[80px] translate-x-8" />
            </motion.div>

            {/* Floating dashboard card */}
            <motion.div
              animate={prefersReduced ? {} : {
                y: [0, -10, 0],
                rotate: [-0.3, 0.3, -0.3],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 rounded-2xl border border-white/[0.08] bg-ink-900/80 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden"
            >
              {/* Dashboard header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-electric-500 to-violet-500">
                    <Wallet size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-haze">PocketSmart AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
                  <span className="text-[10px] text-mint font-medium">Live</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Expenses", val: "₹21,500", sub: "This month", color: "text-coral" },
                    { label: "Current Savings", val: "₹8,500", sub: "+₹1,200", color: "text-mint" },
                    { label: "Savings Rate", val: "28%", sub: "↑ 4% vs last", color: "text-electric-400" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3"
                    >
                      <p className="text-[9px] text-mist mb-1 leading-none">{s.label}</p>
                      <p className={`font-display text-sm font-semibold ${s.color}`}>{s.val}</p>
                      <p className="text-[9px] text-mist/60 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Spending bars */}
                <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3.5 space-y-2.5">
                  <p className="text-[10px] font-semibold text-mist uppercase tracking-wider mb-1">Spending Categories</p>
                  {spendingBars.map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between text-[10px] text-mist mb-1">
                        <span>{b.label}</span>
                        <span>{b.pct}%</span>
                      </div>
                      <AnimatedBar pct={b.pct} color={b.color} />
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="rounded-xl bg-white/[0.025] border border-white/[0.05] p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-mist uppercase tracking-wider">Spending Trend</p>
                    <span className="text-[9px] text-mint bg-mint/10 px-1.5 py-0.5 rounded-full">↑ 12%</span>
                  </div>
                  <div className="h-14">
                    <MiniChart />
                  </div>
                </div>

                {/* AI Insight strip */}
                <div className="rounded-xl bg-gradient-to-r from-electric-500/10 to-violet-500/10 border border-electric-500/20 p-3 flex items-start gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-electric-500/30 to-violet-500/30">
                    <Sparkles size={12} className="text-electric-400" />
                  </div>
                  <p className="text-[10px] text-mist leading-relaxed">
                    <span className="text-electric-400 font-medium">AI Insight: </span>
                    Food spending is up 18% this month. Saving ₹500/week could hit your goal 12 days earlier.
                  </p>
                </div>

                {/* Transactions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-mist uppercase tracking-wider">Recent Activity</p>
                    <span className="text-[9px] text-electric-400 cursor-pointer hover:text-electric-300">View all →</span>
                  </div>
                  <TransactionStream />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/[0.05] bg-ink-900/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center"
              >
                <p className="font-display text-2xl font-semibold text-haze sm:text-3xl">
                  <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm font-medium text-electric-400">{s.label}</p>
                <p className="text-xs text-mist/70">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-400">
            <Sparkles size={11} />
            Feature Suite
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center font-display text-2xl font-semibold text-haze sm:text-3xl lg:text-4xl"
        >
          Intelligence Built for{" "}
          <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
            Capital Growth
          </span>
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto mt-4 max-w-xl text-center text-base text-mist"
        >
          A coherent suite of machine learning instruments designed specifically to optimise personal cash velocity.
        </motion.p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, color, accent, border }, i) => (
            <motion.div
              key={title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.08 * i }}
              whileHover={prefersReduced ? {} : { y: -6, transition: { duration: 0.25 } }}
              className={`group relative rounded-2xl border border-white/[0.07] bg-gradient-to-br ${color} p-6 cursor-default transition-all duration-300 ${border} hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
            >
              {/* Animated gradient border on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(79,107,255,0.15), rgba(139,92,246,0.15))" }}
              />
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] ${accent} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={19} />
              </div>
              <h3 className="text-sm font-semibold text-haze mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-mist">{desc}</p>
              <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                Learn more <ChevronRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <motion.div {...fadeUp} className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/25 bg-electric-500/10 px-3.5 py-1.5 text-xs font-medium text-electric-400">
            <Zap size={11} />
            Cognitive Architecture
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center font-display text-2xl font-semibold text-haze sm:text-3xl lg:text-4xl"
        >
          How PocketSmart Operates
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto mt-4 max-w-xl text-center text-sm text-mist"
        >
          Continuous financial computation moving directly in the language of your daily transactions.
        </motion.p>

        <div className="mt-16 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-10 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-transparent via-electric-500/30 to-transparent" />
          {/* Animated particle on line */}
          {!prefersReduced && (
            <motion.div
              className="hidden lg:block absolute top-[38px] h-2 w-2 rounded-full bg-electric-400 shadow-[0_0_8px_rgba(79,107,255,0.8)]"
              animate={{ left: ["16%", "82%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                n: "01",
                title: "Track",
                desc: "Auto-sync and AI-classify every transaction across categories in real time. No manual effort.",
                icon: Wallet,
                color: "from-electric-500/15 to-transparent",
              },
              {
                n: "02",
                title: "Analyze",
                desc: "Proprietary ML workflows quantify spending health, category allocation, and behavioral drift month-on-end.",
                icon: BarChart3,
                color: "from-violet-500/15 to-transparent",
              },
              {
                n: "03",
                title: "Improve",
                desc: "Autonomously surfaces average savings rules and actionable financial strategies to progress your goals.",
                icon: TrendingUp,
                color: "from-mint/15 to-transparent",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                {...fadeUp}
                transition={{ duration: 0.55, delay: 0.12 * i }}
                className={`group relative rounded-2xl border border-white/[0.07] bg-gradient-to-b ${step.color} bg-ink-900/40 p-8 text-center hover:border-electric-500/20 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(79,107,255,0.1)]`}
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.07] group-hover:border-electric-500/30 transition-colors duration-300">
                  <step.icon size={22} className="text-electric-400" />
                </div>
                <div className="font-display text-4xl font-semibold text-electric-500/20 mb-2">{step.n}</div>
                <h3 className="text-base font-semibold text-haze mb-2">{step.title}</h3>
                <p className="text-sm text-mist leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI INSIGHT CARD ───────────────────────────────── */}
      <section id="insights" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-electric-500/20 bg-gradient-to-br from-ink-900/80 to-ink-800/60 backdrop-blur-xl p-8 lg:p-12"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-electric-500/10 blur-[60px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[60px]" />

          <div className="relative grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-3 py-1.5 text-xs font-medium text-electric-400">
                <motion.div
                  animate={prefersReduced ? {} : { rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={11} />
                </motion.div>
                AI Financial Intelligence
              </div>
              <h2 className="font-display text-2xl font-semibold text-haze sm:text-3xl">
                AI that reads your data,{" "}
                <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
                  not the news
                </span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-mist">
                PocketSmart AI's models look at your actual transactions, budgets, and goals to
                spot patterns — rising categories, exceeded budgets, upcoming subscriptions —
                and turn them into specific, explained recommendations.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-electric-400 hover:text-electric-300 transition-colors"
              >
                See AI insights in action <ArrowRight size={14} />
              </Link>
            </div>

            {/* AI Insight Card */}
            <motion.div
              whileHover={prefersReduced ? {} : { y: -4, transition: { duration: 0.3 } }}
              className="rounded-2xl border border-electric-500/20 bg-ink-950/70 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(79,107,255,0.1)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-500/30 to-violet-500/30 border border-electric-500/30">
                  <Sparkles size={15} className="text-electric-400" />
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-electric-500/20 to-violet-500/20"
                    animate={prefersReduced ? {} : { opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-haze">AI Financial Insight</p>
                  <p className="text-[10px] text-mist">Updated just now</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
                  <span className="text-[10px] text-mint">Live</span>
                </div>
              </div>
              <p className="text-sm text-mist leading-relaxed">
                Your <span className="text-haze font-medium">food spending increased 18%</span> this
                month. Reducing weekly food expenses by{" "}
                <span className="text-electric-400 font-medium">₹500</span> could help you reach your
                savings goal{" "}
                <span className="text-mint font-medium">12 days earlier</span>.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Food Budget Used", val: "₹5,000 / ₹4,200", accent: "text-coral" },
                  { label: "Goal Progress", val: "₹8,500 / ₹12,000", accent: "text-mint" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
                    <p className="text-[9px] text-mist mb-0.5">{m.label}</p>
                    <p className={`text-xs font-semibold ${m.accent}`}>{m.val}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-lg bg-electric-500/10 border border-electric-500/20 py-2 text-xs font-medium text-electric-400 hover:bg-electric-500/20 transition-colors duration-200">
                View Full Analysis →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── SECURITY SECTION ─────────────────────────────── */}
      <section id="about" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <motion.h2
          {...fadeUp}
          className="text-center font-display text-2xl font-semibold text-haze sm:text-3xl mb-3"
        >
          Enterprise-grade security
        </motion.h2>
        <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-center text-sm text-mist mb-10">
          Built with the same standards trusted by financial institutions.
        </motion.p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Lock,
              title: "Secure Authentication",
              desc: "JWT-based sessions keep your login secure across all devices and sessions.",
              color: "text-electric-400",
            },
            {
              icon: ShieldCheck,
              title: "Encrypted Credentials",
              desc: "Passwords are hashed with bcrypt — never stored in plain text under any circumstance.",
              color: "text-violet-400",
            },
            {
              icon: UserCheck,
              title: "Data Isolation",
              desc: "Every request is scoped to your account. No cross-user data access ever occurs.",
              color: "text-mint",
            },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-haze mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-mist">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl border border-electric-500/20 bg-gradient-to-br from-electric-500/10 via-violet-500/10 to-ink-900/80 p-10 text-center lg:p-16"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-electric-400/50 to-transparent" />
          </div>
          <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-electric-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-violet-500/10 blur-[80px]" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs font-medium text-mint mb-4">
              <Star size={10} /> Ready for deployment
            </span>
            <h2 className="font-display text-2xl font-semibold text-haze sm:text-3xl lg:text-4xl">
              Start making smarter{" "}
              <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
                financial decisions
              </span>{" "}
              today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-mist">
              Join forward-thinking individuals managing over ₹100Cr+ with computational precision. Instant setup in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-haze placeholder:text-mist/50 outline-none focus:border-electric-500/50 focus:bg-white/[0.06] transition-all duration-200"
              />
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(79,107,255,0.35)] hover:shadow-[0_0_40px_rgba(79,107,255,0.55)] transition-all duration-300 hover:scale-[1.02] sm:w-auto"
              >
                Get Started
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="mt-4 text-xs text-mist/50">No credit card · Free tier · Built on Next.js · Privacy-first</p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            {/* Brand */}
            <div className="flex flex-col items-center gap-2 md:items-start">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric-500 to-violet-500">
                  <Wallet size={14} className="text-white" />
                </div>
                <span className="font-display text-sm font-semibold text-haze">
                  PocketSmart <span className="text-electric-400">AI</span>
                </span>
              </div>
              <p className="text-xs text-mist max-w-[200px] text-center md:text-left">Your Smart Budget & Recommendation Assistant</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {["Product", "Features", "Security", "Privacy Policy", "Terms of Service"].map((l) => (
                <a key={l} href="#" className="text-xs text-mist hover:text-haze transition-colors duration-200">
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/[0.05] pt-6 text-center">
            <p className="text-xs text-mist/50">
              © {new Date().getFullYear()} PocketSmart AI Inc. All rights reserved. Computational audit infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
