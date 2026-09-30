import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../services/api";

export default function Predictions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("/api/ai/predict-expenses").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-mist">Building your forecast…</p>;

  const chartData = (data?.history || []).map((h: any) => ({ month: h.label, actual: h.total }));
  if (data?.predicted) {
    chartData.push({ month: data.prediction_label, predicted: data.predicted });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">Expense Prediction</h1>
        <p className="mt-1 text-sm text-mist">{data?.note}</p>
      </div>

      {(!data?.history || data.history.length === 0) ? (
        <div className="glass-card p-8 text-center text-sm text-mist">
          Not enough expense history to predict yet — add a few months of expenses first.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5">
              <p className="text-xs text-mist">Estimated {data.prediction_label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-haze">₹{data.predicted.toLocaleString()}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-mist">Lower bound</p>
              <p className="mt-1 font-display text-2xl font-semibold text-mint">₹{data.lower_bound.toLocaleString()}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-mist">Upper bound</p>
              <p className="mt-1 font-display text-2xl font-semibold text-coral">₹{data.upper_bound.toLocaleString()}</p>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-haze">Historical vs Predicted Spending</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#8C94AB" fontSize={12} />
                <YAxis stroke="#8C94AB" fontSize={12} />
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#E7EAF3" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8C94AB" }} />
                <Line type="monotone" dataKey="actual" stroke="#4F6BFF" strokeWidth={2} name="Historical" />
                <Line type="monotone" dataKey="predicted" stroke="#A78BFA" strokeWidth={2} strokeDasharray="6 4" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      <p className="text-xs text-mist/70">Prediction based on historical spending patterns. Not a guarantee.</p>
    </div>
  );
}
