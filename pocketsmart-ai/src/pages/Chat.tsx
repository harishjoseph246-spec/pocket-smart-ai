import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import api from "../services/api";

interface Message { role: "user" | "assistant"; text: string; }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your PocketSmart AI Assistant. Ask me about your spending — try \"Where did I spend the most this month?\"" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/ai/chat", { message: userMsg });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't process that just now — try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div>
        <h1 className="font-display text-2xl font-semibold text-haze">PocketSmart AI Assistant</h1>
        <p className="mt-1 text-sm text-mist">Answers are grounded in your real transactions.</p>
      </div>

      <div className="glass-card mt-4 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === "user" ? "bg-violet-500/20 text-violet-400" : "bg-electric-500/20 text-electric-400"
              }`}>
                {m.role === "user" ? <UserIcon size={15} /> : <Bot size={15} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-electric-500 text-white" : "bg-white/[0.05] text-haze"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-xs text-mist">PocketSmart AI is thinking…</p>}
          <div ref={endRef} />
        </div>
        <div className="flex items-center gap-2 border-t border-white/[0.06] p-4">
          <input
            className="input-field flex-1"
            placeholder="Ask about your spending…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} disabled={loading} className="btn-primary"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}
