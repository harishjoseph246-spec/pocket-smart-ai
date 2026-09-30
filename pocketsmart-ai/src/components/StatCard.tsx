import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  icon: ReactNode;
}

export default function StatCard({ label, value, delta, deltaTone = "neutral", icon }: StatCardProps) {
  const toneClass = {
    positive: "text-mint",
    negative: "text-coral",
    neutral: "text-mist",
  }[deltaTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-mist">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-electric-400">
          {icon}
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-haze">{value}</p>
      {delta && <p className={`mt-1 text-xs font-medium ${toneClass}`}>{delta}</p>}
    </motion.div>
  );
}
