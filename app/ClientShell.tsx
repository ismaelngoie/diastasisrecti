"use client";

import React from "react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 h-full overflow-hidden">
      {/* Desktop ambient background (behind the app surface) */}
      <div className="absolute inset-0 bg-[color:var(--navy)]" />
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[780px] h-[780px] rounded-full bg-[color:var(--pink)]/10 blur-3xl" />
        <div className="absolute -bottom-48 right-1/4 w-[860px] h-[860px] rounded-full bg-white/7 blur-3xl" />
        <div className="absolute inset-0 opacity-60 clinical-noise" />
      </div>

      <div className="relative w-full h-dvh flex flex-col min-h-0">
        <div
          className="
            flex-1 min-h-0 w-full
            overflow-y-auto overscroll-contain
            [-webkit-overflow-scrolling:touch]
            no-scrollbar
            pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
            pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]
          "
        >
          {/* Center + premium surface on desktop, untouched on mobile */}
          <div className="w-full min-h-full lg:flex lg:justify-center lg:py-10 lg:px-10">
            <div
              className="
                w-full
                lg:max-w-6xl
                lg:min-h-[calc(100dvh-80px)]
                lg:rounded-[36px]
                lg:border lg:border-white/10
                lg:bg-white/[0.03]
                lg:backdrop-blur-xl
                lg:shadow-[0_60px_180px_rgba(0,0,0,0.70)]
                lg:overflow-hidden
              "
            >
              {/* This creates the positioning context so your page backgrounds stay inside the surface */}
              <div className="relative w-full min-h-full">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
