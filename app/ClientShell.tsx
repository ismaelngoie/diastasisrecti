"use client";

import React from "react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 h-full overflow-hidden">
      <div className="w-full h-dvh flex flex-col min-h-0">
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
          {children}
        </div>
      </div>
    </div>
  );
}
