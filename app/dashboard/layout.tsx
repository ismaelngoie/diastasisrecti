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
  const joinDate = useUserStore((s) => s.joinDate);
  const setJoinDate = useUserStore((s) => s.setJoinDate);

  const hasSeenBridge = useUserStore((s) => s.hasSeenBridge);
  const setHasSeenBridge = useUserStore((s) => s.setHasSeenBridge);

  useEffect(() => {
    if (!isPremium) router.replace("/");
  }, [isPremium, router]);

  // ✅ Ensure cycle math is stable (start the 16-day loop when they first enter)
  useEffect(() => {
    if (!isPremium) return;
    if (!joinDate) setJoinDate(new Date().toISOString());
  }, [isPremium, joinDate, setJoinDate]);

  if (!isPremium) return null;

  return (
    <div className="min-h-screen bg-[color:var(--navy)] clinical-noise relative overflow-hidden">
      <ButterflyBackground />

      {/* 
        ✅ FIX:
        - Mobile stays max-w-md (phone feel)
        - Desktop removes the width cap so your 960px grids can actually activate
        - Desktop also removes layout padding (your pages already have desktop padding)
      */}
      <div
        className="
          relative z-10 mx-auto w-full max-w-md
          px-5 pt-7 pb-[92px]
          lg:mx-0 lg:max-w-none
          lg:px-0 lg:pt-0 lg:pb-[112px]
        "
      >
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
