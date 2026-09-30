# 💰 PocketSmart AI (Frontend Only)

Smart budget & recommendation assistant — React + TypeScript + Vite + Tailwind.

The FastAPI backend has been removed. `src/services/api.ts` now acts as an
in-browser API: all data is stored in `localStorage`, and the "AI" features
(categorization, insights, chat, budget recommendation, prediction, monthly
report + PDF) run locally from your own data.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Demo login:** `demo@pocketsmart.ai` / `demo1234`
(or register a new account and go through onboarding)

## Build

```bash
npm run build
npm run preview
```

## Notes

- Data persists per browser. To reset, clear site data (or delete the
  `pocketsmart_db_v1` and `pocketsmart_token` keys in localStorage).
- Passwords are stored in plain text in localStorage — this is a demo setup,
  not for real financial data.

## Structure

```
src/
├── pages/        # Landing, Login, Register, Onboarding, Dashboard, Expenses,
│                 #   Budgets, AIInsights, Predictions, Goals, Subscriptions,
│                 #   Analytics, Chat, Reports, Notifications, Settings
├── components/   # Sidebar, StatCard, BudgetProgress, ProtectedRoute
├── layouts/      # DashboardLayout, AuthLayout
├── contexts/     # AuthContext
├── services/     # api.ts — local mock backend
└── types/
```
