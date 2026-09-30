import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import api from "../services/api";

export default function Reports() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api.get("/api/reports/monthly").then(({ data }) => setReport(data));
  }, []);

  const downloadPdf = async () => {
    const res = await api.get("/api/reports/monthly/pdf", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `pocketsmart-report.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!report) return <p className="text-sm text-mist">Building your report…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-haze">Monthly Report</h1>
          <p className="mt-1 text-sm text-mist">{report.month_label}</p>
        </div>
        <button onClick={downloadPdf} className="btn-primary"><Download size={16} /> Download PDF</button>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-electric-400">
          <FileText size={18} />
          <span className="text-sm font-semibold uppercase tracking-wide">PocketSmart AI · {report.month_label}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-mist">Income</p>
            <p className="mt-1 font-display text-2xl font-semibold text-haze">₹{report.income.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-mist">Expenses</p>
            <p className="mt-1 font-display text-2xl font-semibold text-haze">₹{report.expenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-mist">Savings</p>
            <p className="mt-1 font-display text-2xl font-semibold text-mint">₹{report.savings.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-mist">Savings Rate</p>
            <p className="mt-1 text-lg font-semibold text-haze">{report.savings_rate}%</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-4">
            <p className="text-xs text-mist">Month-over-Month Change</p>
            <p className="mt-1 text-lg font-semibold text-haze">{report.month_over_month_change}%</p>
          </div>
        </div>
        {report.top_category && (
          <p className="mt-4 text-sm text-mist">
            Top category: <span className="font-medium text-haze">{report.top_category}</span> — ₹{report.top_category_amount.toLocaleString()}
          </p>
        )}
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-haze">AI Insights</h3>
          <ul className="space-y-1.5 text-sm text-mist">
            {report.insights.map((ins: string, i: number) => <li key={i}>• {ins}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
