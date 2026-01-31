"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import {
  X,
  AlertTriangle,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  Repeat,
  Repeat1,
  ListMusic,
  Rewind,
  FastForward,
  ArrowRight,
} from "lucide-react";
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
        <div className="text-white text-[12px] font-extrabold">⚠️ Watch for doming</div>
        <div className="text-white/70 text-[11px] font-semibold mt-1 leading-snug">
          If your abdomen domes, slow down or reduce the load.
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
      (el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true";
    const isHidden =
      el.getAttribute("aria-hidden") === "true" ||
      (el as any).hidden ||
      el.style.display === "none" ||
      el.style.visibility === "hidden";
    return !isDisabled && !isHidden;
  });
}

type RepeatMode = "off" | "all" | "one";

export default function SafetyPlayer({
  initialUrl,
  title,
  playlist,
  dateISO,
  onClose,
  onStartedAfter5s,
  onProgressPct,
}: {
  initialUrl: string;
  title: string;
  playlist?: VideoItem[];
  dateISO: string;
  onClose: () => void;
  onStartedAfter5s?: () => void; // internal milestone (hidden from UI)
  onProgressPct?: (pct: number) => void; // 0..100 for ring/graph animation
}) {
  const dialogId = useId();
  const titleId = `safety-player-title-${dialogId}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const lastFocusRef = useRef<HTMLElement | null>(null);

  const addPainLog = useUserStore((s: any) => s.addPainLog);

  const pool = useMemo<VideoItem[]>(() => {
    const list = Array.isArray(playlist) ? playlist : [];
    if (!list.length) return [{ url: initialUrl, title }];
    return list;
  }, [playlist, initialUrl, title]);

  const initialIndex = useMemo(() => {
    const i = pool.findIndex((x) => x.url === initialUrl);
    return i >= 0 ? i : 0;
  }, [pool, initialUrl]);

  const [index, setIndex] = useState(initialIndex);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPainModal, setShowPainModal] = useState(false);
  const [showList, setShowList] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hasFiredStartedRef = useRef(false);
  const peakPctRef = useRef(0);

  const currentItem = pool[index] || pool[0];
  const url = currentItem?.url || initialUrl;
  const currentTitle = currentItem?.title || title || "Exercise";

  // Keep index synced if initialUrl changes
  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

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

  const handleClose = useCallback(() => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(false);
    setShowList(false);
    onClose();
  }, [onClose]);

  // ESC handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showPainModal) {
        setShowPainModal(false);
        return;
      }
      if (showList) {
        setShowList(false);
        return;
      }
      handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPainModal, showList, handleClose]);

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

  // Load new video on index change (and keep play state)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    try {
      v.load();
    } catch {}

    setCurrentTime(0);

    requestAnimationFrame(() => {
      if (!v) return;
      v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    });
  }, [url]);

  // Track playback state + timeline
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    const onTime = () => {
      const t = v.currentTime || 0;
      setCurrentTime(t);

      // drive ring/graph fill (never decreases)
      const pct = hasFiredStartedRef.current ? 100 : Math.min(100, (t / 5) * 100);
      peakPctRef.current = Math.max(peakPctRef.current, pct);
      onProgressPct?.(peakPctRef.current);

      // internal “counted” milestone (hidden)
      if (!hasFiredStartedRef.current && t >= 5) {
        hasFiredStartedRef.current = true;
        peakPctRef.current = 100;
        onProgressPct?.(100);
        onStartedAfter5s?.();
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      if (repeatMode === "one") {
        v.currentTime = 0;
        v.play().catch(() => {});
        return;
      }

      if (index < pool.length - 1) {
        setIndex((i) => Math.min(pool.length - 1, i + 1));
        return;
      }

      if (repeatMode === "all" && pool.length > 1) {
        setIndex(0);
        return;
      }

      setIsPlaying(false);
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [onStartedAfter5s, onProgressPct, repeatMode, index, pool.length]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seekToPct = (pct01: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(duration, pct01 * duration));
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime + delta);
  };

  const prev = () => {
    if (pool.length <= 1) return;
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    if (pool.length <= 1) return;
    setIndex((i) => Math.min(pool.length - 1, i + 1));
  };

  const cycleRepeat = () => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  };

  const onPain = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(true);
  };

  const doSwap = () => {
    const candidates = pool.filter((x) => x.url !== url);
    const pick =
      candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || pool[0];

    try {
      addPainLog?.({
        ts: new Date().toISOString(),
        dateISO,
        currentVideoUrl: url,
        swappedToUrl: pick.url,
        note: "User reported discomfort. Switched to a different option from today's set.",
      });
    } catch {}

    const nextIndex = pool.findIndex((x) => x.url === pick.url);
    setIndex(nextIndex >= 0 ? nextIndex : 0);
    setShowPainModal(false);

    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  const progress01 = duration ? Math.min(1, currentTime / duration) : 0;

  // ✅ Mini “Up Next” logic
  const nextUpIndex = useMemo(() => {
    if (pool.length <= 1) return null;
    if (repeatMode === "one") return null; // no need to show Up Next if repeating one
    if (index < pool.length - 1) return index + 1;
    if (repeatMode === "all") return 0;
    return null; // repeat off and end reached
  }, [pool.length, repeatMode, index]);

  const nextUp = useMemo(() => {
    if (nextUpIndex === null) return null;
    const item = pool[nextUpIndex];
    if (!item) return null;
    return { index: nextUpIndex, title: item.title || "Next exercise" };
  }, [nextUpIndex, pool]);

  return (
    <div className="fixed inset-0 z-[180] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
        className="w-full max-w-md rounded-3xl overflow-hidden border border-white/12 bg-[#0F0F17] shadow-[0_40px_140px_rgba(0,0,0,0.7)]"
      >
        {/* Top bar */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="min-w-0">
            <div id={titleId} className="text-white font-extrabold text-[14px] truncate">
              {currentTitle}
            </div>
            <div className="text-white/45 text-[11px] font-semibold mt-0.5">
              {pool.length > 1 ? `Move ${index + 1} of ${pool.length}` : "Today’s routine"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pool.length > 1 && (
              <button
                type="button"
                onClick={() => setShowList((v) => !v)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                aria-label="Open playlist"
              >
                <ListMusic className="text-white" size={18} />
              </button>
            )}

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
        </div>

        {/* Video stage */}
        <div className="relative bg-black">
          <BreathingPacer />
          <FormGuardToast />

          <video ref={videoRef} src={url} playsInline preload="metadata" className="w-full aspect-video bg-black" />

          {/* Premium overlay controls */}
          <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* progress bar */}
            <div
              className="h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const pct = (e.clientX - rect.left) / Math.max(1, rect.width);
                seekToPct(pct);
              }}
              role="button"
              aria-label="Seek"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const pct = Math.min(1, Math.max(0, progress01));
                  seekToPct(pct);
                }
              }}
            >
              <div
                className="h-full bg-[color:var(--pink)] transition-all duration-200"
                style={{ width: `${progress01 * 100}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => skip(-10)}
                  className="w-10 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center justify-center"
                  aria-label="Back 10 seconds"
                >
                  <Rewind size={18} />
                </button>

                <button
                  type="button"
                  onClick={prev}
                  disabled={pool.length <= 1 || index === 0}
                  className={[
                    "w-10 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center justify-center",
                    pool.length <= 1 || index === 0 ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                  aria-label="Previous"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl bg-[color:var(--pink)] text-white flex items-center justify-center shadow-[0_18px_60px_rgba(230,84,115,0.22)] active:scale-[0.985] transition-transform"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  type="button"
                  onClick={next}
                  disabled={pool.length <= 1 || index === pool.length - 1}
                  className={[
                    "w-10 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center justify-center",
                    pool.length <= 1 || index === pool.length - 1 ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                  aria-label="Next"
                >
                  <SkipForward size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => skip(10)}
                  className="w-10 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center justify-center"
                  aria-label="Forward 10 seconds"
                >
                  <FastForward size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={cycleRepeat}
                className="px-3 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center gap-2"
                aria-label="Repeat mode"
                title={repeatMode === "off" ? "Repeat off" : repeatMode === "all" ? "Repeat all" : "Repeat one"}
              >
                {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
                <span className="text-[11px] font-extrabold tracking-[0.18em] uppercase">{repeatMode}</span>
              </button>
            </div>

            {/* ✅ Mini Up Next card */}
            {nextUp && (
              <button
                type="button"
                onClick={() => setIndex(nextUp.index)}
                className={[
                  "mt-3 w-full rounded-2xl border border-white/12 bg-white/6 backdrop-blur-xl",
                  "px-4 py-3 text-left",
                  "active:scale-[0.99] transition-transform",
                ].join(" ")}
                aria-label={`Up next: ${nextUp.title}. Tap to skip.`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white/55 text-[10px] font-extrabold tracking-[0.22em] uppercase">
                      Up Next
                    </div>
                    <div className="mt-1 text-white font-extrabold text-[13px] truncate">
                      {nextUp.title}
                    </div>
                    <div className="mt-1 text-white/45 text-[11px] font-semibold">
                      Tap to skip
                    </div>
                  </div>

                  <div className="shrink-0 w-10 h-10 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                    <ArrowRight className="text-white/75" size={18} />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0F0F17]">
          <button
            onClick={onPain}
            type="button"
            className="w-full h-12 rounded-full border border-red-500/25 bg-red-500/10 text-red-100 font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
          >
            <AlertTriangle size={18} />
            I feel pain / pulling
          </button>

          <div className="mt-3 text-white/50 text-[11px] font-semibold leading-relaxed">
            If anything feels sharp, painful, or wrong — stop and switch or rest.
          </div>
        </div>
      </div>

      {/* Playlist drawer */}
      <AnimatePresence>
        {showList && pool.length > 1 && (
          <motion.div
            className="fixed inset-0 z-[190] bg-black/70 flex items-end justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowList(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl border border-white/12 bg-[#0F0F17] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-white font-extrabold">Today’s playlist</div>
                <button
                  type="button"
                  onClick={() => setShowList(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  aria-label="Close playlist"
                >
                  <X className="text-white" size={18} />
                </button>
              </div>

              <div className="mt-3 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                {pool.map((v, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={`${v.url}-${i}`}
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setShowList(false);
                      }}
                      className={[
                        "w-full text-left rounded-2xl border px-4 py-3 mt-2",
                        active ? "border-[color:var(--pink)]/30 bg-[color:var(--pink)]/10" : "border-white/10 bg-black/20",
                      ].join(" ")}
                    >
                      <div className="text-white/90 text-[13px] font-extrabold truncate">
                        {i + 1}. {v.title || "Exercise"}
                      </div>
                      <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                        Tap to play
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pain modal */}
      <AnimatePresence>
        {showPainModal && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-6"
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
