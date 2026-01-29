"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type ToastTone = "info" | "success" | "warning" | "danger";

export function Toast({
  show,
  message,
  tone = "info",
  onClose
}: {
  show: boolean;
  message: string;
  tone?: ToastTone;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [show, onClose]);

  const toneStyles: Record<ToastTone, string> = {
    info: "bg-white/10 border-white/15 text-white",
    success: "bg-[rgba(51,179,115,0.15)] border-[rgba(51,179,115,0.35)] text-white",
    warning: "bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.35)] text-white",
    danger: "bg-[rgba(239,68,68,0.18)] border-[rgba(239,68,68,0.35)] text-white"
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-4 left-0 right-0 z-[80] px-4"
        >
          <div
            className={[
              "mx-auto max-w-md w-full rounded-2xl border backdrop-blur-xl shadow-soft",
              "px-4 py-3 text-sm font-semibold",
              toneStyles[tone]
            ].join(" ")}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
