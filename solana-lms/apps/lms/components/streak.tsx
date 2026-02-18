"use client";
import { Trophy, Flame, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

type StreakPopoverProps = {
  streak: number;
  xp: number;
};

export function StreakPopover({ streak, xp }: StreakPopoverProps) {
  const today = new Date().getDay(); // 0 = Sunday

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-4 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-200">
          <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
            <Zap className="w-3.5 h-3.5 fill-primary" />
            <span>{xp} XP</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400">
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            <span>{streak} Day Streak</span>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-0 border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 rounded-2xl overflow-hidden"
        sideOffset={12}
        align="end"
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-white/5">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-widest font-medium">
                Current Streak
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white tabular-nums">
                  {streak}
                </span>
                <span className="text-sm text-orange-400 font-semibold mb-1.5">
                  {streak === 1 ? "day" : "days"}
                </span>
              </div>
              {streak === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Complete a lesson to start your streak
                </p>
              )}
              {streak > 0 && streak < 7 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {7 - streak} days until Week Warrior 🏆
                </p>
              )}
              {streak >= 7 && (
                <p className="text-xs text-orange-400/80 mt-1 font-medium">
                  You're on fire! Keep it up 🔥
                </p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Flame
                className={`w-7 h-7 ${streak > 0 ? "text-orange-400 fill-orange-400" : "text-muted-foreground"}`}
              />
            </div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
            This Week
          </p>
          <div className="flex items-center justify-between">
            {DAYS.map((day, i) => {
              const isToday = i === today;
              // Mock: days before today in current streak are active
              const isPast = i < today;
              const isActive = isPast && streak > today - i;

              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground/50"}`}
                  >
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                      ${isToday ? "bg-primary/20 border border-primary/40 ring-1 ring-primary/20" : ""}
                      ${isActive ? "bg-orange-500/15 border border-orange-500/30" : ""}
                      ${!isToday && !isActive ? "bg-white/5 border border-white/5" : ""}
                    `}
                  >
                    {isActive ? (
                      <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                    ) : isToday ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
            Streak Milestones
          </p>
          <div className="space-y-2">
            {[
              { days: 7, label: "Week Warrior", icon: "⚡" },
              { days: 30, label: "Monthly Master", icon: "🏆" },
              { days: 100, label: "Consistency King", icon: "👑" },
            ].map(({ days, label, icon }) => {
              const reached = streak >= days;
              const progress = Math.min((streak / days) * 100, 100);
              return (
                <div
                  key={days}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                    ${reached ? "bg-primary/5 border-primary/20" : "bg-white/[0.02] border-white/5"}
                  `}
                >
                  <span className={`text-lg ${!reached && "grayscale opacity-40"}`}>
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${reached ? "text-white" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {Math.min(streak, days)}/{days}d
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${reached ? "bg-primary" : "bg-white/20"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}