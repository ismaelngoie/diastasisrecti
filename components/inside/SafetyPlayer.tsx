"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoItem } from "@/lib/videoCatalog";
import { useUserStore } from "@/lib/store/useUserStore";

function BreathingPacer() {
  return (
    <div className="absolute top-4 left-4 z-20" aria-hidden="true">
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
    <div className="absolute top-4 right-4 z-20 max-w-[220px]" aria-hidden="true">
      <div className="rounded-2xl border border-white/12 bg-black/45 backdrop-blur-xl px-3 py-2 shadow-soft">
        <div className="text-white text-[12px] font-extrabold">⚠️ Watch for Doming</div>
        <div className="text-white/70 text-[11px] font-semibold mt-1 leading-snug">
          If your abdomen domes, stop. Reduce the load.
        </div>
      </div>
    </div>
  );
}

function getFocusable(root: HTMLElement | null) {
  if (!root) return [];
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, video, [tabindex]:not([tabindex="-1"])'
    )
  );

  return nodes.filter((el) => {
    const isDisabled =
      (el as HTMLButtonElement).disabled ||
      el.getAttribute("aria-disabled") === "true";
    const isHidden =
      el.getAttribute("aria-hidden") === "true" ||
      (el as any).hidden ||
      el.style.display === "none" ||
      el.style.visibility === "hidden";
    return !isDisabled && !isHidden;
  });
}

export default function SafetyPlayer({
  initialUrl,
  title,
  playlist,
  dateISO,
  onClose,
  onStartedAfter5s,
}: {
  initialUrl: string;
  title: string;
  playlist?: VideoItem[]; // for safer swaps + correct title
  dateISO: string; // local YYYY-MM-DD
  onClose: () => void;
  onStartedAfter5s?: () => void; // fires once after 5 seconds of playback
}) {
  const dialogId = useId();
  const titleId = `safety-player-title-${dialogId}`;
  const descId = `safety-player-desc-${dialogId}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const swapBtnRef = useRef<HTMLButtonElement | null>(null);

  const lastFocusRef = useRef<HTMLElement | null>(null);
  const autoplayNextRef = useRef(false);

  const hasFiredStartedRef = useRef(false);

  const [url, setUrl] = useState(initialUrl);
  const [showPainModal, setShowPainModal] = useState(false);

  const addPainLog = useUserStore((s) => s.addPainLog);

  const pool = useMemo<VideoItem[]>(() => {
    const list = Array.isArray(playlist) ? playlist : [];
    // fallback to just the current url if no playlist provided
    if (!list.length) return [{ url: initialUrl, title }];
    return list;
  }, [playlist, initialUrl, title]);

  const currentTitle = useMemo(() => {
    const hit = pool.find((x) => x.url === url);
    return hit?.title || title || "Exercise";
  }, [pool, url, title]);

  const pickSwap = useCallback(
    (avoidUrl?: string) => {
      if (!pool.length) return initialUrl;
      if (pool.length === 1) return pool[0].url;

      const candidates = pool.filter((v) => v.url !== avoidUrl);
      const list = candidates.length ? candidates : pool;
      const idx = Math.floor(Math.random() * list.length);
      return list[idx]?.url || initialUrl;
    },
    [pool, initialUrl]
  );

  const handleClose = useCallback(() => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    setUrl(initialUrl);
    setShowPainModal(false);
    // do NOT reset hasFiredStartedRef here; we only want 1 fire per open player session
    // parent de-dupes by date anyway.
  }, [initialUrl]);

  // Lock background scroll while open
  useEffect(() => {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  // Focus management
  useEffect(() => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    return () => {
      try {
        lastFocusRef.current?.focus?.();
      } catch {}
    };
  }, []);

  // ESC handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showPainModal) {
        setShowPainModal(false);
        return;
      }
      handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPainModal, handleClose]);

  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const focusable = getFocusable(dialogRef.current);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  };

  useEffect(() => {
    if (showPainModal) {
      window.setTimeout(() => swapBtnRef.current?.focus(), 0);
    }
  }, [showPainModal]);

  // Autoplay next after swap
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    try {
      v.load();
    } catch {}

    if (autoplayNextRef.current) {
      autoplayNextRef.current = false;
      requestAnimationFrame(() => {
        v.play().catch(() => {});
      });
    }
  }, [url]);

  // ✅ Fire completion after 5 seconds of playback
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      if (hasFiredStartedRef.current) return;
      if (v.currentTime >= 5) {
        hasFiredStartedRef.current = true;
        onStartedAfter5s?.();
      }
    };

    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [onStartedAfter5s]);

  const onPain = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(true);
  };

  const doSwap = () => {
    const next = pickSwap(url);

    try {
      addPainLog({
        ts: new Date().toISOString(),
        dateISO,
        currentVideoUrl: url,
        swappedToUrl: next,
        note:
          "User reported discomfort. Switched to a different lower-load option from today's set.",
      });
    } catch {}

    autoplayNextRef.current = true;
    setUrl(next);
    setShowPainModal(false);
  };

  return (
    <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
        className="w-full max-w-md rounded-3xl overflow-hidden border border-white/12 bg-[#0F0F17] shadow-[0_40px_140px_rgba(0,0,0,0.7)]"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div id={titleId} className="text-white font-extrabold text-[14px] truncate">
            {currentTitle}
          </div>

          <button
            ref={closeBtnRef}
            onClick={handleClose}
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            aria-label="Close player"
          >
            <X className="text-white" size={18} />
          </button>
        </div>

        <div className="relative">
          <BreathingPacer />
          <FormGuardToast />

          <video
            ref={videoRef}
            src={url}
            controls
            playsInline
            preload="metadata"
            className="w-full aspect-video bg-black"
          />

          <div className="p-4">
            <p id={descId} className="sr-only">
              Video player with safety controls. Use the pain button if you feel
              discomfort to switch to a different option.
            </p>

            <button
              onClick={onPain}
              type="button"
              className="w-full h-12 rounded-full border border-red-500/25 bg-red-500/10 text-red-100 font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
            >
              <AlertTriangle size={18} />
              I feel pain / pulling
            </button>

            <div className="mt-3 text-white/50 text-[11px] font-semibold leading-relaxed">
              If anything feels sharp, painful, or wrong—stop and switch. Safety first.
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
              role="dialog"
              aria-modal="true"
              aria-label="Discomfort detected"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/12 bg-[#0F0F17] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
              initial={{ y: 14, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="text-white font-extrabold text-[18px]">Let’s stop.</div>
              <div className="text-white/70 text-[13px] font-semibold mt-2 leading-relaxed">
                Switching you to a different option from today’s routine.
              </div>

              <button
                ref={swapBtnRef}
                onClick={doSwap}
                type="button"
                className="mt-5 w-full h-12 rounded-full bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.25)] active:scale-[0.985] transition-transform"
              >
                Switch Now
              </button>

              <button
                onClick={() => setShowPainModal(false)}
                type="button"
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
