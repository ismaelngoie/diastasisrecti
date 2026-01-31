"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Library, MessageCircle, Activity } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/dashboard/plan", label: "Plan", icon: CalendarDays },
  { href: "/dashboard/gap", label: "Check-in", icon: Activity },
  { href: "/dashboard/coach", label: "Coach", icon: MessageCircle },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[120] border-t border-white/10 bg-[#0F0F17]/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-md px-4 h-[72px] flex items-center justify-between">
        {tabs.map((t) => {
          const active = pathname === t.href || (t.href !== "/dashboard" && pathname.startsWith(t.href));
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                "flex flex-col items-center justify-center gap-1 w-[64px] py-2 rounded-2xl transition-all",
                active ? "bg-white/8" : "opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              <Icon size={18} className={active ? "text-[color:var(--pink)]" : "text-white"} />
              <div className={["text-[11px] font-extrabold", active ? "text-white" : "text-white/70"].join(" ")}>
                {t.label}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
