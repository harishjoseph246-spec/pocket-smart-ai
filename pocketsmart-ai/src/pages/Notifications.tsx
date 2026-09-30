import { useEffect, useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import api from "../services/api";
import type { Notification } from "../types";

const iconMap: Record<string, any> = { warning: AlertTriangle, success: CheckCircle, info: Info };
const toneMap: Record<string, string> = {
  warning: "border-amber/30 bg-amber/10 text-amber",
  success: "border-mint/30 bg-mint/10 text-mint",
  info: "border-electric-500/30 bg-electric-500/10 text-electric-400",
};

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notification[]>("/api/notifications").then(({ data }) => setItems(data)).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    await api.put(`/api/notifications/${id}/read`);
    setItems((items) => items.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">Notifications</h1>
        <p className="mt-1 text-sm text-mist">Budget alerts, milestones, and reminders.</p>
      </div>

      {loading ? (
        <p className="text-sm text-mist">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-2 p-10 text-center">
          <Bell size={24} className="text-mist" />
          <p className="text-sm text-mist">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = iconMap[n.type] || Info;
            return (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                   className={`glass-card flex cursor-pointer items-start gap-3 p-4 ${n.is_read ? "opacity-60" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneMap[n.type] || toneMap.info}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-haze">{n.title}</p>
                  <p className="mt-0.5 text-sm text-mist">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
