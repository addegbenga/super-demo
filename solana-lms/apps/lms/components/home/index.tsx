"use client";

import { getCurrentUserId } from "@/hooks/auth";
import { useEnrolledCoursesWithDetails } from "@/hooks/use-course";
import { userQueries } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
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
import {
  Trophy,
  Flame,
  Target,
  Zap,
  ChevronRight,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICONS = {
  xp: Zap,
  streak: Flame,
  level: Target,
  trophy: Trophy,
  bookOpen: BookOpen,
  chevronRight: ChevronRight,
  first_steps: Star,
  course_completer: Trophy,
  week_warrior: Flame,
  monthly_master: Award,
  consistency_king: Target,
  rust_rookie: Zap,
  anchor_expert: TrendingUp,
  early_adopter: Star,
} as const;

// ─── Achievement definitions ──────────────────────────────────────────────────

const ACHIEVEMENT_DEFS = [
  {
    id: "first_steps",
    label: "First Steps",
    description: "Complete your very first lesson.",
  },
  {
    id: "course_completer",
    label: "Course Completion",
    description: "Finish an entire course from start to finish.",
  },
  {
    id: "week_warrior",
    label: "Week Warrior",
    description: "Maintain a 7-day learning streak.",
  },
  {
    id: "monthly_master",
    label: "Monthly Master",
    description: "Hit a 30-day streak. Real habit formed.",
  },
  {
    id: "consistency_king",
    label: "Consistent Learner",
    description: "100-day streak. Legendary dedication.",
  },
  {
    id: "rust_rookie",
    label: "Speed Runner",
    description: "Complete a course in record time.",
  },
  {
    id: "anchor_expert",
    label: "Knowledge Master",
    description: "Master the Anchor framework.",
  },
  {
    id: "early_adopter",
    label: "Legend",
    description: "Joined during early access.",
  },
] as const;

type AchievementId = (typeof ACHIEVEMENT_DEFS)[number]["id"];
type Achievement = { id: string; unlockedAt?: string };
type HeatmapCell = { date: Date; active: boolean; achievement: string | null };

// ─── Heatmap helpers ──────────────────────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function buildHeatmapData(streakHistory: Date[], achievements: Achievement[]) {
  const today = new Date();
  const historySet = new Set(
    streakHistory.map((d) => new Date(d).toDateString()),
  );
  const achievementMap = new Map<string, string>();
  achievements.forEach((a) => {
    if (a.unlockedAt)
      achievementMap.set(new Date(a.unlockedAt).toDateString(), a.id);
  });
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31);
  const gridStart = new Date(yearStart);
  gridStart.setDate(yearStart.getDate() - yearStart.getDay());
  const gridEnd = new Date(yearEnd);
  gridEnd.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));
  const cells: HeatmapCell[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const key = cursor.toDateString();
    const inYear = cursor >= yearStart && cursor <= yearEnd;
    cells.push({
      date: new Date(cursor),
      active: inYear && historySet.has(key),
      achievement: inYear ? (achievementMap.get(key) ?? null) : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, wi) => {
    week.forEach((cell) => {
      if (
        cell.date >= yearStart &&
        cell.date <= yearEnd &&
        cell.date.getDate() === 1
      )
        monthLabels.push({
          label: MONTHS[cell.date.getMonth()] as string,
          col: wi,
        });
    });
  });
  return { weeks, monthLabels };
}

function cellStyle(cell: HeatmapCell, isToday: boolean, inFuture: boolean) {
  if (cell.achievement)
    return "bg-yellow-400 shadow-sm shadow-yellow-400/40 ring-1 ring-yellow-300/30";
  if (isToday) return "bg-primary/40 ring-1 ring-primary/60";
  if (cell.active) return "bg-primary/70";
  if (inFuture) return "bg-white/[0.03]";
  return "bg-white/[0.06]";
}

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
                {unlocked ? "Unlocked ✓" : "Not yet earned"}
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
                                  Streak day
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                {isToday
                                  ? "Today — no activity yet"
                                  : inFuture
                                    ? "Future"
                                    : "No activity"}
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
          <span>Less</span>
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
  const userId = getCurrentUserId();
  const { data: user } = useQuery(userQueries.profile(userId));
  const { data, isLoading } = useEnrolledCoursesWithDetails(userId);

  const streak = user?.streak.current ?? 0;
  const longest = user?.streak.longest ?? 0;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 0;
  const achievements = user?.achievements ?? [];
  const streakHistory = (user?.streak as any)?.streakHistory ?? [];

  // Most recently interacted course
  const recentCourse = data?.[0] ?? null;

  return (
    <div className="container max-w-5xl py-10 mx-auto px-4 space-y-3">
      {/* ── Header ── */}
      <div className="pb-3">
        <h1 className="text-3xl tracking-tighter font-bold mb-1">
          Welcome back, Dev 👋
        </h1>
        <p className="text-sm tracking-tight text-muted-foreground">
          {streak > 0
            ? `You're on a ${streak} day streak! Keep it up.`
            : "Complete a lesson today to start your streak!"}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={<ICONS.xp className="w-5 h-5 text-primary" />}
          label="Total XP"
          value={xp.toLocaleString()}
          accent="bg-primary"
          popoverContent={
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                XP Breakdown
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">
                  {xp.toLocaleString()}
                </span>
                <span className="text-sm text-primary mb-1">total XP</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Level {level}</span>
                  <span className="text-primary">{xp % 500} / 500 XP</span>
                </div>
                <Progress value={(xp % 500) / 5} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">
                  {500 - (xp % 500)} XP to Level {level + 1}
                </p>
              </div>
            </div>
          }
        />

        <StatCard
          icon={<ICONS.streak className="w-5 h-5 text-orange-400" />}
          label="Day Streak"
          value={`${streak}`}
          accent="bg-orange-500"
          popoverContent={
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Streak
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{streak}</span>
                <span className="text-sm text-orange-400 mb-1">days</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-muted-foreground">
                  Longest streak
                </span>
                <span className="text-xs font-bold text-orange-400">
                  {longest} days 🔥
                </span>
              </div>
              {streak < 7 && (
                <p className="text-[10px] text-muted-foreground">
                  {7 - streak} days to Week Warrior
                </p>
              )}
            </div>
          }
        />

        <StatCard
          icon={<ICONS.level className="w-5 h-5 text-blue-400" />}
          label="Level"
          value={`Lvl ${level}`}
          accent="bg-blue-500"
        />

        <StatCard
          icon={<ICONS.trophy className="w-5 h-5 text-yellow-400" />}
          label="Achievements"
          value={`${achievements.length}/${ACHIEVEMENT_DEFS.length}`}
          accent="bg-yellow-500"
        />
      </div>

      

      <section className="flex flex-col gap-4">
        {/* Simple two-column layout: 75% left, 25% right */}
        <div
          className={`grid pt-2 gap-3 ${
            recentCourse
              ? "grid-cols-1 lg:grid-cols-[1fr_minmax(0,24%)]"
              : "grid-cols-1"
          }`}
        >
          {/* ── My Courses + Activity (left column, full width if no recent) ── */}
          <div className="grid gap-3">
            {isLoading ? (
              <div className="rounded-2xl border border-white/5 bg-white/2 animate-pulse h-52" />
            ) : data?.length ? (
              <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden max-h-96 flex flex-col">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold">My Courses</h3>
                  <Link href="/course">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-6 px-2 gap-0.5 hover:text-foreground"
                    >
                      Browse all
                      <ICONS.chevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {data.map(({ course, progress }) => {
                    if (!course) return null;
                    const done = progress.completionPercentage === 100;

                    return (
                      <Link
                        key={course._id}
                        href={`/course/${course.slug.current}`}
                        className="group items-center flex gap-4 h-40 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all overflow-hidden"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-40 shrink-0 self-stretch min-h-30">
                          {course.thumbnail ? (
                            <Image
                              fill
                              src={course.thumbnail}
                              alt={course.title}
                              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <ICONS.bookOpen className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-3 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            {done ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-emerald-400">
                                <CheckCircle2 className="w-2.5 h-2.5" />{" "}
                                Completed
                              </span>
                            ) : (
                              <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-primary/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="mt-0.5">In progress</span>
                              </p>
                            )}
                          </div>
                          <p className="font-semibold tracking-tight leading-snug mb-1 group-hover:text-white transition-colors">
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground">
                              <span className="text-white/70 font-medium">
                                {progress.completedLessons.length}
                              </span>{" "}
                              lessons
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              <span className="text-primary/80 font-medium">
                                +{progress.xpEarned}
                              </span>{" "}
                              XP
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="px-4 pb-4">
                  <Link href="/course">
                    <Button
                      className="w-full text-xs"
                      variant="outline"
                      size="sm"
                    >
                      Browse More Courses
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Link href="/course" className="w-full">
                <div className="rounded-2xl border border-white/5 border-dashed hover:border-white/10 transition-colors p-20 flex flex-col items-center text-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <ICONS.bookOpen className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Start your first course
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Browse what's available →
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* ── Right Column: Recently Active Course ── */}
          {recentCourse && (
            <div>
              <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden h-full">
                {isLoading ? (
                  <div className="animate-pulse h-full min-h-56 bg-white/2" />
                ) : recentCourse ? (
                  (() => {
                    const { course, progress } = recentCourse;
                    const isCompleted = progress.completionPercentage === 100;
                    return (
                      <div className="flex flex-col h-full">
                        {/* Big thumbnail header */}
                        <div className="relative h-36 w-full shrink-0">
                          {course?.thumbnail ? (
                            <Image
                              fill
                              src={course.thumbnail}
                              alt={course?.title ?? ""}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent" />
                          <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                            {isCompleted ? (
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-semibold text-emerald-300">
                                  Completed
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-semibold text-primary/90">
                                  In Progress
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Course info */}
                        <div className="px-4 py-3 flex flex-col flex-1">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-1">
                            Recently Active
                          </p>
                          <h3 className="text-sm font-bold leading-snug line-clamp-1 mb-2">
                            {course?.title}
                          </h3>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="text-center">
                              <p
                                className="text-base font-black tabular-nums leading-none"
                                style={{
                                  color: isCompleted ? "#34d399" : undefined,
                                }}
                              >
                                {progress.completionPercentage}%
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                done
                              </p>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="text-center">
                              <p className="text-base font-black tabular-nums leading-none">
                                {progress.completedLessons.length}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                lessons
                              </p>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="text-center">
                              <p className="text-base font-black tabular-nums leading-none text-primary">
                                +{progress.xpEarned}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                XP
                              </p>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <Link
                              href={`/course/${course?.slug.current}`}
                              className="block"
                            >
                              <Button
                                size="sm"
                                variant={isCompleted ? "outline" : "default"}
                                className="w-full gap-1.5 text-xs h-8"
                              >
                                {isCompleted
                                  ? "Review Course"
                                  : "Continue Learning"}
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : null}
              </div>
            </div>
          )}
        </div>

        {recentCourse &&
        
        <div className="grid pt-2 gap-3 grid-cols-1 lg:grid-cols-[1fr_minmax(0,24%)]">
          {/* ── Activity Heatmap (left column, bottom on mobile) ── */}
          <div className="rounded-2xl border border-white/5 bg-white/2 p-5 h-full">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Activity Log</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Your learning consistency this year
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
                <h3 className="text-sm font-semibold">Achievements</h3>
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
        }

      </section>
    </div>
  );
}
