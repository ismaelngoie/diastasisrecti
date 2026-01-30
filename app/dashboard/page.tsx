"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  Play,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Sparkles,
  Activity,
  Clock,
  Dumbbell,
  Info,
  CalendarDays,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUserStore } from "@/lib/store/useUserStore";
import { getTodaysPrescription } from "@/lib/protocolEngine";
import SafetyPlayer from "@/components/inside/SafetyPlayer";

// --- Types & Helpers ---

type TrackLabel = {
  title: string;
  subtitle: string;
};

function formatLocalDate(isoYYYYMMDD: string) {
  const d = new Date(`${isoYYYYMMDD}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function trackLabel(track: string): TrackLabel {
  switch (track) {
    case "drySeal":
      return { title: "Dry Seal Session", subtitle: "Pelvic floor + leakage support" };
    case "release":
      return { title: "Pelvic Release", subtitle: "Down-train tension + restore control" };
    default:
      return { title: "Core Repair", subtitle: "Midline tension + deep core reconnection" };
  }
}

function pressureBadge(pressureLabel?: string) {
  const label = (pressureLabel || "").toLowerCase();
  if (label.includes("low")) return { ring: "ring-emerald-400/30", bg: "bg-emerald-500/10", text: "text-emerald-100", icon: "text-emerald-400" };
  if (label.includes("medium")) return { ring: "ring-[color:var(--pink)]/40", bg: "bg-[color:var(--pink)]/10", text: "text-white", icon: "text-[color:var(--pink)]" };
  if (label.includes("high")) return { ring: "ring-amber-500/40", bg: "bg-amber-500/10", text: "text-amber-100", icon: "text-amber-400" };
  return { ring: "ring-white/10", bg: "bg-white/5", text: "text-white/60", icon: "text-white/40" };
}

// --- High-End UI Components ---

function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "relative overflow-hidden rounded-[32px] border border-white/10 bg-[#121212]/60 backdrop-blur-2xl shadow-2xl",
        "transition-all duration-500 hover:border-white/20",
        onClick ? "cursor-pointer active:scale-[0.99]" : "",
        className,
      ].join(" ")}
    >
      {/* Subtle Noise Texture Overlay (Optional) */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none opacity-[0.03] mix-blend-overlay" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full bg-white/5 border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase">{label}</div>
        <Icon size={16} className="text-white/20" />
      </div>
      <div>
        <div className="text-white text-2xl font-lora font-medium">{value}</div>
        {sub && <div className="text-white/40 text-xs font-medium mt-1">{sub}</div>}
      </div>
    </GlassCard>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-[color:var(--pink)] shadow-[0_0_15px_rgba(230,84,115,0.6)]"
      />
    </div>
  );
}

// --- Main Dashboard ---

export default function DashboardTodayPage() {
  const user = useUserStore();
  const [showWhy, setShowWhy] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [playerTitle, setPlayerTitle] = useState<string>("");

  const { setHabitDone, habitsByDate: habits, addWorkoutCompletion, startDrySeal, setDrySealDayDone, workoutCompletions: completions } = useUserStore();

  const p = useMemo(() => getTodaysPrescription(user), [user]);
  const todaysCompletion = useMemo(() => (completions || []).find((c) => c.dateISO === p.dateISO) || null, [completions, p.dateISO]);
  const isComplete = !!todaysCompletion;

  const noCrunch = (user.fingerGap || 0) > 2;
  const dayHabits = habits[p.dateISO] || {};
  const safeName = (user.name || "friend").trim();
  const headerDate = useMemo(() => formatLocalDate(p.dateISO), [p.dateISO]);
  const label = useMemo(() => trackLabel(p.track), [p.track]);
  const pressureTone = useMemo(() => pressureBadge(p.pressureLabel), [p.pressureLabel]);

  const habitItems = useMemo(
    () => [
      { id: "log_roll" as const, text: "Log roll out of bed" },
      { id: "exhale_before_lift" as const, text: "Exhale on lifts" },
    ],
    []
  );

  const habitsDoneCount = useMemo(() => habitItems.reduce((acc, h) => acc + (dayHabits[h.id] ? 1 : 0), 0), [dayHabits, habitItems]);
  const habitsPct = useMemo(() => Math.round((habitsDoneCount / (habitItems.length || 1)) * 100), [habitsDoneCount, habitItems.length]);

  const startSession = (videoIndex = 0) => {
    if (p.track === "drySeal") startDrySeal();
    const v = p.videos[videoIndex];
    if (v) {
      setPlayerUrl(v.url);
      setPlayerTitle(v.title);
    }
  };

  const handleCompleteDay = () => {
    if (isComplete) return;
    addWorkoutCompletion({
      dateISO: p.dateISO,
      track: p.track,
      dayNumber: p.dayNumber,
      completedAtISO: new Date().toISOString(),
    });
    if (p.track === "drySeal") setDrySealDayDone(p.dayNumber, true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } },
  };

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[color:var(--pink)] opacity-[0.07] blur-[120px] rounded-full pointer-events-none z-[-1]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500 opacity-[0.05] blur-[120px] rounded-full pointer-events-none z-[-1]" />

      {/* --- Header Section --- */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">
                {headerDate}
             </div>
             {isComplete && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 size={10} /> Completed
                </div>
             )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-lora font-medium tracking-tight">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{safeName}</span>
          </h1>
          <p className="mt-2 text-lg text-white/50 font-light max-w-xl">
            Today is <strong className="text-white font-medium">Day {p.dayNumber}</strong> of your {label.title.toLowerCase()}.
          </p>
        </div>

        {/* Global Stats / Quick Glance */}
        <div className="flex gap-3">
            <div className={`px-4 py-3 rounded-2xl border ${pressureTone.ring} ${pressureTone.bg} flex items-center gap-3`}>
                <Activity size={18} className={pressureTone.icon} />
                <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Pressure</div>
                    <div className={`text-sm font-bold ${pressureTone.text}`}>{p.pressureLabel}</div>
                </div>
            </div>
            {noCrunch && (
                <div className="px-4 py-3 rounded-2xl border border-red-500/20 bg-red-500/10 flex items-center gap-3">
                    <Ban size={18} className="text-red-300" />
                    <div>
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Restriction</div>
                        <div className="text-sm font-bold text-red-100">No Crunches</div>
                    </div>
                </div>
            )}
        </div>
      </motion.div>

      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN (8/12) - The Workout */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Hero Workout Card */}
          <motion.div variants={itemVariants} className="group relative">
             <GlassCard className="p-0 overflow-hidden min-h-[400px] flex flex-col">
                {/* Image/Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--pink)]/20 via-black/80 to-black z-0" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay z-0" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-10">
                   <div className="flex justify-between items-start">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                            <Sparkles size={12} className="text-[color:var(--pink)]" />
                            <span className="text-[11px] font-bold tracking-widest text-white uppercase">{p.phaseName}</span>
                        </div>
                   </div>

                   <div>
                       <h2 className="text-3xl md:text-5xl font-lora text-white font-medium mb-3 leading-[1.1]">
                          {label.title}
                       </h2>
                       <p className="text-white/70 text-lg md:text-xl font-light max-w-lg mb-8">
                          {label.subtitle}. Focus on your breath and form.
                       </p>

                       <div className="flex flex-wrap items-center gap-4">
                           <button
                             onClick={() => startSession(0)}
                             className="group/btn h-14 pl-6 pr-8 rounded-full bg-white text-black font-bold text-base hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                           >
                             <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                <Play size={14} fill="currentColor" className="ml-0.5" />
                             </div>
                             Start Session
                           </button>

                           <div className="flex items-center gap-6 px-6 h-14 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-white/50" />
                                    <span className="text-white font-medium">{p.minutes}m</span>
                                </div>
                                <div className="w-px h-4 bg-white/10" />
                                <div className="flex items-center gap-2">
                                    <Dumbbell size={16} className="text-white/50" />
                                    <span className="text-white font-medium">{p.videos.length} Exercises</span>
                                </div>
                           </div>
                       </div>
                   </div>
                </div>
             </GlassCard>
          </motion.div>

          {/* Exercise Playlist & Why */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Exercise List */}
             <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-lora text-xl">Routine</h3>
                    <span className="text-xs font-bold tracking-widest text-white/30 uppercase">{p.videos.length} Steps</span>
                </div>
                <div className="space-y-3">
                    {p.videos.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => startSession(idx)}
                          className="w-full group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                        >
                           <div className="shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[color:var(--pink)] group-hover:shadow-[0_0_20px_rgba(230,84,115,0.4)] transition-all">
                               <Play size={14} fill="currentColor" />
                           </div>
                           <div className="min-w-0 flex-1">
                               <div className="text-white/90 font-bold text-sm truncate">{v.title}</div>
                               <div className="text-white/40 text-xs mt-0.5">Video {idx + 1}</div>
                           </div>
                           <div className="text-white/20 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                               PLAY
                           </div>
                        </button>
                    ))}
                </div>
             </GlassCard>

             {/* Why This Matters (Interactive) */}
             <GlassCard className="p-6 bg-gradient-to-b from-white/5 to-transparent">
                 <div className="flex items-center gap-3 mb-4 text-[color:var(--pink)]">
                     <Info size={20} />
                     <span className="text-xs font-bold tracking-widest uppercase">The Science</span>
                 </div>
                 <h3 className="text-white font-lora text-xl mb-3">Why this matters</h3>
                 <p className={`text-white/60 text-sm leading-relaxed ${showWhy ? '' : 'line-clamp-4'}`}>
                     {p.why}
                 </p>
                 {p.why.length > 150 && (
                     <button 
                        onClick={() => setShowWhy(!showWhy)}
                        className="mt-4 flex items-center gap-2 text-white/40 text-xs font-bold uppercase hover:text-white transition-colors"
                     >
                         {showWhy ? "Read Less" : "Read More"} <ChevronDown size={14} className={showWhy ? "rotate-180" : ""} />
                     </button>
                 )}
             </GlassCard>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (4/12) - Stats & Habits */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <StatBox icon={CalendarDays} label="Day" value={`${p.dayNumber}`} sub="Current" />
              <StatBox icon={Clock} label="Duration" value={`${p.minutes}`} sub="Minutes" />
          </motion.div>

          {/* Habits Card */}
          <motion.div variants={itemVariants}>
              <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                      <div className="text-white font-lora text-xl">Daily Habits</div>
                      <div className="text-white/40 text-xs font-mono">{habitsPct}%</div>
                  </div>
                  
                  <div className="mb-6">
                      <ProgressBar percent={habitsPct} />
                  </div>

                  <div className="space-y-3">
                      {habitItems.map((h) => {
                          const done = !!dayHabits[h.id];
                          return (
                              <div
                                key={h.id}
                                onClick={() => setHabitDone(p.dateISO, h.id, !done)}
                                className={`
                                    cursor-pointer group relative p-4 rounded-2xl border transition-all duration-300
                                    ${done 
                                        ? "bg-[color:var(--pink)]/10 border-[color:var(--pink)]/30" 
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }
                                `}
                              >
                                  <div className="flex items-start gap-3 relative z-10">
                                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${done ? "bg-[color:var(--pink)] border-[color:var(--pink)]" : "border-white/20"}`}>
                                          {done && <CheckCircle2 size={12} className="text-white" />}
                                      </div>
                                      <div>
                                          <div className={`text-sm font-medium transition-colors ${done ? "text-white" : "text-white/70"}`}>
                                              {h.text}
                                          </div>
                                          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider font-bold">
                                              {done ? "Completed" : "Tap to mark"}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </GlassCard>
          </motion.div>

          {/* Completion Action */}
          <motion.div variants={itemVariants} className="mt-auto">
             <button
                disabled={isComplete}
                onClick={handleCompleteDay}
                className={`
                    relative w-full h-20 rounded-[24px] overflow-hidden group transition-all duration-500
                    ${isComplete 
                        ? "cursor-not-allowed" 
                        : "hover:shadow-[0_0_50px_rgba(230,84,115,0.4)]"
                    }
                `}
             >
                 <div className={`absolute inset-0 transition-colors duration-500 ${isComplete ? "bg-emerald-500/20" : "bg-[color:var(--pink)]"}`} />
                 
                 {/* Animated Shine Effect */}
                 {!isComplete && (
                     <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                 )}

                 <div className="relative h-full flex items-center justify-center gap-3">
                     {isComplete ? (
                         <>
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="text-left">
                                <div className="text-emerald-100 font-bold text-lg leading-none">Complete</div>
                                <div className="text-emerald-200/60 text-xs font-bold uppercase tracking-wider mt-1">Great Job</div>
                            </div>
                         </>
                     ) : (
                         <>
                            <BadgeCheck className="text-white/90" size={24} />
                            <span className="text-white font-bold text-lg tracking-wide">Mark Day Complete</span>
                         </>
                     )}
                 </div>
             </button>
             
             {isComplete && todaysCompletion?.completedAtISO && (
                 <div className="text-center mt-4 text-white/30 text-xs font-mono">
                     Finished at {new Date(todaysCompletion.completedAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
             )}
          </motion.div>
        </div>

      </div>

      {/* Safety Player Overlay */}
      <AnimatePresence>
        {playerUrl && (
          <SafetyPlayer
            initialUrl={playerUrl}
            title={playerTitle}
            onClose={() => setPlayerUrl(null)}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
