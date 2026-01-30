"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ButterflyBackground from "@/components/ButterflyBackground";
import DashboardNav from "@/components/inside/DashboardNav";
import BridgeProtocol from "@/components/inside/BridgeProtocol";
import { useUserStore } from "@/lib/store/useUserStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isPremium = useUserStore((s) => s.isPremium);
  const hasSeenBridge = useUserStore((s) => s.hasSeenBridge);
  const setHasSeenBridge = useUserStore((s) => s.setHasSeenBridge);

  useEffect(() => {
    if (!isPremium) router.replace("/");
  }, [isPremium, router]);

  if (!isPremium) return null;

  return (
    <div className="min-h-screen bg-[color:var(--navy)] clinical-noise relative overflow-hidden">
      <ButterflyBackground />

      <div className="relative z-10 mx-auto max-w-md px-5 pt-7 pb-[92px]">
        {children}
      </div>

      <DashboardNav />

      {!hasSeenBridge && (
        <BridgeProtocol
          onDone={() => {
            setHasSeenBridge(true);
          }}
        />
      )}
    </div>
  );
}
