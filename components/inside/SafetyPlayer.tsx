"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pelvicReleaseVideos, toVideoItems } from "@/lib/videoCatalog";
import { useUserStore } from "@/lib/store/useUserStore";

function BreathingPacer() {
  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="text-white/60 text-[10px] font-extrabold tracking-widest uppercase mb-2">
        Exhale on Effort
      </div>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full bg-white/8 border border-white/10" />
        <div className="absolute inset-0 rounded-full bg-[color:var(--pink)]/25 animate-[pacer_10s_ease-in-out_infinite]" />
        <style>{`
          @keyframes pacer {
            0% { transform: scale(0.72); opacity: 0.65; }
            40% { transform: scale(1.05); opacity: 0.9; }
            100% { transform: scale(0.72); opacity: 0.65; }
          }
        `}</style>
      </div>
    </div>
  );
}

function FormGuardToast() {
  return (
    <div className="absolute top-4 right-4 z-20 max-w-[220px]">
      <div className="rounded-2xl border border-white/12 bg-black/45 backdrop-blur-xl px-3 py-2 shadow-soft">
        <div className="text-white text-[12px] font-extrabold">⚠️ Watch for Coning</div>
        <div className="text-white/70 text-[11px] font-semibold mt-1 leading-snug">
          If your belly domes, stop. Reduce the load.
        </div>
      </div>
    </div>
  );
}

export default function SafetyPlayer({
  initialUrl,
  title,
  onClose,
}: {
  initialUrl: string;
  title: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [url, setUrl] = useState(initialUrl);
  const [showPainModal, setShowPainModal] = useState(false);

  const addPainLog = useUserStore((s) => s.addPainLog);

  const decompressionPool = useMemo(() => toVideoItems(pelvicReleaseVideos), []);
  const pickDecompression = () => {
    if (!decompressionPool.length) return initialUrl;
    const idx = Math.floor(Math.random() * decompressionPool.length);
    return decompressionPool[idx].url;
  };

  const dateISO = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const onPain = () => {
    videoRef.current?.pause();
    setShowPainModal(true);
  };

  const doSwap = () => {
    const next = pickDecompression();
    addPainLog({
      ts: new Date().toISOString(),
      dateISO,
      currentVideoUrl: url,
      swappedToUrl: next,
      note: "User reported pain/pulling. Switched to lower-pressure decompression movement.",
    });
    setUrl(next);
    setShowPainModal(false);
    setTimeout(() => videoRef.current?.play().catch(() => {}), 250);
  };

  return (
    <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl overflow-hidden border border-white/12 bg-[#0F0F17] shadow-[0_40px_140px_rgba(0,0,0,0.7)]">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="text-white font-extrabold text-[14px] truncate">{title}</div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <X className="text-white" size={18} />
          </button>
        </div>

        <div className="relative">
          <BreathingPacer />
          <FormGuardToast />

          <video ref={videoRef} src={url} controls playsInline className="w-full aspect-video bg-black" />

          <div className="p-4">
            <button
              onClick={onPain}
              className="w-full h-12 rounded-full border border-red-500/25 bg-red-500/10 text-red-100 font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
            >
              <AlertTriangle size={18} />
              I feel pain / pulling
            </button>

            <div className="mt-3 text-white/50 text-[11px] font-semibold leading-relaxed">
              Pain is data. We stop and switch to a lower-pressure option immediately.
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPainModal && (
          <motion.div
            className="fixed inset-0 z-[190] bg-black/70 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPainModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#0F0F17] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
              initial={{ y: 14, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="text-white font-extrabold text-[18px]">Let’s stop.</div>
              <div className="text-white/70 text-[13px] font-semibold mt-2 leading-relaxed">
                Your tissue isn’t ready for this load. Switching to a{" "}
                <span className="text-white font-extrabold">Decompression</span> move.
              </div>

              <button
                onClick={doSwap}
                className="mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
              >
                Switch Now
              </button>

              <button
                onClick={() => setShowPainModal(false)}
                className="mt-3 w-full h-12 rounded-full bg-white/8 text-white/80 font-extrabold border border-white/10"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
