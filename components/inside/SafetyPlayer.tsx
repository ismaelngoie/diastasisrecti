"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  X,
  AlertTriangle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Volume2,
  VolumeX,
  Gauge,
  List,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoItem } from "@/lib/videoCatalog";
import { useUserStore } from "@/lib/store/useUserStore";

type RepeatMode = "off" | "one" | "all";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getFocusable(root: HTMLElement | null) {
  if (!root) return [];
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
  playlist?: VideoItem[];
  dateISO: string;
  onClose: () => void;
  onStartedAfter5s?: () => void;
}) {
  const dialogId = useId();
  const titleId = `player-title-${dialogId}`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const hasFiredStartedRef = useRef(false);
  const autoplayNextRef = useRef(false);

  const addPainLog = useUserStore((s) => s.addPainLog);

  const pool = useMemo<VideoItem[]>(() => {
    const list = Array.isArray(playlist) ? playlist : [];
    if (!list.length) return [{ url: initialUrl, title: title || "Exercise" }];
    return list;
  }, [playlist, initialUrl, title]);

  const initialIndex = useMemo(() => {
    const idx = pool.findIndex((x) => x.url === initialUrl);
    return idx >= 0 ? idx : 0;
  }, [pool, initialUrl]);

  const [idx, setIdx] = useState(initialIndex);

  const current = pool[idx] || pool[0];
  const currentTitle = current?.title || title || "Exercise";
  const src = current?.url || initialUrl;

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [t, setT] = useState(0);
  const [bufferedPct, setBufferedPct] = useState(0);

  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);

  const [showList, setShowList] = useState(false);

  const [showPainModal, setShowPainModal] = useState(false);
  const swapBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIdx(initialIndex);
    setShowList(false);
    setShowPainModal(false);
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

  // Trap focus
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

  const handleClose = useCallback(() => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(false);
    onClose();
  }, [onClose]);

  // ESC + keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showPainModal) setShowPainModal(false);
        else handleClose();
        return;
      }

      // Basic shortcuts (only when modal is open)
      if (!videoRef.current) return;

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekBy(5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekBy(-5);
      } else if (e.key === "n") {
        e.preventDefault();
        next(true);
      } else if (e.key === "p") {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClose, showPainModal, idx, repeatMode]);

  // Apply src changes + autoplay next when appropriate
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    try {
      v.load();
    } catch {}

    // Restore rate/mute
    v.muted = muted;
    v.playbackRate = rate;

    if (autoplayNextRef.current) {
      autoplayNextRef.current = false;
      requestAnimationFrame(() => {
        v.play().catch(() => {});
      });
    } else {
      // If user was already playing, keep flow feeling continuous
      if (isPlaying) {
        requestAnimationFrame(() => {
          v.play().catch(() => {});
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Wire video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => {
      setT(v.currentTime || 0);

      // 🔒 silent milestone (do not show UI)
      if (!hasFiredStartedRef.current && v.currentTime >= 5) {
        hasFiredStartedRef.current = true;
        onStartedAfter5s?.();
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onProgress = () => {
      try {
        if (!v.duration) return;
        const b = v.buffered;
        if (!b || b.length === 0) return;
        const end = b.end(b.length - 1);
        setBufferedPct(clamp(end / v.duration, 0, 1));
      } catch {}
    };

    const onEnded = () => {
      if (repeatMode === "one") {
        autoplayNextRef.current = true;
        v.currentTime = 0;
        v.play().catch(() => {});
        return;
      }

      if (idx < pool.length - 1) {
        autoplayNextRef.current = true;
        setIdx((x) => x + 1);
        return;
      }

      if (repeatMode === "all" && pool.length > 1) {
        autoplayNextRef.current = true;
        setIdx(0);
        return;
      }

      setIsPlaying(false);
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("progress", onProgress);
    v.addEventListener("ended", onEnded);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("ended", onEnded);
    };
  }, [idx, pool.length, repeatMode, onStartedAfter5s]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekTo = useCallback((sec: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = clamp(sec, 0, v.duration || 0);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v) return;
      seekTo((v.currentTime || 0) + delta);
    },
    [seekTo]
  );

  const next = useCallback(
    (userAction = false) => {
      if (pool.length <= 1) return;
      if (idx < pool.length - 1) {
        autoplayNextRef.current = true;
        setIdx(idx + 1);
        return;
      }
      if (repeatMode === "all") {
        autoplayNextRef.current = true;
        setIdx(0);
        return;
      }
      if (userAction) {
        // on manual next at end, just restart last
        seekTo(0);
        autoplayNextRef.current = true;
        videoRef.current?.play().catch(() => {});
      }
    },
    [idx, pool.length, repeatMode, seekTo]
  );

  const prev = useCallback(() => {
    if (pool.length <= 1) return;

    const v = videoRef.current;
    if (v && v.currentTime > 2) {
      seekTo(0);
      return;
    }

    if (idx > 0) {
      autoplayNextRef.current = true;
      setIdx(idx - 1);
      return;
    }

    if (repeatMode === "all") {
      autoplayNextRef.current = true;
      setIdx(pool.length - 1);
    } else {
      seekTo(0);
    }
  }, [idx, pool.length, repeatMode, seekTo]);

  const toggleRepeat = () => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    const nextVal = !muted;
    setMuted(nextVal);
    if (v) v.muted = nextVal;
  };

  const cycleSpeed = () => {
    const v = videoRef.current;
    const options = [0.75, 1, 1.25, 1.5];
    const next = options[(options.indexOf(rate) + 1) % options.length];
    setRate(next);
    if (v) v.playbackRate = next;
  };

  const openFullscreen = () => {
    const v = videoRef.current as any;
    try {
      if (v?.requestFullscreen) v.requestFullscreen();
      else if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS
    } catch {}
  };

  const onPain = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPainModal(true);
  };

  useEffect(() => {
    if (showPainModal) {
      window.setTimeout(() => swapBtnRef.current?.focus(), 0);
    }
  }, [showPainModal]);

  const pickSwap = useCallback(() => {
    if (pool.length <= 1) return idx;
    let next = idx;
    for (let tries = 0; tries < 10; tries++) {
      const r = Math.floor(Math.random() * pool.length);
      if (r !== idx) {
        next = r;
        break;
      }
    }
    return next;
  }, [pool.length, idx]);

  const doSwap = () => {
    const nextIndex = pickSwap();
    const nextItem = pool[nextIndex];

    try {
      addPainLog({
        ts: new Date().toISOString(),
        dateISO,
        currentVideoUrl: src,
        swappedToUrl: nextItem?.url || src,
        note:
          "User reported discomfort. Switched to a different option from today's set.",
      });
    } catch {}

    autoplayNextRef.current = true;
    setIdx(nextIndex);
    setShowPainModal(false);
  };

  const pct = duration ? clamp(t / duration, 0, 1) : 0;

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
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="min-w-0">
            <div id={titleId} className="text-white font-extrabold text-[14px] truncate">
              {currentTitle}
            </div>
            <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
              Move {idx + 1} of {pool.length} • Auto-plays through the full routine
            </div>
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

        {/* Video stage */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={src}
            playsInline
            preload="metadata"
            className="w-full aspect-video bg-black"
            controls={false}
          />

          {/* Big center play/pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <div className="w-16 h-16 rounded-full bg-black/45 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-soft">
              {isPlaying ? (
                <Pause className="text-white" size={22} />
              ) : (
                <Play className="text-white" size={22} />
              )}
            </div>
          </button>

          {/* progress bar overlay */}
          <div className="absolute left-0 right-0 bottom-0 p-3">
            <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md px-3 py-2">
              <div className="flex items-center justify-between text-white/70 text-[11px] font-semibold">
                <span>{fmtTime(t)}</span>
                <span>{fmtTime(duration)}</span>
              </div>

              <div className="mt-2 relative h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-white/15"
                  style={{ width: `${bufferedPct * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-[color:var(--pink)]"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(0, duration || 0)}
                step={0.1}
                value={t}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="mt-2 w-full accent-[color:var(--pink)]"
                aria-label="Seek"
              />
            </div>
          </div>
        </div>

        {/* Control dock */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prev}
              className="w-11 h-11 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center active:scale-[0.98] transition-transform"
              aria-label="Previous"
            >
              <SkipBack className="text-white/85" size={18} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex-1 h-11 rounded-2xl bg-[color:var(--pink)] text-white font-extrabold shadow-[0_18px_60px_rgba(230,84,115,0.22)] active:scale-[0.985] transition-transform inline-flex items-center justify-center gap-2"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={() => next(true)}
              className="w-11 h-11 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center active:scale-[0.98] transition-transform"
              aria-label="Next"
            >
              <SkipForward className="text-white/85" size={18} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={toggleRepeat}
              className="h-11 rounded-2xl bg-white/6 border border-white/10 text-white/85 font-extrabold flex items-center justify-center gap-2"
              aria-label="Repeat mode"
              title="Repeat"
            >
              <Repeat size={16} />
              <span className="text-[11px]">
                {repeatMode === "off" ? "Off" : repeatMode === "one" ? "1" : "All"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="h-11 rounded-2xl bg-white/6 border border-white/10 text-white/85 font-extrabold flex items-center justify-center"
              aria-label={muted ? "Unmute" : "Mute"}
              title="Mute"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              onClick={cycleSpeed}
              className="h-11 rounded-2xl bg-white/6 border border-white/10 text-white/85 font-extrabold flex items-center justify-center gap-2"
              aria-label="Playback speed"
              title="Speed"
            >
              <Gauge size={16} />
              <span className="text-[11px]">{rate}×</span>
            </button>

            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="h-11 rounded-2xl bg-white/6 border border-white/10 text-white/85 font-extrabold flex items-center justify-center"
              aria-label="Toggle playlist"
              title="Up Next"
            >
              <List size={16} />
            </button>

            <button
              type="button"
              onClick={openFullscreen}
              className="h-11 rounded-2xl bg-white/6 border border-white/10 text-white/85 font-extrabold flex items-center justify-center"
              aria-label="Fullscreen"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onPain}
              type="button"
              className="flex-1 h-11 rounded-2xl border border-red-500/25 bg-red-500/10 text-red-100 font-extrabold inline-flex items-center justify-center gap-2 active:scale-[0.985] transition-transform"
            >
              <AlertTriangle size={16} />
              I feel pain / pulling
            </button>
          </div>

          <div className="mt-3 text-white/45 text-[11px] font-semibold leading-relaxed">
            Stop if anything feels sharp or wrong. You can switch to a different option anytime.
          </div>
        </div>

        {/* Up Next */}
        <AnimatePresence initial={false}>
          {showList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="p-4">
                <div className="text-white font-extrabold text-[14px]">Up Next</div>
                <div className="mt-3 flex flex-col gap-2">
                  {pool.map((v, i) => {
                    const active = i === idx;
                    return (
                      <button
                        type="button"
                        key={`${v.url}-${i}`}
                        onClick={() => {
                          autoplayNextRef.current = true;
                          setIdx(i);
                        }}
                        className={[
                          "w-full text-left rounded-2xl border px-4 py-3 flex items-center gap-3",
                          active
                            ? "border-[color:var(--pink)]/25 bg-[color:var(--pink)]/10"
                            : "border-white/10 bg-black/20",
                        ].join(" ")}
                      >
                        <div className="w-8 h-8 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center shrink-0">
                          <div className="text-white/85 font-extrabold text-[12px] tabular-nums">
                            {i + 1}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white/90 text-[13px] font-extrabold truncate">
                            {v.title}
                          </div>
                          <div className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">
                            Tap to jump
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/6 flex items-center justify-center shrink-0">
                          {active ? (
                            <Pause className="text-white/75" size={16} />
                          ) : (
                            <Play className="text-white/75" size={16} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pain modal */}
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
              <div className="text-white font-extrabold text-[18px]">Let’s switch.</div>
              <div className="text-white/70 text-[13px] font-semibold mt-2 leading-relaxed">
                We’ll move you to a different option from today’s routine.
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
