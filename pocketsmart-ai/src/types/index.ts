export interface User {
  id: number;
  name: string;
  email: string;
  monthly_income: number;
  onboarding_complete: number;
  savings_target: number;
  financial_goal: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  merchant: string;
  category: string;
  expense_type: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: number;
  category: string;
  limit_amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percent_used: number;
  status: "normal" | "near_limit" | "exceeded";
}

export interface Goal {
  id: number;
  goal_name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  progress_percent: number;
  remaining: number;
  required_monthly_saving: number | null;
}

export interface Subscription {
  id: number;
  name: string;
  amount: number;
  billing_cycle: string;
  next_payment: string | null;
  category: string;
  status: string;
}

export interface InsightItem {
  icon: string;
  title: string;
  description: string;
  category: string;
  impact: "positive" | "negative" | "neutral";
  date: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const CATEGORIES = [
  "Food", "Transport", "Shopping", "Bills", "Education",
  "Entertainment", "Healthcare", "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#4F6BFF",
  Transport: "#8B5CF6",
  Shopping: "#F87171",
  Bills: "#FBBF24",
  Education: "#34D399",
  Entertainment: "#A78BFA",
  Healthcare: "#6C86FF",
  Other: "#8C94AB",
};
