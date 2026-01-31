"use client";

import React, { useEffect, useRef } from "react";
import { Play } from "lucide-react";

export default function VideoPreviewCircle({
  src,
  onClick,
  label = "Play",
  loopSeconds = 3,
  sizeClass = "w-[164px] h-[164px]",
}: {
  src: string;
  onClick: () => void;
  label?: string;
  loopSeconds?: number; // default 3s
  sizeClass?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    let raf = 0;

    const ensurePlay = () => {
      v.muted = true;
      v.playsInline = true;
      v.loop = false; // we do manual loop for exact 3s window
      v.currentTime = 0;

      v.play().catch(() => {
        // Autoplay may be blocked; we'll still show first frame.
      });
    };

    const onTime = () => {
      // loop exactly loopSeconds
      if (v.currentTime >= loopSeconds) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      raf = requestAnimationFrame(onTime);
    };

    ensurePlay();
    raf = requestAnimationFrame(onTime);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [src, loopSeconds]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "relative rounded-full overflow-hidden",
        "border border-white/12 bg-black/30",
        "shadow-[0_30px_90px_rgba(0,0,0,0.55)]",
        "active:scale-[0.99] transition-transform",
        sizeClass,
      ].join(" ")}
    >
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.10),rgba(0,0,0,0.55))]" />

      {/* centered play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-black/45 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-soft">
          <Play className="text-white" size={22} />
        </div>
      </div>
    </button>
  );
}
