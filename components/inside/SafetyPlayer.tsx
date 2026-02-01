"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
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
  Loader2,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoItem } from "@/lib/videoCatalog";
import { useUserStore } from "@/lib/store/useUserStore";

function BreathingPacer() {
  return (
    <div className="absolute top-[calc(env(safe-area-inset-top)+10px)] left-4 z-20" aria-hidden="true">
      <div className="text-white/60 text-[10px] font-extrabold tracking-widest uppercase mb-2">Exhale on Effort</div>
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
    <div className="absolute top-[calc(env(safe-area-inset-top)+10px)] right-4 z-20 max-w-[240px]" aria-hidden="true">
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
    const isDisabled = (el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true";
    const isHidden =
      el.getAttribute("aria-hidden") === "true" ||
      (el as any).hidden ||
      el.style.display === "none" ||
      el.style.visibility === "hidden";
    return !isDisabled && !isHidden;
  });
}

type RepeatMode = "off" | "all" | "one";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function getBufferedEnd01(v: HTMLVideoElement, duration: number) {
  if (!duration || !Number.isFinite(duration)) return 0;
  const b = v.buffered;
  if (!b || b.length === 0) return 0;

  // choose the furthest buffered end
  let end = 0;
  for (let i = 0; i < b.length; i++) {
    try {
      end = Math.max(end, b.end(i));
    } catch {}
  }
  return clamp01(end / duration);
}

function StatePill({
  isBuffering,
  isPlaying,
}: {
  isBuffering: boolean;
  isPlaying: boolean;
}) {
  const label = isBuffering ? "Buffering" : isPlaying ? "Playing" : "Paused";
  return (
    <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full border border-white/10 bg-white/6">
      {isBuffering ? <Loader2 size={14} className="text-white/70 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-white/25" />}
      <span className="text-white/60 text-[10px] font-extrabold tracking-[0.18em] uppercase">{label}</span>
    </div>
  );
}

function ProgressBar({
  progress01,
  buffered01,
  currentTime,
  duration,
  onSeekTo01,
}: {
  progress01: number;
  buffered01: number;
  currentTime: number;
  duration: number;
  onSeekTo01: (pct01: number) => void;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrub01, setScrub01] = useState(progress01);

  useEffect(() => {
    if (!scrubbing) setScrub01(progress01);
  }, [progress01, scrubbing]);

  const pct = scrubbing ? scrub01 : progress01;

  const computePctFromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return progress01;
    const rect = el.getBoundingClientRect();
    const raw = (clientX - rect.left) / Math.max(1, rect.width);
    return clamp01(raw);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setScrubbing(true);
    const p = computePctFromClientX(e.clientX);
    setScrub01(p);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    const p = computePctFromClientX(e.clientX);
    setScrub01(p);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    const p = computePctFromClientX(e.clientX);
    setScrubbing(false);
    onSeekTo01(p);
  };

  const bubbleTime = scrubbing ? formatTime(scrub01 * (duration || 0)) : null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-white/45 text-[11px] font-semibold">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div
        ref={barRef}
        className="relative mt-2 h-3 rounded-full bg-white/10 overflow-hidden cursor-pointer select-none"
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, Math.floor(duration || 1))}
        aria-valuenow={Math.floor((pct || 0) * (duration || 0))}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!duration) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            onSeekTo01(clamp01(progress01 - 5 / duration));
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            onSeekTo01(clamp01(progress01 + 5 / duration));
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setScrubbing(false)}
      >
        {/* buffered */}
        <div
          className="absolute inset-y-0 left-0 bg-white/12"
          style={{ width: `${buffered01 * 100}%` }}
          aria-hidden="true"
        />

        {/* progress */}
        <div
          className="absolute inset-y-0 left-0 bg-[color:var(--pink)] transition-[width] duration-150"
          style={{ width: `${pct * 100}%` }}
          aria-hidden="true"
        />

        {/* thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${pct * 100}%` }}
          aria-hidden="true"
          animate={{ scale: scrubbing ? 1.08 : 1 }}
          transition={{ duration: 0.12 }}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.45)] border border-black/20 -translate-x-1/2" />
        </motion.div>

        {/* time bubble */}
        <AnimatePresence>
          {bubbleTime && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="absolute -top-10"
              style={{ left: `${pct * 100}%` }}
              aria-hidden="true"
            >
              <div className="px-3 h-8 rounded-full border border-white/12 bg-black/60 backdrop-blur-xl text-white/85 text-[12px] font-extrabold flex items-center -translate-x-1/2">
                {bubbleTime}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

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
  onStartedAfter5s?: () => void;
  onProgressPct?: (pct: number) => void;
}) {
  const dialogId = useId();
  const titleId = `safety-player-title-${dialogId}`;

  const [mounted, setMounted] = useState(false);

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

  // ✅ premium playback state (reliable)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const [showPainModal, setShowPainModal] = useState(false);
  const [showList, setShowList] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered01, setBuffered01] = useState(0);

  const [playbackRate, setPlaybackRate] = useState<0.75 | 1 | 1.25>(1);

  // refs for stable event handlers
  const repeatModeRef = useRef<RepeatMode>("all");
  const indexRef = useRef<number>(0);
  const poolRef = useRef<VideoItem[]>(pool);
  const isPlayingRef = useRef<boolean>(false);
  const wantPlayRef = useRef<boolean>(false);
  const wasPlayingBeforeScrubRef = useRef<boolean>(false);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    poolRef.current = pool;
  }, [pool]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const hasFiredStartedRef = useRef(false);
  const peakPctRef = useRef(0);

  const currentItem = pool[index] || pool[0];
  const url = currentItem?.url || initialUrl;
  const currentTitle = currentItem?.title || title || "Exercise";

  // mount/portal
  useEffect(() => setMounted(true), []);

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

  // Focus management (mostly for desktop)
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

  // ✅ RAF loop (smooth + reliable progress)
  const rafRef = useRef<number | null>(null);

  const stopRAF = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const syncFromVideo = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    const d = Number.isFinite(v.duration) ? v.duration : 0;
    const t = Number.isFinite(v.currentTime) ? v.currentTime : 0;

    // duration & time
    setDuration(d);
    setCurrentTime(t);

    // buffer
    setBuffered01(getBufferedEnd01(v, d));

    // buffering heuristics
    const buffering =
      !v.paused &&
      (v.readyState < 3 || (Number.isFinite(v.playbackRate) && v.playbackRate > 0 && v.seeking));
    setIsBuffering(buffering);

    // play state (fallback if events miss)
    setIsPlaying(!v.paused && !v.ended);

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
  }, [onProgressPct, onStartedAfter5s]);

  const startRAF = useCallback(() => {
    stopRAF();
    const tick = () => {
      syncFromVideo();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRAF, syncFromVideo]);

  // Attach core media listeners ONCE (stable, no dependency weirdness)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => {
      setIsBuffering(false);
      syncFromVideo();
    };

    const onTime = () => {
      // keep in sync even if RAF is off
      syncFromVideo();
    };

    const onDurationChange = () => syncFromVideo();
    const onProgress = () => syncFromVideo();

    const onPlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      startRAF();
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      startRAF();
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      stopRAF();
      syncFromVideo();
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onSeeking = () => setIsSeeking(true);
    const onSeeked = () => {
      setIsSeeking(false);
      syncFromVideo();
    };

    const onEnded = () => {
      stopRAF();
      setIsPlaying(false);
      setIsBuffering(false);

      const rm = repeatModeRef.current;
      const poolNow = poolRef.current;
      const i = indexRef.current;

      if (!v) return;

      if (rm === "one") {
        wantPlayRef.current = true;
        v.currentTime = 0;
        v.play().catch(() => {});
        return;
      }

      if (i < poolNow.length - 1) {
        wantPlayRef.current = true;
        setIndex((cur) => Math.min(poolNow.length - 1, cur + 1));
        return;
      }

      if (rm === "all" && poolNow.length > 1) {
        wantPlayRef.current = true;
        setIndex(0);
        return;
      }

      wantPlayRef.current = false;
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("progress", onProgress);
    v.addEventListener("play", onPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("seeking", onSeeking);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("ended", onEnded);

    // initial sync
    syncFromVideo();

    return () => {
      stopRAF();
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("durationchange", onDurationChange);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("seeking", onSeeking);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("ended", onEnded);
    };
  }, [startRAF, stopRAF, syncFromVideo]);

  // Load new video on url change, keep play intent
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    setIsBuffering(true);
    setCurrentTime(0);
    setDuration(0);
    setBuffered01(0);

    // apply playback rate every time
    v.playbackRate = playbackRate;

    try {
      // force reload
      v.load();
    } catch {}

    // If user intended to play (or was playing), resume automatically
    requestAnimationFrame(() => {
      if (!v) return;
      if (!wantPlayRef.current) {
        syncFromVideo();
        setIsBuffering(false);
        return;
      }
      v.play()
        .then(() => {
          setIsPlaying(true);
          startRAF();
        })
        .catch(() => {
          setIsPlaying(false);
          setIsBuffering(false);
        });
    });
  }, [url, playbackRate, startRAF, syncFromVideo]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    // ✅ optimistic UI (immediate millionaire feel)
    if (v.paused || v.ended) {
      wantPlayRef.current = true;
      setIsPlaying(true);
      setIsBuffering(true);

      v.play()
        .then(() => {
          setIsBuffering(false);
          setIsPlaying(true);
          startRAF();
        })
        .catch(() => {
          wantPlayRef.current = false;
          setIsBuffering(false);
          setIsPlaying(false);
        });

      return;
    }

    // pause
    wantPlayRef.current = false;
    try {
      v.pause();
    } catch {}
    setIsPlaying(false);
    setIsBuffering(false);
    stopRAF();
  };

  const seekTo01 = (pct01: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;

    const t = Math.max(0, Math.min(duration, pct01 * duration));
    v.currentTime = t;
    syncFromVideo();
  };

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Math.max(0, (v.currentTime || 0) + delta);
    v.currentTime = t;
    syncFromVideo();
  };

  const prev = () => {
    if (pool.length <= 1) return;
    wantPlayRef.current = isPlayingRef.current; // keep intent
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    if (pool.length <= 1) return;
    wantPlayRef.current = isPlayingRef.current; // keep intent
    setIndex((i) => Math.min(pool.length - 1, i + 1));
  };

  const cycleRepeat = () => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  };

  const cycleSpeed = () => {
    const nextRate: 0.75 | 1 | 1.25 = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 0.75 : 1;
    setPlaybackRate(nextRate);
    const v = videoRef.current;
    if (v) v.playbackRate = nextRate;
  };

  const onPain = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    wantPlayRef.current = false;
    setShowPainModal(true);
  };

  const doSwap = () => {
    const candidates = pool.filter((x) => x.url !== url);
    const pick = candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] || pool[0];

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
    wantPlayRef.current = true;
    setIndex(nextIndex >= 0 ? nextIndex : 0);
    setShowPainModal(false);

    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  const progress01 = duration ? clamp01(currentTime / duration) : 0;

  const nextUpIndex = useMemo(() => {
    if (pool.length <= 1) return null;
    if (repeatMode === "one") return null;
    if (index < pool.length - 1) return index + 1;
    if (repeatMode === "all") return 0;
    return null;
  }, [pool.length, repeatMode, index]);

  const nextUp = useMemo(() => {
    if (nextUpIndex === null) return null;
    const item = pool[nextUpIndex];
    if (!item) return null;
    return { index: nextUpIndex, title: item.title || "Next exercise" };
  }, [nextUpIndex, pool]);

  // NOTE: if user scrubs, pause then resume if it was playing
  const onSeekTo01 = (pct01: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;

    // (optional premium: pause while scrubbing—handled by ProgressBar, but we support resume)
    if (isSeeking) return;
    v.currentTime = Math.max(0, Math.min(duration, pct01 * duration));
    syncFromVideo();
  };

  if (!mounted) return null;

  const ui = (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm">
      <div
        className="w-full h-[100dvh] sm:h-auto sm:max-w-4xl sm:mx-auto sm:my-6 sm:rounded-3xl overflow-hidden border border-white/12 bg-[#0F0F17] shadow-[0_40px_140px_rgba(0,0,0,0.7)] flex flex-col"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
      >
        {/* Top bar */}
        <div className="px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] sm:p-4 flex items-center justify-between border-b border-white/10">
          <div className="min-w-0">
            <div id={titleId} className="text-white font-extrabold text-[14px] truncate">
              {currentTitle}
            </div>
            <div className="text-white/45 text-[11px] font-semibold mt-0.5 flex items-center gap-2">
              <span>{pool.length > 1 ? `Move ${index + 1} of ${pool.length}` : "Today’s routine"}</span>
              <StatePill isBuffering={isBuffering || isSeeking} isPlaying={isPlaying} />
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
        <div className="relative bg-black flex-1">
          <BreathingPacer />
          <FormGuardToast />

          {/* Optional premium overlay when paused */}
          <AnimatePresence>
            {!isPlaying && !showList && !showPainModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-xl px-5 py-4 shadow-soft">
                  <div className="text-white font-extrabold text-[13px] text-center">
                    {isBuffering ? "Loading…" : "Tap Play to continue"}
                  </div>
                  <div className="mt-1 text-white/60 text-[11px] font-semibold text-center">
                    Slow + controlled • exhale on effort • stop if pain
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <video
            ref={videoRef}
            src={url}
            playsInline
            preload="metadata"
            className="w-full h-full bg-black object-contain"
            // keep state even if browser misses events:
            onClick={() => {
              // optional: tapping video toggles play (very Apple-like)
              togglePlay();
            }}
          />
        </div>

        {/* Bottom dock */}
        <div
          className={[
            "border-t border-white/10 bg-[#0F0F17]",
            "px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)]",
            "sm:p-4",
          ].join(" ")}
        >
          {/* Up next */}
          {nextUp && (
            <button
              type="button"
              onClick={() => {
                wantPlayRef.current = isPlayingRef.current;
                setIndex(nextUp.index);
              }}
              className={[
                "w-full rounded-2xl border border-white/12 bg-white/6 backdrop-blur-xl",
                "px-4 py-3 text-left",
                "active:scale-[0.99] transition-transform",
              ].join(" ")}
              aria-label={`Up next: ${nextUp.title}. Tap to skip.`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white/55 text-[10px] font-extrabold tracking-[0.22em] uppercase">Up Next</div>
                  <div className="mt-1 text-white font-extrabold text-[13px] truncate">{nextUp.title}</div>
                  <div className="mt-1 text-white/45 text-[11px] font-semibold">Tap to skip</div>
                </div>

                <div className="shrink-0 w-10 h-10 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                  <ArrowRight className="text-white/75" size={18} />
                </div>
              </div>
            </button>
          )}

          {/* ✅ premium progress bar (smooth + scrub + buffered) */}
          <ProgressBar
            progress01={progress01}
            buffered01={buffered01}
            currentTime={currentTime}
            duration={duration}
            onSeekTo01={(p01) => {
              // pause while scrubbing, resume if needed
              const v = videoRef.current;
              if (!v || !duration) return;

              wasPlayingBeforeScrubRef.current = !v.paused;
              try {
                v.pause();
              } catch {}
              wantPlayRef.current = wasPlayingBeforeScrubRef.current;

              seekTo01(p01);

              if (wasPlayingBeforeScrubRef.current) {
                requestAnimationFrame(() => {
                  v.play()
                    .then(() => {
                      setIsPlaying(true);
                      setIsBuffering(false);
                      startRAF();
                    })
                    .catch(() => {
                      setIsPlaying(false);
                      setIsBuffering(false);
                    });
                });
              }
            }}
          />

          {/* transport */}
          <div className="mt-3 flex items-center justify-between gap-3">
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

              <motion.button
                type="button"
                onClick={togglePlay}
                whileTap={{ scale: 0.985 }}
                className="w-12 h-12 rounded-2xl bg-[color:var(--pink)] text-white flex items-center justify-center shadow-[0_18px_60px_rgba(230,84,115,0.22)]"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPlaying ? (
                    <motion.span
                      key="pause"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.12 }}
                    >
                      <Pause size={20} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="play"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.12 }}
                    >
                      <Play size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

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

            <div className="flex items-center gap-2">
              {/* speed control (premium) */}
              <button
                type="button"
                onClick={cycleSpeed}
                className="px-3 h-10 rounded-2xl bg-white/8 border border-white/10 text-white/85 flex items-center gap-2"
                aria-label="Playback speed"
                title="Playback speed"
              >
                <Gauge size={16} />
                <span className="text-[11px] font-extrabold tracking-[0.18em] uppercase">{playbackRate}x</span>
              </button>

              {/* repeat */}
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
          </div>

          {/* pain button */}
          <button
            onClick={onPain}
            type="button"
            className="mt-3 w-full h-12 rounded-full border border-red-500/25 bg-red-500/10 text-red-100 font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
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
            className="fixed inset-0 z-[100000] bg-black/70 flex items-end justify-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowList(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={[
                "w-full sm:max-w-md rounded-t-3xl border border-white/12 bg-[#0F0F17] p-4",
                "shadow-[0_40px_120px_rgba(0,0,0,0.75)]",
              ].join(" ")}
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

              <div className="mt-3 max-h-[55dvh] sm:max-h-[360px] overflow-y-auto no-scrollbar pr-1 pb-[calc(env(safe-area-inset-bottom)+8px)]">
                {pool.map((v, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={`${v.url}-${i}`}
                      type="button"
                      onClick={() => {
                        wantPlayRef.current = isPlayingRef.current; // keep intent
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
                        {active ? "Now playing" : "Tap to play"}
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
            className="fixed inset-0 z-[100001] bg-black/70 flex items-center justify-center p-6"
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

  return createPortal(ui, document.body);
}
