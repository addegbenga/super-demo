// ─── Icons ────────────────────────────────────────────────────────────────────

import {
  Zap,
  Flame,
  Target,
  Trophy,
  BookOpen,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

export const ICONS = {
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

export const ACHIEVEMENT_DEFS = [
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

export type AchievementId = (typeof ACHIEVEMENT_DEFS)[number]["id"];
export type Achievement = { id: string; unlockedAt?: string };
export type HeatmapCell = { date: Date; active: boolean; achievement: string | null };

// ─── Heatmap helpers ──────────────────────────────────────────────────────────

export const MONTHS = [
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
export const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function buildHeatmapData(
  streakHistory: Date[],
  achievements: Achievement[],
) {
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

export function cellStyle(cell: HeatmapCell, isToday: boolean, inFuture: boolean) {
  if (cell.achievement)
    return "bg-yellow-400 shadow-sm shadow-yellow-400/40 ring-1 ring-yellow-300/30";
  if (isToday) return "bg-primary/40 ring-1 ring-primary/60";
  if (cell.active) return "bg-primary/70";
  if (inFuture) return "bg-white/[0.03]";
  return "bg-white/[0.06]";
}
