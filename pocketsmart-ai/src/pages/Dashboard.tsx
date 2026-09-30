import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, Receipt, PiggyBank, Percent, AlertTriangle, Sparkles,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, LineChart, Line, Legend,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import StatCard from "../components/StatCard";
import BudgetProgress from "../components/BudgetProgress";
import type { Budget, Expense } from "../types";
import { CATEGORY_COLORS } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; expenses: number; income: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [budgetsRes, expensesRes] = await Promise.all([
          api.get<Budget[]>("/api/budgets"),
          api.get<Expense[]>("/api/expenses"),
        ]);
        setBudgets(budgetsRes.data);
        setExpenses(expensesRes.data);

        const byMonth: Record<string, number> = {};
        expensesRes.data.forEach((e) => {
          const m = new Date(e.date).toLocaleString("default", { month: "short" });
          byMonth[m] = (byMonth[m] || 0) + e.amount;
        });
        setMonthlyTrend(Object.entries(byMonth).slice(-6).map(([month, expenses]) => ({
          month, expenses, income: user?.monthly_income || 0,
        })));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const income = user?.monthly_income || 0;
  const savings = income - totalExpenses;
  const savingsRate = income ? Math.round((savings / income) * 100) : 0;
  const exceededBudgets = budgets.filter((b) => b.status === "exceeded");

  const categoryData = Object.values(
    expenses.reduce((acc: Record<string, { name: string; value: number }>, e) => {
      acc[e.category] = acc[e.category] || { name: e.category, value: 0 };
      acc[e.category].value += e.amount;
      return acc;
    }, {})
  );

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-mist">Loading your dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-mist">Here's how your money looks this month.</p>
      </div>

      {exceededBudgets.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          <AlertTriangle size={18} />
          {exceededBudgets.map((b) => b.category).join(", ")} {exceededBudgets.length === 1 ? "budget has" : "budgets have"} been exceeded this month.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Monthly Income" value={`₹${income.toLocaleString()}`} icon={<Wallet size={18} />} />
        <StatCard label="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} icon={<Receipt size={18} />} />
        <StatCard label="Current Savings" value={`₹${savings.toLocaleString()}`} icon={<PiggyBank size={18} />}
          deltaTone={savings >= 0 ? "positive" : "negative"} delta={savings >= 0 ? "Positive balance" : "Overspent"} />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} icon={<Percent size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-haze">Spending Overview</h2>
          {categoryData.length === 0 ? (
            <p className="py-10 text-center text-sm text-mist">No expenses logged yet — add one to see the breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#8C94AB"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#E7EAF3" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8C94AB" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-haze">Monthly Spending</h2>
          {monthlyTrend.length === 0 ? (
            <p className="py-10 text-center text-sm text-mist">Not enough history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#8C94AB" fontSize={12} />
                <YAxis stroke="#8C94AB" fontSize={12} />
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#E7EAF3" }} />
                <Bar dataKey="expenses" fill="#4F6BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-haze">Income vs Expenses</h2>
          {monthlyTrend.length === 0 ? (
            <p className="py-10 text-center text-sm text-mist">Not enough history yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#8C94AB" fontSize={12} />
                <YAxis stroke="#8C94AB" fontSize={12} />
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#E7EAF3" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8C94AB" }} />
                <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <h2 className="text-sm font-semibold text-haze">Budget Progress</h2>
          </div>
          {budgets.length === 0 ? (
            <p className="py-10 text-center text-sm text-mist">No budgets set yet.</p>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 5).map((b) => <BudgetProgress key={b.id} budget={b} />)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
