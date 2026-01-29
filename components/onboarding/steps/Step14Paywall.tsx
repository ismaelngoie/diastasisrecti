"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Star, X } from "lucide-react";
import { useUserStore } from "@/lib/store/useUserStore";

const REVIEWS = [
  "Sara closed her 3-finger gap in 9 weeks…",
  "I stopped coning in 12 days. I cried.",
  "My back pain finally relaxed by week 2.",
  "I can lift my baby without bracing fear.",
  "5 minutes a day actually worked."
];

function ReviewTicker() {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % REVIEWS.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full overflow-hidden h-9 relative">
      {REVIEWS.map((r, idx) => (
        <div
          key={idx}
          className="absolute inset-0 flex items-center justify-center text-center text-white/85 text-[13px] font-semibold transition-all duration-500"
          style={{ opacity: idx === i ? 1 : 0, transform: `translateY(${(idx - i) * 12}px)` }}
        >
          “{r}”
        </div>
      ))}
    </div>
  );
}

function CheckoutModal({ onClose, onPay }: { onClose: () => void; onPay: (email: string) => void }) {
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#0F0F17] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="text-white font-extrabold text-[18px]">Secure Checkout</div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="text-white" size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-extrabold text-[16px]">$24.99 / month</div>
          <div className="text-white/60 text-[12px] font-semibold mt-1">Cancel anytime • 100% Money-back guarantee</div>
        </div>

        <div className="mt-4">
          <label className="text-white/70 text-[12px] font-semibold">Email (for your plan)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="mt-2 w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white font-semibold outline-none focus:border-[color:var(--pink)]"
          />
        </div>

        <button
          onClick={() => onPay(email)}
          className="mt-5 w-full h-12 rounded-full bg-gradient-to-r from-[color:var(--pink)] to-[#D959E8] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
        >
          Pay $24.99
        </button>

        <div className="mt-3 text-center text-white/40 text-[11px] font-semibold">
          (Demo checkout UI — connects to Stripe next)
        </div>
      </div>
    </div>
  );
}

export default function Step14Paywall() {
  const router = useRouter();
  const name = useUserStore((s) => s.name) || "Your";
  const setPremium = useUserStore((s) => s.setPremium);
  const setJoinDate = useUserStore((s) => s.setJoinDate);

  const [showCheckout, setShowCheckout] = useState(false);

  const stars = useMemo(() => Array.from({ length: 5 }), []);

  const handlePay = (email: string) => {
    // Demo unlock (replace with Stripe later)
    setPremium(true);
    setJoinDate(new Date().toISOString());
    router.replace("/dashboard");
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/paywall_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-12 pb-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
            <Lock className="text-white/80" size={16} />
            <span className="text-white/80 text-[12px] font-extrabold tracking-wide uppercase">Plan Locked</span>
          </div>

          <h1 className="mt-6 text-white font-extrabold text-[34px] leading-[1.04]" style={{ fontFamily: "var(--font-lora)" }}>
            {name}, your Core Repair plan is ready.
          </h1>

          <p className="text-white/70 mt-3 text-[14px] font-semibold">
            Join 10,200+ women who closed their gap.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-yellow-400">
              {stars.map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <div className="text-white/70 text-[12px] font-semibold">4.9 average rating</div>
          </div>

          <div className="mt-5">
            <ReviewTicker />
          </div>
        </div>

        <div className="mt-auto">
          <div className="rounded-3xl border border-white/14 bg-white/10 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.55)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-extrabold text-[18px]">$24.99 / month</div>
                <div className="text-white/60 text-[12px] font-semibold mt-1">
                  100% Money-back Guarantee • Cancel anytime
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--pink)]/15 border border-[color:var(--pink)]/25 flex items-center justify-center">
                <Lock className="text-[color:var(--pink)]" size={20} />
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="mt-4 w-full h-[56px] rounded-full bg-[color:var(--pink)] text-white font-extrabold text-[17px] shadow-[0_18px_60px_rgba(230,84,115,0.30)] active:scale-[0.985] transition-transform"
            >
              Start 7-Day Repair Plan
            </button>

            <div className="mt-3 text-center text-white/45 text-[11px] font-semibold">
              Cancel anytime • Immediate access • Safe progression
            </div>
          </div>
        </div>
      </div>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} onPay={handlePay} />}
    </div>
  );
}
