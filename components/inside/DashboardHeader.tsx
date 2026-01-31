"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sun, CloudSun, MoonStar } from "lucide-react";
import CommunityPulse from "@/components/inside/CommunityPulse";
import DefaultAvatar from "@/components/inside/DefaultAvatar";

type Greeting = {
  greeting: string;
  icon: "sun" | "cloud" | "moon";
};

function getGreeting(): Greeting {
  const h = new Date().getHours();
  if (h >= 5 && h <= 11) return { greeting: "Good morning,", icon: "sun" };
  if (h >= 12 && h <= 17) return { greeting: "Good afternoon,", icon: "cloud" };
  return { greeting: "Good evening,", icon: "moon" };
}

const LS_KEY = "diastafix_profile_photo_data_url";

export default function DashboardHeader({
  userName,
  userGoal,
}: {
  userName: string;
  userGoal: string;
}) {
  const { greeting, icon } = useMemo(getGreeting, []);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // load persisted avatar
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LS_KEY);
      if (v) setImageDataUrl(v);
    } catch {}
  }, []);

  const onPick = () => fileRef.current?.click();

  const onFile = async (file?: File | null) => {
    if (!file) return;

    // Keep it light: accept only images, and store as data URL
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      setImageDataUrl(data);
      try {
        window.localStorage.setItem(LS_KEY, data);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-white/60 text-[12px] font-semibold">
          <GreetingIcon icon={icon} />
          <span>{greeting}</span>
        </div>

        <div className="flex items-end gap-1 mt-1">
          <div
            className="text-white text-[30px] sm:text-[34px] leading-[1.05] font-extrabold truncate"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            {userName || "Friend"}
          </div>

          {/* waving hand (breathing-ish) */}
          <div className="text-[24px] mb-[2px] animate-[handBreathe_2.1s_ease-in-out_infinite] select-none">
            👋
          </div>
        </div>

        <CommunityPulse userGoal={userGoal} />
      </div>

      <div className="ml-auto shrink-0">
        <button
          type="button"
          onClick={onPick}
          className="relative w-[46px] h-[46px] rounded-full overflow-hidden"
          aria-label="Profile picture"
          title="Add profile photo"
        >
          <div className="absolute inset-0 rounded-full border border-white/12 bg-black/20" />
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0">
              <DefaultAvatar name={userName} />
            </div>
          )}

          {/* pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[color:var(--pink)] animate-[avatarPulse_1.2s_ease-out_infinite]" />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <style>{`
        @keyframes avatarPulse {
          0% { transform: scale(1); opacity: 0.85; }
          70% { transform: scale(1.45); opacity: 0; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes handBreathe {
          0% { transform: scale(1.0); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}

function GreetingIcon({ icon }: { icon: Greeting["icon"] }) {
  if (icon === "sun") {
    return (
      <span className="relative inline-flex">
        <Sun className="text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.35)]" size={16} />
      </span>
    );
  }

  if (icon === "cloud") {
    return (
      <span className="relative inline-flex">
        <CloudSun className="text-white/70" size={16} />
      </span>
    );
  }

  return (
    <span className="relative inline-flex">
      <MoonStar className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)] animate-[twinkle_1.5s_ease-in-out_infinite]" size={16} />
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </span>
  );
}
