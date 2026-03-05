"use client";
import { getCurrentUserId } from "@/hooks/auth";
import { userQueries } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@workspace/ui/components/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Trophy, Lock } from "lucide-react";

import {
  ACHIEVEMENT_DEFS,
  Achievement,
  AchievementId,
  DAY_LABELS,
  ICONS,
  buildHeatmapData,
  cellStyle,
} from "@/lib/helper";
import { useI18n } from "@/lib/i18n";
import RecentCourseHome from "./recentCourse";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  accent,
  popoverContent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  popoverContent?: React.ReactNode;
}) {
  const inner = (
    <div
      className={`relative group overflow-hidden rounded-2xl border border-white/5 bg-white/2 p-5 h-full transition-all duration-200 cursor-default
      ${popoverContent ? "hover:bg-white/4 hover:border-white/10" : ""}`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none ${accent}`}
      />
      <div className="mb-3">{icon}</div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
  if (!popoverContent) return inner;
  return (
    <Popover>
      <PopoverTrigger asChild>{inner}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-0 border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

// ─── Achievement Tile ─────────────────────────────────────────────────────────

function AchievementTile({
  id,
  label,
  description,
  unlocked,
}: {
  id: AchievementId;
  label: string;
  description: string;
  unlocked: boolean;
}) {
  const { t } = useI18n();
  const Icon = ICONS[id];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`group relative flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all overflow-hidden
          ${
            unlocked
              ? "bg-primary/5 border-primary/20 hover:bg-primary/8 hover:border-primary/30"
              : "border-white/5 bg-white/2 opacity-40"
          }`}
        >
          {unlocked && (
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl pointer-events-none scale-150" />
          )}
          <div
            className={`relative w-7 h-7 rounded-lg flex items-center justify-center
            ${unlocked ? "bg-primary/15 border border-primary/25" : "bg-white/5 border border-white/5"}`}
          >
            {unlocked ? (
              <Icon className="w-3 h-3 text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.8)]" />
            ) : (
              <Lock className="w-2.5 h-2.5 text-muted-foreground/30" />
            )}
          </div>
          <span className="text-[8px] text-center leading-tight text-muted-foreground/50 truncate w-full">
            {label}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-52 p-0 border border-white/10 bg-[#0a0a0a] shadow-2xl rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        <div
          className={`h-0.5 w-full ${unlocked ? "bg-linear-to-r from-primary/80 via-primary/30 to-transparent" : "bg-white/5"}`}
        />
        <div className="p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${unlocked ? "bg-primary/10 border border-primary/20" : "bg-white/5 border border-white/5 grayscale opacity-50"}`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${unlocked ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">{label}</p>
              <p
                className={`text-[10px] leading-tight ${unlocked ? "text-primary/70" : "text-muted-foreground/50"}`}
              >
                {unlocked ? t("home.unlocked") : t("home.notYetEarned")}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            {description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap({
  streakHistory,
  achievements,
}: {
  streakHistory: Date[];
  achievements: Achievement[];
}) {
  const { t } = useI18n();
  const today = new Date();
  const { weeks, monthLabels } = buildHeatmapData(streakHistory, achievements);
  const CELL = 10,
    GAP = 2.5;
  return (
    <TooltipProvider delayDuration={60}>
      <div className="w-full select-none overflow-x-auto pb-1">
        <div className="flex gap-2">
          <div
            className="shrink-0 flex flex-col"
            style={{ gap: GAP, marginTop: CELL + GAP + 2 }}
          >
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex items-center justify-end"
                style={{ height: CELL, width: 22 }}
              >
                <span className="text-[8px] text-muted-foreground/40 leading-none">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, wi) => {
              const m = monthLabels.find((ml) => ml.col === wi);
              return (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  <div
                    style={{ height: CELL, width: CELL }}
                    className="flex items-center"
                  >
                    {m && (
                      <span className="text-[8px] text-muted-foreground/40 whitespace-nowrap leading-none">
                        {m.label}
                      </span>
                    )}
                  </div>
                  {week.map((cell, di) => {
                    const isToday =
                      cell.date.toDateString() === today.toDateString();
                    const inFuture = cell.date > today;
                    const dateStr = cell.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <Tooltip key={di}>
                        <TooltipTrigger asChild>
                          <div
                            className={`rounded-[3px] cursor-default transition-colors duration-100 hover:brightness-125 shrink-0 ${cellStyle(cell, isToday, inFuture)}`}
                            style={{ width: CELL, height: CELL }}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={4}
                          className="bg-[#111] border border-white/10 rounded-xl shadow-xl p-0 overflow-hidden"
                        >
                          <div className="p-2.5">
                            <p className="text-[11px] font-semibold text-white mb-1">
                              {dateStr}
                            </p>
                            {cell.achievement ? (
                              <div className="flex items-center gap-1.5">
                                <ICONS.trophy className="w-3 h-3 text-yellow-400 shrink-0" />
                                <span className="text-[10px] text-yellow-300 capitalize">
                                  {cell.achievement.replaceAll("_", " ")}{" "}
                                  unlocked
                                </span>
                              </div>
                            ) : cell.active ? (
                              <div className="flex items-center gap-1.5">
                                <ICONS.streak className="w-3 h-3 text-orange-400 fill-orange-400 shrink-0" />
                                <span className="text-[10px] text-orange-300">
                                  {t("home.streakDay")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                {isToday
                                  ? t("home.todayNoActivity")
                                  : inFuture
                                    ? t("home.future")
                                    : t("home.noActivity")}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[9px] text-muted-foreground/40">
          <span>{t("home.less")}</span>
          <div className="w-2 h-2 rounded-sm bg-white/6" />
          <div className="w-2 h-2 rounded-sm bg-primary/40" />
          <div className="w-2 h-2 rounded-sm bg-primary/70" />
          <div className="w-2 h-2 rounded-sm bg-yellow-400" />
          {/* <span>More · 🏆 Achievement</span> */}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { userId } = getCurrentUserId();

  const { data: user } = useQuery(userQueries.profile(userId));

  const { t } = useI18n();

  const streak = user?.streak.current ?? 0;
  const longest = user?.streak.longest ?? 0;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 0;
  const achievements = user?.achievements ?? [];
  const streakHistory = (user?.streak as any)?.streakHistory ?? [];

  return (
    <div className="container max-w-5xl py-10 mx-auto px-4 space-y-3">
      {/* ── Header ── */}
      <div className="pb-3">
        <h1 className="text-3xl tracking-tighter font-bold mb-1">
          {t("home.welcomeBack")}
        </h1>
        <p className="text-sm tracking-tight text-muted-foreground">
          {streak > 0
            ? t("home.streakMessage", { streak: streak.toString() })
            : t("home.startStreak")}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={<ICONS.xp className="w-5 h-5 text-primary" />}
          label={t("home.totalXP")}
          value={xp.toLocaleString()}
          accent="bg-primary"
          popoverContent={
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {t("home.xpBreakdown")}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">
                  {xp.toLocaleString()}
                </span>
                <span className="text-sm text-primary mb-1">total XP</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("home.level")} {level}
                  </span>
                  <span className="text-primary">{xp % 500} / 500 XP</span>
                </div>
                <Progress value={(xp % 500) / 5} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  {500 - (xp % 500)}{" "}
                  {t("home.toNextLevel", {
                    xp: (500 - (xp % 500)).toString(),
                    level: (level + 1).toString(),
                  })}
                </p>
              </div>
            </div>
          }
        />

        <StatCard
          icon={<ICONS.streak className="w-5 h-5 text-orange-400" />}
          label={t("home.dayStreak")}
          value={`${streak}`}
          accent="bg-orange-500"
          popoverContent={
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {t("home.dayStreak")}
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{streak}</span>
                <span className="text-sm text-orange-400 mb-1">
                  {t("home.days")}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-muted-foreground">
                  {t("home.longestStreak")}
                </span>
                <span className="text-xs font-bold text-orange-400">
                  {longest} {t("home.days")} 🔥
                </span>
              </div>
              {streak < 7 && (
                <p className="text-[10px] text-muted-foreground">
                  {t("home.weekWarrior", { days: (7 - streak).toString() })}
                </p>
              )}
            </div>
          }
        />

        <StatCard
          icon={<ICONS.level className="w-5 h-5 text-blue-400" />}
          label={t("home.level")}
          value={`Lvl ${level}`}
          accent="bg-blue-500"
        />

        <StatCard
          icon={<ICONS.trophy className="w-5 h-5 text-yellow-400" />}
          label={t("home.achievements")}
          value={`${achievements.length}/${ACHIEVEMENT_DEFS.length}`}
          accent="bg-yellow-500"
        />
      </div>

      <section className="flex flex-col gap-4">
        {/* Simple two-column layout: 75% left, 25% right */}
        <RecentCourseHome />

        <div className="grid pt-2 gap-3 grid-cols-1 lg:grid-cols-[1fr_minmax(0,24%)]">
          {/* ── Activity Heatmap (left column, bottom on mobile) ── */}
          <div className="rounded-2xl border border-white/5 bg-white/2 p-5 h-full">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">{t("home.activityLog")}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("home.learningConsistency")}
              </p>
            </div>
            <ActivityHeatmap
              streakHistory={streakHistory}
              achievements={achievements as any}
            />
          </div>
          <div className="rounded-2xl  border border-white/5 bg-white/2 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-white/5 border border-white/8 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                </div>
                <h3 className="text-sm font-semibold">
                  {t("home.achievements")}
                </h3>
              </div>
              <span className="relative text-[10px] font-semibold text-muted-foreground tabular-nums px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8">
                <span className="absolute inset-0 rounded-md bg-yellow-400/10 blur-sm" />
                <span className="relative">
                  {achievements.length}/{ACHIEVEMENT_DEFS.length}
                </span>
              </span>
            </div>

            <div className="p-3 grid grid-cols-4 gap-2 content-start">
              {ACHIEVEMENT_DEFS.map(({ id, label, description }) => {
                const unlocked = achievements.some((a) => a.id === id);
                return (
                  <AchievementTile
                    key={id}
                    id={id}
                    label={label}
                    description={description}
                    unlocked={unlocked}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
