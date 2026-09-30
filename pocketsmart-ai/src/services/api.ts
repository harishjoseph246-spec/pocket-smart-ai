/**
 * Frontend-only "API".
 *
 * This module replaces the original FastAPI backend. It exposes the same
 * axios-like interface (api.get / post / put / delete → { data }) so every
 * page works unchanged, but all data lives in the browser's localStorage.
 *
 * Demo login:  demo@pocketsmart.ai / demo1234
 */

// ---------- helpers ----------
const DB_KEY = "pocketsmart_db_v1";
const TOKEN_KEY = "pocketsmart_token";

type Row = Record<string, any>;
interface DB {
  seq: number;
  users: Row[];
  expenses: Row[];
  budgets: Row[];
  goals: Row[];
  subscriptions: Row[];
  notifications: Row[];
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addMonths = (d: Date, n: number) => {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  r.setDate(Math.min(d.getDate(), new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()));
  return r;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
const ymOf = (s: string) => ({ y: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) });

class ApiError extends Error {
  response: { status: number; data: { detail: string } };
  constructor(status: number, detail: string) {
    super(detail);
    this.response = { status, data: { detail } };
  }
}

function seedDemo(db: DB) {
  const id = () => ++db.seq;
  const today = new Date();
  const user = {
    id: id(), name: "Demo User", email: "demo@pocketsmart.ai", password: "demo1234",
    monthly_income: 30000, rent: 8000, onboarding_complete: 1, savings_target: 7000,
    financial_goal: "Build an emergency fund and save for a laptop",
  };
  db.users.push(user);

  const base: Record<string, number> = {
    Food: 5200, Transport: 2800, Shopping: 3900, Bills: 4500,
    Education: 2000, Entertainment: 1600, Healthcare: 1500, Other: 1000,
  };
  const desc: Record<string, string[]> = {
    Food: ["Swiggy order", "Grocery shopping", "Cafe Coffee Day", "Dinner out"],
    Transport: ["Uber ride", "Petrol", "Metro card recharge"],
    Shopping: ["Myntra order", "Amazon purchase", "New shoes"],
    Bills: ["Electricity bill", "Internet bill", "Mobile recharge"],
    Education: ["Udemy course", "Course books"],
    Entertainment: ["Netflix subscription", "Movie tickets", "Spotify"],
    Healthcare: ["Pharmacy", "Doctor visit"],
    Other: ["Miscellaneous", "Gift"],
  };
  const type: Record<string, string> = {
    Food: "Essential", Transport: "Essential", Shopping: "Non-essential", Bills: "Essential",
    Education: "Essential", Entertainment: "Non-essential", Healthcare: "Essential", Other: "Non-essential",
  };

  for (let ago = 5; ago >= 0; ago--) {
    const md = addMonths(today, -ago);
    for (const [cat, b] of Object.entries(base)) {
      const total = b * rand(0.85, 1.2);
      const n = randInt(2, 5);
      const per = total / n;
      for (let i = 0; i < n; i++) {
        const d = new Date(md.getFullYear(), md.getMonth(), randInt(1, 28));
        if (d > today) continue;
        const text = pick(desc[cat]);
        db.expenses.push({
          id: id(), user_id: user.id, amount: round(per * rand(0.7, 1.3)), description: text,
          merchant: text.split(" ")[0], category: cat, expense_type: type[cat],
          date: iso(d), created_at: new Date().toISOString(),
        });
      }
    }
  }
  for (const [cat, b] of Object.entries(base)) {
    db.budgets.push({
      id: id(), user_id: user.id, category: cat, limit_amount: round(b * 1.05),
      month: today.getMonth() + 1, year: today.getFullYear(),
    });
  }
  db.goals.push(
    { id: id(), user_id: user.id, goal_name: "New Laptop", target_amount: 60000, saved_amount: 18000, target_date: iso(addMonths(today, 18)) },
    { id: id(), user_id: user.id, goal_name: "Emergency Fund", target_amount: 50000, saved_amount: 22000, target_date: iso(addMonths(today, 10)) },
    { id: id(), user_id: user.id, goal_name: "Goa Trip", target_amount: 25000, saved_amount: 6000, target_date: iso(addMonths(today, 6)) },
  );
  const sub = (name: string, amount: number, cycle: string, next: Date, category: string) =>
    db.subscriptions.push({ id: id(), user_id: user.id, name, amount, billing_cycle: cycle, next_payment: iso(next), category, status: "active" });
  sub("Netflix", 649, "monthly", addDays(today, 10), "Entertainment");
  sub("Spotify", 119, "monthly", addDays(today, 5), "Entertainment");
  sub("Internet", 799, "monthly", addDays(today, 15), "Bills");
  sub("Amazon Prime", 1499, "yearly", addMonths(today, 4), "Shopping");

  const note = (title: string, message: string, t: string) =>
    db.notifications.push({ id: id(), user_id: user.id, title, message, type: t, is_read: false, created_at: new Date().toISOString() });
  note("Shopping budget nearing limit", "You have used 85% of your shopping budget.", "warning");
  note("Savings goal progress", "You're 40% of the way to your New Laptop goal.", "success");
  note("Monthly report available", "Your financial report for this month is ready to view.", "info");
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through and reseed */ }
  const db: DB = { seq: 0, users: [], expenses: [], budgets: [], goals: [], subscriptions: [], notifications: [] };
  seedDemo(db);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}
const saveDB = (db: DB) => localStorage.setItem(DB_KEY, JSON.stringify(db));

const publicUser = (u: Row) => {
  const { password, rent, ...rest } = u;
  return rest;
};

function currentUser(db: DB): Row {
  const token = localStorage.getItem(TOKEN_KEY);
  const uid = token && token.startsWith("local-") ? Number(token.slice(6)) : NaN;
  const user = db.users.find((u) => u.id === uid);
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    throw new ApiError(401, "Not authenticated");
  }
  return user;
}

// ---------- analytics helpers ----------
const inMonth = (e: Row, m: number, y: number) => {
  const p = ymOf(e.date);
  return p.m === m && p.y === y;
};
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
function byCategory(db: DB, uid: number, m: number, y: number) {
  const out: Record<string, number> = {};
  db.expenses.filter((e) => e.user_id === uid && inMonth(e, m, y)).forEach((e) => {
    out[e.category] = (out[e.category] || 0) + e.amount;
  });
  return out;
}
function monthTotal(db: DB, uid: number, m: number, y: number) {
  return sum(db.expenses.filter((e) => e.user_id === uid && inMonth(e, m, y)).map((e) => e.amount));
}
const maxKey = (o: Record<string, number>) =>
  Object.keys(o).length ? Object.keys(o).reduce((a, b) => (o[a] >= o[b] ? a : b)) : null;
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const now = () => { const d = new Date(); return { m: d.getMonth() + 1, y: d.getFullYear(), d }; };

// ---------- "AI" (rule-based, driven by the user's own data) ----------
const KEYWORDS: Record<string, string[]> = {
  Food: ["restaurant", "food", "swiggy", "zomato", "cafe", "coffee", "grocery", "groceries", "lunch", "dinner", "breakfast", "kitchen", "dominos", "pizza"],
  Transport: ["uber", "ola", "petrol", "fuel", "diesel", "taxi", "cab", "metro", "bus", "train", "parking", "toll"],
  Shopping: ["myntra", "amazon", "flipkart", "shirt", "shoes", "mall", "clothes", "clothing", "store", "purchase", "shopping"],
  Bills: ["electricity", "water bill", "internet", "wifi", "broadband", "gas bill", "bill", "recharge", "mobile bill", "rent"],
  Education: ["course", "tuition", "book", "books", "school", "college", "class", "fees", "exam", "udemy", "coursera"],
  Entertainment: ["movie", "netflix", "spotify", "concert", "game", "gaming", "cinema", "prime video", "hotstar", "party"],
  Healthcare: ["doctor", "medicine", "pharmacy", "hospital", "clinic", "medical", "health", "dentist"],
};

function categorize(description: string, amount: number) {
  const text = description.toLowerCase();
  let best = "Other", hits = 0;
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    const h = kws.filter((k) => text.includes(k)).length;
    if (h > hits) { best = cat; hits = h; }
  }
  const confidence = hits >= 2 ? 0.95 : hits === 1 ? 0.8 : 0.5;
  let expense_type = best === "Shopping" || best === "Entertainment" ? "Non-essential" : "Essential";
  if (amount > 10000) expense_type = "Non-essential";
  const words = description.trim().split(/\s+/);
  const merchant = (words.find((w) => /^[A-Z]/.test(w) && !["The", "A", "An"].includes(w)) || words[0] || "Unknown").replace(/[,.!]/g, "");
  return { category: best, expense_type, merchant, confidence };
}

function generateInsights(cur: Record<string, number>, prev: Record<string, number>, budgets: { category: string; limit_amount: number; spent: number }[]) {
  const out: Row[] = [];
  for (const [cat, amt] of Object.entries(cur)) {
    const p = prev[cat] || 0;
    if (p > 0) {
      const change = ((amt - p) / p) * 100;
      if (Math.abs(change) >= 10) {
        const dir = change > 0 ? "increased" : "decreased";
        out.push({
          icon: change > 0 ? "trending-up" : "trending-down",
          title: `${cat} spending ${dir}`,
          description: `${cat} spending ${dir} ${Math.abs(change).toFixed(0)}% compared with last month (${inr(p)} → ${inr(amt)}).`,
          category: cat, impact: change > 0 ? "negative" : "positive", date: "this month",
        });
      }
    }
  }
  for (const b of budgets) {
    if (b.limit_amount > 0) {
      const pct = (b.spent / b.limit_amount) * 100;
      if (pct > 100) {
        out.push({ icon: "alert-triangle", title: `${b.category} budget exceeded`,
          description: `${b.category} exceeded the monthly budget by ${inr(b.spent - b.limit_amount)}.`,
          category: b.category, impact: "negative", date: "this month" });
      } else if (pct >= 85) {
        out.push({ icon: "alert-circle", title: `${b.category} budget nearing limit`,
          description: `You have used ${pct.toFixed(0)}% of your ${b.category} budget.`,
          category: b.category, impact: "neutral", date: "this month" });
      }
    }
  }
  if (!out.length) {
    out.push({ icon: "check-circle", title: "Spending looks stable",
      description: "No major changes or budget issues detected this month.",
      category: "Overview", impact: "positive", date: "this month" });
  }
  return out;
}

function chatReply(message: string, ctx: { income: number; total: number; cats: Record<string, number> }) {
  const text = message.toLowerCase();
  const { cats, income, total } = ctx;
  if (!Object.keys(cats).length) return "I don't see any recorded expenses yet — add a few and ask me again.";
  const top = maxKey(cats)!;
  const topAmt = cats[top];
  const savings = income - total;
  if (text.includes("where") && text.includes("spend")) return `Your highest spending category is ${top} at ${inr(topAmt)}.`;
  if (text.includes("save") && /\d/.test(text)) {
    const target = parseFloat(text.replace(/[^\d.]/g, ""));
    const plan = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c, a]) => `${c} by ${inr(a * 0.15)}`).join(", ");
    return target
      ? `To free up roughly ${inr(target)}, consider trimming your biggest categories: ${plan}.`
      : `Consider trimming your biggest categories: ${plan}.`;
  }
  if (text.includes("shopping") && text.includes("reduce")) {
    const a = cats["Shopping"] || 0;
    return `You spent ${inr(a)} on Shopping. Cutting it by 20% would save about ${inr(a * 0.2)} this month.`;
  }
  if (text.includes("savings rate") || (text.includes("how much") && text.includes("saving"))) {
    const rate = income ? (savings / income) * 100 : 0;
    return `Your current savings rate is ${rate.toFixed(0)}% (${inr(savings)} saved of ${inr(income)}).`;
  }
  return `Based on your data, ${top} is your biggest expense at ${inr(topAmt)}. Ask me things like 'where did I spend the most' or 'how can I save ₹2000 next month'.`;
}

function predictNext(history: { label: string; total: number }[]) {
  if (!history.length) return { predicted: 0, lower_bound: 0, upper_bound: 0, note: "Not enough data yet." };
  const t = history.map((h) => h.total);
  if (t.length === 1) {
    const s = t[0] * 0.1;
    return { predicted: round(t[0]), lower_bound: round(t[0] - s), upper_bound: round(t[0] + s),
      note: "Prediction based on a single month of data — accuracy will improve with more history." };
  }
  const n = t.length;
  const xs = t.map((_, i) => i);
  const mx = sum(xs) / n, my = sum(t) / n;
  const a = sum(xs.map((x, i) => (x - mx) * (t[i] - my))) / sum(xs.map((x) => (x - mx) ** 2));
  const b = my - a * mx;
  const predicted = Math.max(a * n + b, 0);
  const res = t.map((v, i) => v - (a * i + b));
  const std = Math.sqrt(sum(res.map((r) => r * r)) / n);
  return { predicted: round(predicted), lower_bound: round(Math.max(predicted - std, 0)), upper_bound: round(predicted + std),
    note: "Prediction based on historical spending patterns using linear trend analysis." };
}

// ---------- report + minimal PDF ----------
function buildReport(db: DB, u: Row) {
  const { m, y, d } = now();
  const prev = addMonths(d, -1);
  const expenses = monthTotal(db, u.id, m, y);
  const prevExp = monthTotal(db, u.id, prev.getMonth() + 1, prev.getFullYear());
  const mom = prevExp ? ((expenses - prevExp) / prevExp) * 100 : 0;
  const income = u.monthly_income || 0;
  const savings = income - expenses;
  const cats = byCategory(db, u.id, m, y);
  const top = maxKey(cats);
  const insights = generateInsights(cats, byCategory(db, u.id, prev.getMonth() + 1, prev.getFullYear()), []);
  return {
    month_label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
    income, expenses: round(expenses), savings: round(savings),
    savings_rate: round(income ? (savings / income) * 100 : 0, 1),
    top_category: top, top_category_amount: top ? round(cats[top]) : 0,
    month_over_month_change: round(mom, 1),
    insights: insights.map((i) => i.description).slice(0, 5),
  };
}

function reportPdf(r: ReturnType<typeof buildReport>): Blob {
  const esc = (s: string) => s.replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "-");
  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const lines: [string, number, boolean, number][] = [
    ["POCKETSMART AI", 16, true, 26],
    [`${r.month_label} Financial Report`, 13, true, 32],
    [`Income: Rs ${fmt(r.income)}`, 11, false, 20],
    [`Expenses: Rs ${fmt(r.expenses)}`, 11, false, 20],
    [`Savings: Rs ${fmt(r.savings)}`, 11, false, 20],
    [`Savings Rate: ${r.savings_rate}%`, 11, false, 28],
  ];
  if (r.top_category) lines.push([`Top Category: ${r.top_category} - Rs ${fmt(r.top_category_amount)}`, 11, false, 20]);
  lines.push([`Month-over-month change: ${r.month_over_month_change}%`, 11, false, 28]);
  lines.push(["AI Insights:", 12, true, 22]);
  r.insights.forEach((i) => lines.push([`- ${i}`.slice(0, 95), 10, false, 17]));

  let y = 790;
  let content = "";
  for (const [text, size, bold, gap] of lines) {
    content += `BT /${bold ? "F2" : "F1"} ${size} Tf 57 ${y} Td (${esc(text)}) Tj ET\n`;
    y -= gap;
  }
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { pdf += `${String(o).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

// ---------- enrichers ----------
function enrichBudget(db: DB, uid: number, b: Row) {
  const spent = sum(db.expenses.filter((e) => e.user_id === uid && e.category === b.category && inMonth(e, b.month, b.year)).map((e) => e.amount));
  const pct = b.limit_amount ? (spent / b.limit_amount) * 100 : 0;
  return {
    id: b.id, category: b.category, limit_amount: b.limit_amount, month: b.month, year: b.year,
    spent: round(spent), remaining: round(b.limit_amount - spent), percent_used: round(pct, 1),
    status: pct > 100 ? "exceeded" : pct >= 85 ? "near_limit" : "normal",
  };
}
function enrichGoal(g: Row) {
  const progress = g.target_amount ? (g.saved_amount / g.target_amount) * 100 : 0;
  const remaining = Math.max(g.target_amount - g.saved_amount, 0);
  let required: number | null = null;
  if (g.target_date) {
    const t = new Date(g.target_date), n = new Date();
    const months = Math.max((t.getFullYear() - n.getFullYear()) * 12 + (t.getMonth() - n.getMonth()), 1);
    required = round(remaining / months);
  }
  return { id: g.id, goal_name: g.goal_name, target_amount: g.target_amount, saved_amount: g.saved_amount,
    target_date: g.target_date ?? null, progress_percent: round(Math.min(progress, 100), 1),
    remaining: round(remaining), required_monthly_saving: required };
}

// ---------- router ----------
type Cfg = { params?: Record<string, any>; responseType?: string };

function handle(method: string, url: string, body: any, cfg: Cfg): any {
  const db = loadDB();
  const path = url.replace(/^\/api/, "");
  const seg = path.split("/").filter(Boolean);
  const res = seg[0];
  const rid = seg[1] && /^\d+$/.test(seg[1]) ? Number(seg[1]) : null;

  // --- auth (no token needed for login/register)
  if (res === "auth") {
    if (seg[1] === "register" && method === "post") {
      if (db.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase()))
        throw new ApiError(400, "Email already registered");
      const u = { id: ++db.seq, name: body.name, email: body.email, password: body.password,
        monthly_income: body.monthly_income || 0, rent: 0, onboarding_complete: 0, savings_target: 0, financial_goal: "" };
      db.users.push(u);
      saveDB(db);
      return { access_token: `local-${u.id}`, token_type: "bearer" };
    }
    if (seg[1] === "login" && method === "post") {
      const u = db.users.find((x) => x.email.toLowerCase() === String(body.email).toLowerCase());
      if (!u || u.password !== body.password) throw new ApiError(401, "Invalid email or password");
      return { access_token: `local-${u.id}`, token_type: "bearer" };
    }
  }

  const user = currentUser(db);
  const uid = user.id;
  const { m: curM, y: curY, d: today } = now();
  const commit = () => saveDB(db);

  switch (res) {
    case "auth": {
      if (seg[1] === "me") return publicUser(user);
      if (seg[1] === "onboarding") {
        Object.assign(user, {
          monthly_income: body.monthly_income, rent: body.rent, savings_target: body.savings_target,
          financial_goal: body.financial_goal, onboarding_complete: 1,
        });
        const starter: Record<string, number> = {
          Food: body.food_budget, Transport: body.transport_budget, Entertainment: body.entertainment_budget,
          Education: body.education_budget, Bills: (body.rent || 0) + (body.other_fixed_expenses || 0),
        };
        for (const [category, amount] of Object.entries(starter)) {
          if (amount > 0 && !db.budgets.some((b) => b.user_id === uid && b.category === category && b.month === curM && b.year === curY))
            db.budgets.push({ id: ++db.seq, user_id: uid, category, limit_amount: amount, month: curM, year: curY });
        }
        commit();
        return publicUser(user);
      }
      break;
    }

    case "expenses": {
      if (method === "get") {
        const p = cfg.params || {};
        let rows = db.expenses.filter((e) => e.user_id === uid);
        if (p.category) rows = rows.filter((e) => e.category === p.category);
        if (p.search) rows = rows.filter((e) => e.description.toLowerCase().includes(String(p.search).toLowerCase()));
        if (p.date_from) rows = rows.filter((e) => e.date >= p.date_from);
        if (p.date_to) rows = rows.filter((e) => e.date <= p.date_to);
        const asc = p.order === "asc";
        const key = p.sort_by === "amount" ? "amount" : "date";
        rows.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : b.id - a.id) * (asc ? 1 : -1));
        return rows;
      }
      if (method === "post") {
        const e = { id: ++db.seq, user_id: uid, amount: body.amount, description: body.description,
          merchant: body.merchant || "", category: body.category, expense_type: body.expense_type || "Essential",
          date: body.date, created_at: new Date().toISOString() };
        db.expenses.push(e); commit(); return e;
      }
      const e = db.expenses.find((x) => x.id === rid && x.user_id === uid);
      if (!e) throw new ApiError(404, "Expense not found");
      if (method === "put") { Object.assign(e, body); commit(); return e; }
      if (method === "delete") { db.expenses = db.expenses.filter((x) => x !== e); commit(); return { ok: true }; }
      break;
    }

    case "budgets": {
      if (method === "get") {
        const m = cfg.params?.month || curM, y = cfg.params?.year || curY;
        return db.budgets.filter((b) => b.user_id === uid && b.month === m && b.year === y).map((b) => enrichBudget(db, uid, b));
      }
      if (method === "post") {
        const existing = db.budgets.find((x) => x.user_id === uid && x.category === body.category && x.month === body.month && x.year === body.year);
        const b: Row = existing ?? { id: ++db.seq, user_id: uid, ...body };
        if (existing) b.limit_amount = body.limit_amount;
        else db.budgets.push(b);
        commit(); return enrichBudget(db, uid, b);
      }
      const b = db.budgets.find((x) => x.id === rid && x.user_id === uid);
      if (!b) throw new ApiError(404, "Budget not found");
      if (method === "put") { b.limit_amount = body.limit_amount; commit(); return enrichBudget(db, uid, b); }
      if (method === "delete") { db.budgets = db.budgets.filter((x) => x !== b); commit(); return { ok: true }; }
      break;
    }

    case "goals": {
      if (method === "get") return db.goals.filter((g) => g.user_id === uid).map(enrichGoal);
      if (method === "post") {
        const g = { id: ++db.seq, user_id: uid, goal_name: body.goal_name, target_amount: body.target_amount,
          saved_amount: body.saved_amount || 0, target_date: body.target_date || null };
        db.goals.push(g); commit(); return enrichGoal(g);
      }
      const g = db.goals.find((x) => x.id === rid && x.user_id === uid);
      if (!g) throw new ApiError(404, "Goal not found");
      if (method === "put") { Object.assign(g, body); commit(); return enrichGoal(g); }
      if (method === "delete") { db.goals = db.goals.filter((x) => x !== g); commit(); return { ok: true }; }
      break;
    }

    case "subscriptions": {
      if (method === "get") return db.subscriptions.filter((s) => s.user_id === uid);
      if (method === "post") {
        const s = { id: ++db.seq, user_id: uid, name: body.name, amount: body.amount,
          billing_cycle: body.billing_cycle || "monthly", next_payment: body.next_payment || null,
          category: body.category || "Other", status: "active" };
        db.subscriptions.push(s); commit(); return s;
      }
      const s = db.subscriptions.find((x) => x.id === rid && x.user_id === uid);
      if (!s) throw new ApiError(404, "Subscription not found");
      if (method === "put") { Object.assign(s, body); commit(); return s; }
      if (method === "delete") { db.subscriptions = db.subscriptions.filter((x) => x !== s); commit(); return { ok: true }; }
      break;
    }

    case "notifications": {
      if (method === "get")
        return db.notifications.filter((n) => n.user_id === uid).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      if (method === "put" && seg[2] === "read") {
        const n = db.notifications.find((x) => x.id === rid && x.user_id === uid);
        if (n) { n.is_read = true; commit(); }
        return { ok: true };
      }
      break;
    }

    case "ai": {
      const cur = byCategory(db, uid, curM, curY);
      const prevD = addMonths(today, -1);
      if (seg[1] === "categorize-expense") return categorize(body.description, body.amount);
      if (seg[1] === "budget-recommendation") {
        const variableCats = ["Food", "Transport", "Shopping", "Entertainment"];
        const variable = sum(Object.entries(cur).filter(([k]) => variableCats.includes(k)).map(([, v]) => v));
        const fixed = (user.rent || 0) + sum(Object.entries(cur).filter(([k]) => !variableCats.includes(k)).map(([, v]) => v));
        const income = Math.max(user.monthly_income, 0);
        const needs = Math.min(fixed + variable * 0.5, income * 0.55);
        const savings = Math.min(Math.max(user.savings_target || 0, income * 0.1), income * 0.35);
        const emergency = round(income * 0.05);
        const wants = Math.max(income - needs - savings - emergency, 0);
        return {
          needs: round(needs), wants: round(wants), savings: round(savings), emergency_fund: emergency,
          explanations: [
            `Needs (${inr(needs)}) is based on your reported fixed costs plus half of your typical variable spending, capped at 55% of income — a common affordability limit.`,
            `Savings (${inr(savings)}) targets your stated goal where realistic, otherwise defaults to at least 10% of income.`,
            `Emergency fund (${inr(emergency)}) reserves 5% of income for unplanned costs.`,
            `Wants (${inr(wants)}) is whatever remains after needs, savings and the emergency fund are covered.`,
            "This is a suggested starting allocation, not a guaranteed outcome — adjust it as your actual spending patterns become clearer.",
          ],
        };
      }
      if (seg[1] === "insights") {
        const budgets = db.budgets.filter((b) => b.user_id === uid && b.month === curM && b.year === curY)
          .map((b) => ({ category: b.category, limit_amount: b.limit_amount, spent: cur[b.category] || 0 }));
        return generateInsights(cur, byCategory(db, uid, prevD.getMonth() + 1, prevD.getFullYear()), budgets);
      }
      if (seg[1] === "chat")
        return { reply: chatReply(body.message, { income: user.monthly_income, total: sum(Object.values(cur)), cats: cur }) };
      if (seg[1] === "predict-expenses") {
        const history: { label: string; total: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const md = addMonths(today, -i);
          const total = monthTotal(db, uid, md.getMonth() + 1, md.getFullYear());
          if (total > 0) history.push({ label: md.toLocaleString("en-US", { month: "short", year: "numeric" }), total: round(total) });
        }
        return { history, prediction_label: addMonths(today, 1).toLocaleString("en-US", { month: "short", year: "numeric" }), ...predictNext(history) };
      }
      break;
    }

    case "analytics": {
      if (seg[1] === "summary") {
        const prev = addMonths(today, -1);
        const cur$ = monthTotal(db, uid, curM, curY);
        const prev$ = monthTotal(db, uid, prev.getMonth() + 1, prev.getFullYear());
        const cats = byCategory(db, uid, curM, curY);
        const types: Record<string, number> = {};
        db.expenses.filter((e) => e.user_id === uid && inMonth(e, curM, curY)).forEach((e) => {
          types[e.expense_type] = (types[e.expense_type] || 0) + e.amount;
        });
        const income = user.monthly_income || 0;
        return {
          total_income: income, total_expenses: cur$,
          average_daily_spending: round(cur$ / today.getDate()),
          savings_rate: round(income ? ((income - cur$) / income) * 100 : 0, 1),
          largest_category: maxKey(cats),
          month_over_month_change: round(prev$ ? ((cur$ - prev$) / prev$) * 100 : 0, 1),
          spending_by_category: cats, spending_by_type: types,
        };
      }
      if (seg[1] === "health-indicators") {
        const budgets = db.budgets.filter((b) => b.user_id === uid && b.month === curM && b.year === curY);
        const within = budgets.filter((b) => enrichBudget(db, uid, b).spent <= b.limit_amount).length;
        const discipline = budgets.length ? (within / budgets.length) * 100 : 100;
        const income = user.monthly_income || 0;
        const rate = income ? ((income - monthTotal(db, uid, curM, curY)) / income) * 100 : 0;
        const goals = db.goals.filter((g) => g.user_id === uid);
        const tgt = sum(goals.map((g) => g.target_amount));
        const goalProgress = goals.length && tgt > 0 ? (sum(goals.map((g) => g.saved_amount)) / tgt) * 100 : 0;
        const totals: number[] = [];
        for (let i = 3; i >= 0; i--) {
          const md = addMonths(today, -i);
          const t = monthTotal(db, uid, md.getMonth() + 1, md.getFullYear());
          if (t > 0) totals.push(t);
        }
        let stability = 100;
        if (totals.length >= 2) {
          const mean = sum(totals) / totals.length;
          const sd = Math.sqrt(sum(totals.map((t) => (t - mean) ** 2)) / totals.length);
          stability = Math.max(0, round(100 - (mean ? sd / mean : 0) * 100, 1));
        }
        return {
          savings_rate: { value: round(rate, 1), explanation: "Calculated as (income - expenses) / income for the current month." },
          budget_discipline: { value: round(discipline, 1), explanation: "Percentage of category budgets that stayed within their limit this month." },
          goal_progress: { value: round(goalProgress, 1), explanation: "Total saved across all goals divided by total target amount." },
          expense_stability: { value: stability, explanation: "Based on the coefficient of variation of your monthly totals over the last few months — lower swings score higher." },
        };
      }
      break;
    }

    case "reports": {
      const report = buildReport(db, user);
      if (seg[1] === "monthly" && seg[2] === "pdf") return reportPdf(report);
      if (seg[1] === "monthly") return report;
      break;
    }
  }
  throw new ApiError(404, "Not found");
}

// Small artificial delay so loading states feel natural.
const call = (method: string, url: string, body?: any, cfg: Cfg = {}) =>
  new Promise<{ data: any }>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve({ data: handle(method, url, body, cfg) });
      } catch (err: any) {
        if (err?.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
          if (!url.startsWith("/api/auth/me")) window.location.href = "/login";
        }
        reject(err);
      }
    }, 120);
  });

export const api = {
  get: <T = any>(url: string, cfg?: Cfg) => call("get", url, undefined, cfg) as Promise<{ data: T }>,
  post: <T = any>(url: string, body?: any, cfg?: Cfg) => call("post", url, body, cfg) as Promise<{ data: T }>,
  put: <T = any>(url: string, body?: any, cfg?: Cfg) => call("put", url, body, cfg) as Promise<{ data: T }>,
  delete: <T = any>(url: string, cfg?: Cfg) => call("delete", url, undefined, cfg) as Promise<{ data: T }>,
};

export default api;
