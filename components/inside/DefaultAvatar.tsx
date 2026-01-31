"use client";

import React, { useMemo } from "react";

function initialsFromName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
}

export default function DefaultAvatar({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const initials = useMemo(() => initialsFromName(name), [name]);

  return (
    <div
      className={[
        "w-full h-full rounded-full flex items-center justify-center",
        "bg-gradient-to-br from-white/10 via-white/5 to-black/40",
        "border border-white/10",
        className,
      ].join(" ")}
    >
      <div className="text-white/80 font-extrabold text-[14px]">{initials}</div>
    </div>
  );
}
