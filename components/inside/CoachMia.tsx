"use client";

import React, { useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";

type Msg = { role: "assistant" | "user"; text: string };

export default function CoachMia() {
  const user = useUserStore();
  const p = useMemo(() => getTodaysPrescription(user), [user]);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: `Hi ${user.name || "there"} — I’m Coach Mia. Tell me what you felt today (pressure, pulling, doming, discomfort).`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = useMemo(() => {
    const base: string[] = [];
    if (p.dayNumber === 1) {
      base.push("What should I focus on to avoid doming today?");
    }
    base.push("I noticed doming — what should I change right now?");
    base.push("How should I breathe during effort to protect my midline?");
    base.push("Which moves should I avoid this week to keep pressure controlled?");
    return base.slice(0, 4);
  }, [p.dayNumber]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMsgs((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: {
            name: user.name,
            age: user.age,
            fingerGap: user.fingerGap,
            tissueDepth: user.tissueDepth,
            symptoms: user.symptoms,
            postpartumTimeline: user.postpartumTimeline,
            navelAssessment: user.navelAssessment,
            highRisk: user.highRisk,
            herniaSafe: user.herniaSafe,
            today: { dayNumber: p.dayNumber, phaseName: p.phaseName },
          },
        }),
      });

      const data = await res.json();
      const reply =
        (data?.reply as string) ||
        "I’m here. Tell me what you felt (pressure, doming, pulling, discomfort) and on which exercise.";
      setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "I couldn’t reach the coaching server. If you’re on static export, you’ll need an external Mia endpoint.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-extrabold text-[16px]">Coach Mia</div>
            <div className="text-white/55 text-[12px] font-semibold mt-1">
              Midline guidance • Pressure-first • Safe progressions
            </div>
          </div>
          <Sparkles className="text-[color:var(--pink)]" />
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="px-3 py-2 rounded-2xl border border-white/10 bg-black/20 text-white/80 text-[12px] font-extrabold"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/12 bg-white/6 backdrop-blur-xl shadow-soft p-5">
        <div className="max-h-[360px] overflow-y-auto no-scrollbar pr-1">
          {msgs.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div key={i} className={["mb-3 flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
                <div
                  className={[
                    "max-w-[86%] px-4 py-3 rounded-2xl text-[13px] font-semibold leading-relaxed",
                    isUser
                      ? "bg-[color:var(--pink)] text-white rounded-br-none"
                      : "bg-black/20 border border-white/10 text-white/85 rounded-bl-none",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {loading && <div className="text-white/60 text-[12px] font-semibold">Mia is thinking…</div>}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about doming, pressure, pulling, breathing…"
            className="flex-1 h-12 rounded-2xl bg-black/25 border border-white/10 px-4 text-white font-semibold outline-none focus:border-[color:var(--pink)]"
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button
            onClick={() => send(input)}
            className="w-12 h-12 rounded-2xl bg-[color:var(--pink)] text-white flex items-center justify-center active:scale-[0.985] transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
