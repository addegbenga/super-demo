import { PublicKey } from "@solana/web3.js";
import { queryOptions } from "@tanstack/react-query";
import { learningService } from "@workspace/learning-service";
import { queryBuilder } from "@workspace/sanity-client";

export const queryKeys = {
  // Courses
  courses: {
    all: ["courses"] as const,
    list: (filters?: object) =>
      [...queryKeys.courses.all, "list", filters] as const,
    detail: (slug: string, lang?: string) =>
      [...queryKeys.courses.all, "detail", slug, lang] as const,
    stats: (courseId: string) =>
      [...queryKeys.courses.all, "stats", courseId] as const,
    byIds: (ids: string[]) => ["courses", "byIds", ...ids.sort()] as const,
  },

  // Lessons
  lessons: {
    all: ["lessons"] as const,
    detail: (slug: string, lang?: string) =>
      [...queryKeys.lessons.all, "detail", slug, lang] as const,
  },

  // User Progress
  progress: {
    all: (userId: string) => ["progress", userId] as const,
    course: (userId: string, courseId: string) =>
      [...queryKeys.progress.all(userId), "course", courseId] as const,
    enrolled: (userId: string) =>
      [...queryKeys.progress.all(userId), "enrolled"] as const,
  },

  // User Profile
  user: {
    all: (userId: string) => ["user", userId] as const,
    xp: (userId: string) => [...queryKeys.user.all(userId), "xp"] as const,
    level: (userId: string) =>
      [...queryKeys.user.all(userId), "level"] as const,
    streak: (userId: string) =>
      [...queryKeys.user.all(userId), "streak"] as const,
    achievements: (userId: string) =>
      [...queryKeys.user.all(userId), "achievements"] as const,
    credentials: (userId: string) =>
      [...queryKeys.user.all(userId), "credentials"] as const,
  },

  // Leaderboard
  leaderboard: {
    all: ["leaderboard"] as const,
    byTimeframe: (timeframe: string) =>
      [...queryKeys.leaderboard.all, timeframe] as const,
  },

  // Reviews
  reviews: {
    all: ["reviews"] as const,
    byCourse: (courseId: string) =>
      [...queryKeys.reviews.all, "course", courseId] as const,
    byUser: (userId: string, courseId: string) =>
      [...queryKeys.reviews.all, "user", userId, courseId] as const,
  },
};

// ==================== COURSE QUERIES  ====================
const staleTime = 1000 * 60 * 60; // 1 hour
export const courseQueries = {
  bySlug: (slug: string, language?: any) =>
    queryOptions({
      queryKey: queryKeys.courses.detail(slug, language),
      queryFn: () => queryBuilder.getCourseBySlug(slug, language),
      staleTime: staleTime,
    }),
  byIds: (ids: string[], language?: any) =>
    queryOptions({
      queryKey: queryKeys.courses.byIds(ids),
      queryFn: () => queryBuilder.getCourseByIds(ids, language),
      enabled: ids.length > 0,
      staleTime: staleTime,
    }),

  all: (lang?: any) =>
    queryOptions({
      queryKey: queryKeys.courses.all,
      queryFn: () => queryBuilder.getCourses(lang),
      staleTime: staleTime,
    }),
};

// ==================== LESSON QUERIES (Sanity) ====================

export const lessonQueries = {
  bySlug: (slug: string, language?: string) =>
    queryOptions({
      queryKey: queryKeys.lessons.detail(slug, language),
      queryFn: () => queryBuilder.getLessonBySlug(slug, language as any),
      staleTime: staleTime,
    }),

  byId: (id: string) =>
    queryOptions({
      queryKey: [...queryKeys.lessons.all, "id", id] as const,
      queryFn: () => queryBuilder.getLessonById(id),
      staleTime: staleTime,
    }),

  adjacent: (moduleId: string) =>
    queryOptions({
      queryKey: [...queryKeys.lessons.all, "adjacent", moduleId] as const,
      queryFn: () => queryBuilder.getAdjacentLessons(moduleId),
    }),
};

// ==================== PROGRESS QUERIES (localStorage via learningService) ====================

export const progressQueries = {
  // Get progress for a specific course
  course: (userId: string, courseId: string) =>
    queryOptions({
      queryKey: queryKeys.progress.course(userId, courseId),
      queryFn: () => learningService.getProgress({ userId, courseId }),
      enabled: !!userId && !!courseId,
      staleTime: 0, // Always fresh - progress changes frequently
    }),

  enrolled: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.progress.enrolled(userId),
      queryFn: () => learningService.getEnrolledCourses({ userId }),
      enabled: !!userId,
      staleTime: 0,
    }),
};

// ==================== USER QUERIES (localStorage via learningService) ====================

export const userQueries = {
  // Current XP balance
  xp: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.user.xp(userId),
      queryFn: () => learningService.getXP({ userId }),
      enabled: !!userId,
      staleTime: 0,
    }),

  profile: (userId: string) =>
    queryOptions({
      queryKey: [...queryKeys.user.all(userId), "profile"] as const,
      queryFn: () => learningService.getUser({ userId }),
      enabled: !!userId,
      staleTime: 0, // Always fresh — streak break check runs on every fetch
    }),

  // Current level derived from XP
  level: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.user.level(userId),
      queryFn: () => learningService.getLevel({ userId }),
      enabled: !!userId,
      staleTime: 0,
    }),

  // Streak data
  streak: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.user.streak(userId),
      queryFn: () => learningService.getStreak(userId),
      enabled: !!userId,
      staleTime: 60 * 1000, // 1 minute - streak updates once per day
    }),

  // Unlocked achievements
  achievements: (userId: string) =>
    queryOptions({
      queryKey: queryKeys.user.achievements(userId),
      queryFn: () => learningService.getAchievements({ userId }),
      enabled: !!userId,
      staleTime: 30 * 1000,
    }),

  // On-chain credentials (cNFTs) - in production via Helius DAS API
  credentials: (userId: string, wallet: PublicKey | null) =>
    queryOptions({
      queryKey: queryKeys.user.credentials(userId),
      queryFn: () => learningService.getCredentials({ wallet: wallet! }),
      enabled: !!userId && !!wallet,
      staleTime: 5 * 60 * 1000,
    }),
};

// ==================== LEADERBOARD QUERIES (learningService) ====================

export const leaderboardQueries = {
  byTimeframe: (timeframe: "weekly" | "monthly" | "alltime") =>
    queryOptions({
      queryKey: queryKeys.leaderboard.byTimeframe(timeframe),
      queryFn: () => learningService.getLeaderboard({ timeframe }),
      staleTime: 5 * 60 * 1000,
    }),
};
