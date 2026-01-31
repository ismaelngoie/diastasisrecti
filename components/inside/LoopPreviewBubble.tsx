"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

export default function LoopPreviewBubble({
  src,
  onClick,
  size = "ring",
  loopSeconds = 3,
  className = "",
  ariaLabel = "Play today’s routine",
}: {
  src: string;
  onClick?: () => void;
  size?: "ring" | "card";
  loopSeconds?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [canAutoPlay, setCanAutoPlay] = useState(true);

  const dims =
    size === "card"
      ? "w-[140px] h-[140px]"
      : "w-[86px] h-[86px]"; // fits inside ProgressRing center

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let alive = true;

    const tryPlay = async () => {
      try {
        v.muted = true;
        v.playsInline = true as any;
        v.currentTime = 0;
        await v.play();
        if (!alive) return;
        setCanAutoPlay(true);
      } catch {
        if (!alive) return;
        setCanAutoPlay(false);
      }
    };

    const onTime = () => {
      // Loop only the first N seconds (premium “preview” feel)
      if (!v) return;
      if (v.currentTime >= loopSeconds) {
        // Small offset avoids some browsers flashing black on exact 0
        v.currentTime = 0.03;
      }
    };

    v.addEventListener("timeupdate", onTime);
    tryPlay();

    return () => {
      alive = false;
      v.removeEventListener("timeupdate", onTime);
    };
  }, [src, loopSeconds]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "relative rounded-full overflow-hidden border border-white/12 bg-black/30",
        "active:scale-[0.99] transition-transform",
        dims,
        className,
      ].join(" ")}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />

      {/* soft gloss */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-black/35 pointer-events-none" />

      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={[
            "w-12 h-12 rounded-full",
            "bg-black/55 border border-white/20 backdrop-blur-xl",
            "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
            "flex items-center justify-center",
          ].join(" ")}
        >
          <Play className="text-white" size={18} />
        </div>
      </div>

      {!canAutoPlay && (
        <div className="absolute bottom-2 left-2 right-2 text-white/70 text-[10px] font-semibold">
          Tap to preview
        </div>
      )}
    </button>
  );
}
