// Responsibility split:
//   - This service owns localStorage (client-side state)
//   - Server Actions own Sanity writes (token stays server-side)
//   - This service does NOT call the Sanity API directly
//
// In production this class will be replaced by an indexer client
// that reads from on-chain accounts (Solana PDAs via Helius/RPC).
// The localStorage calls below map 1-to-1 with what the indexer will return.

import type { PublicKey } from "@solana/web3.js";
import type {
  LearningProgressService,
  Progress,
  StreakData,
  LeaderboardEntry,
  Credential,
  Achievement,
} from "./interfaces.ts";

export type CoursePayload = {
  userId: string;
  courseId: string;
};

export type UserProfile = {
  userId: string;
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: Date;
  };
  achievements: Achievement[];
};

export type LessonPayload = {
  userId: string;
  courseId: string;
  lessonId: string;
  totalLessons: number;
  xpReward: number;
};

export type XPPayload = {
  userId: string;
  amount: number;
};

export type UserPayload = {
  userId: string;
};

export type EnrollResult = {
  success: boolean;
  error?: string;
};

export type CompleteLessonResult = {
  success: boolean;
  xpAwarded: number;
  completionPercentage: number;
  courseCompleted: boolean;
  error?: string;
};

// Level formula: Level = floor(sqrt(xp / 100))
// Mirrors the on-chain XP token balance calculation
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

export class MockLearningService implements LearningProgressService {
  // localStorage is only available in the browser.
  // Server Actions must not instantiate this service - it is client-only.
  private storage = typeof window !== "undefined" ? window.localStorage : null;

  private getKey(prefix: string, ...parts: string[]): string {
    return `${prefix}_${parts.join("_")}`;
  }

  // ==================== PROGRESS ====================

  // In production: reads from the Enrollment PDA via indexer
  async getProgress({ userId, courseId }: CoursePayload): Promise<Progress> {
    const key = this.getKey("progress", userId, courseId);
    const stored = this.storage?.getItem(key);

    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        startedAt: new Date(data.startedAt),
        lastActivityAt: new Date(data.lastActivityAt),
      };
    }

    // Default progress for a user who has not enrolled
    return {
      courseId,
      completedLessons: [],
      completionPercentage: 0,
      xpEarned: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      enrolled: false,
    };
  }

  // Saves enrollment to localStorage, setting enrolled: true.
  //
  // IMPORTANT: This method is intentionally split from the Sanity enrollment write.
  // Sanity stat updates (totalEnrollments etc.) are handled by the Server Action
  // that calls this method via onSuccess in the mutation hook.
  // This keeps the Sanity token server-side only.
  //
  // In production this will be replaced by:
  //   1. Submit blockchain transaction (create Enrollment PDA)
  //   2. Wait for confirmation
  //   3. Indexer picks up the new PDA automatically
  async enrollInCourse({
    courseId,
    userId,
  }: CoursePayload): Promise<EnrollResult> {
    try {
      const progress = await this.getProgress({ userId, courseId });
      const key = this.getKey("progress", userId, courseId);
      // Set enrolled: true — this is the source of truth for enrollment state
      this.storage?.setItem(
        key,
        JSON.stringify({ ...progress, enrolled: true }),
      );

      return { success: true };
    } catch (error) {
      console.error("Failed to save enrollment to localStorage:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to enroll",
      };
    }
  }

  // Updates lesson progress in localStorage.
  //
  // IMPORTANT: Same split as enrollInCourse.
  // The Sanity progress write (/api/progress) is handled by the Server Action
  // that wraps this method. This service only owns the client-side state.
  //
  // In production this will be replaced by:
  //   1. Submit blockchain transaction (update progress bitmap, mint XP tokens)
  //   2. Indexer picks up the updated PDA
  async completeLesson({
    courseId,
    lessonId,
    userId,
    totalLessons,
    xpReward,
  }: LessonPayload): Promise<CompleteLessonResult> {
    try {
      const progress = await this.getProgress({ userId, courseId });

      // Guard: must be enrolled to complete lessons
      if (!progress.enrolled) {
        return {
          success: false,
          xpAwarded: 0,
          completionPercentage: progress.completionPercentage,
          courseCompleted: false,
          error: "User is not enrolled in this course",
        };
      }

      // Guard: do not double-count a completed lesson
      if (progress.completedLessons.includes(lessonId)) {
        return {
          success: true,
          xpAwarded: 0,
          completionPercentage: progress.completionPercentage,
          courseCompleted: progress.completionPercentage === 100,
        };
      }

      progress.completedLessons.push(lessonId);
      progress.lastActivityAt = new Date();
      progress.xpEarned += xpReward;
      progress.completionPercentage = Math.round(
        (progress.completedLessons.length / totalLessons) * 100,
      );

      const key = this.getKey("progress", userId, courseId);
      this.storage?.setItem(key, JSON.stringify(progress));

      // Side effects that are local to the client
      await this.addXP({ userId, amount: xpReward });
      await this.updateStreak(userId);
      await this.checkAchievements({ userId, progress });

      return {
        success: true,
        xpAwarded: xpReward,
        completionPercentage: progress.completionPercentage,
        courseCompleted: progress.completionPercentage === 100,
      };
    } catch (error) {
      console.error("Failed to complete lesson in localStorage:", error);
      return {
        success: false,
        xpAwarded: 0,
        completionPercentage: 0,
        courseCompleted: false,
        error:
          error instanceof Error ? error.message : "Failed to complete lesson",
      };
    }
  }

  // ==================== XP & LEVELING ====================

  // In production: reads XP token balance from on-chain via indexer
  async getXP({ userId }: UserPayload): Promise<number> {
    const key = this.getKey("xp", userId);
    const stored = this.storage?.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  }

  async getLevel({ userId }: UserPayload): Promise<number> {
    const xp = await this.getXP({ userId });
    return calculateLevel(xp);
  }

  // In production: blockchain transaction mints XP tokens to the user's wallet
  async addXP({ userId, amount }: XPPayload): Promise<void> {
    const currentXP = await this.getXP({ userId });
    const key = this.getKey("xp", userId);
    this.storage?.setItem(key, String(currentXP + amount));
  }

  // ==================== STREAKS ====================

  // In production: reads streak data from Learner PDA via indexer
  async getStreak(userId: string): Promise<StreakData> {
    const key = this.getKey("streak", userId);
    const stored = this.storage?.getItem(key);

    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        lastActivityDate: new Date(data.lastActivityDate),
        streakHistory: data.streakHistory.map((d: string) => new Date(d)),
      };
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date(0), // epoch — never equals today, so first lesson always triggers streak
      streakHistory: [],
    };
  }

  // In production: blockchain transaction updates streak on Learner PDA
  private async updateStreak(userId: string): Promise<void> {
    const streak = await this.getStreak(userId);
    const today = new Date().toDateString();
    const lastActivity = streak.lastActivityDate.toDateString();

    // Only update streak once per day
    if (today === lastActivity) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    streak.currentStreak =
      lastActivity === yesterday.toDateString() ? streak.currentStreak + 1 : 1;

    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.lastActivityDate = new Date();
    streak.streakHistory.push(new Date());

    const key = this.getKey("streak", userId);
    this.storage?.setItem(key, JSON.stringify(streak));

    // Unlock milestone streak achievements
    const streakMilestones: Record<number, string> = {
      7: "week_warrior",
      30: "monthly_master",
      100: "consistency_king",
    };

    const milestone = streakMilestones[streak.currentStreak];
    if (milestone) {
      await this.unlockAchievement({ userId, achievementId: milestone });
    }
  }

  // ==================== LEADERBOARD ====================

  // In production: indexer queries all XP token balances, sorts, returns top users
  async getLeaderboard({
    timeframe,
  }: {
    timeframe: "weekly" | "monthly" | "alltime";
  }): Promise<LeaderboardEntry[]> {
    const mockEntries: LeaderboardEntry[] = [
      {
        userId: "1",
        username: "alice.sol",
        xp: 5000,
        level: calculateLevel(5000),
        rank: 1,
        streak: 15,
      },
      {
        userId: "2",
        username: "bob.sol",
        xp: 3500,
        level: calculateLevel(3500),
        rank: 2,
        streak: 7,
      },
      {
        userId: "3",
        username: "charlie.sol",
        xp: 2800,
        level: calculateLevel(2800),
        rank: 3,
        streak: 12,
      },
    ];

    return mockEntries;
  }

  // ==================== CREDENTIALS ====================

  // In production: uses Helius DAS API to fetch cNFTs owned by the wallet
  // const assets = await helius.das.getAssetsByOwner({ ownerAddress: wallet.toBase58(), page: 1 })
  // Filter by collection address and map to Credential type
  async getCredentials({
    wallet,
  }: {
    wallet: PublicKey;
  }): Promise<Credential[]> {
    return [];
  }

  // ==================== ACHIEVEMENTS ====================

  // In production: reads achievement bitmap from Learner PDA via indexer
  async getAchievements({ userId }: UserPayload): Promise<Achievement[]> {
    const key = this.getKey("achievements", userId);
    const stored = this.storage?.getItem(key);

    if (!stored) return [];

    const unlockedIds = JSON.parse(stored) as string[];
    return this.getAllAchievementDefinitions().filter((a) =>
      unlockedIds.includes(a.id),
    );
  }

  // In production: blockchain transaction sets the corresponding bit
  // in the achievement bitmap on the Learner PDA
  async unlockAchievement({
    userId,
    achievementId,
  }: {
    userId: string;
    achievementId: string;
  }): Promise<void> {
    const achievements = await this.getAchievements({ userId });
    const ids = achievements.map((a) => a.id);

    if (ids.includes(achievementId)) return;

    ids.push(achievementId);
    const key = this.getKey("achievements", userId);
    this.storage?.setItem(key, JSON.stringify(ids));
  }

  private async checkAchievements({
    progress,
    userId,
  }: {
    userId: string;
    progress: Progress;
  }): Promise<void> {
    if (progress.completedLessons.length === 1) {
      await this.unlockAchievement({ userId, achievementId: "first_steps" });
    }

    if (progress.completionPercentage === 100) {
      await this.unlockAchievement({
        userId,
        achievementId: "course_completer",
      });
    }
  }

  // ==================== GET ALL COURSE ENROLLMENT ====================
  // Scans localStorage for all progress keys belonging to this user
  // and returns the ones where enrolled === true, sorted by lastActivityAt desc.
  //
  // In production: single indexer query for all Enrollment PDAs owned by wallet.

  async getEnrolledCourses({ userId }: UserPayload): Promise<Progress[]> {
    if (!this.storage) return [];

    const prefix = this.getKey("progress", userId, "");
    const enrolled: Progress[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (!key?.startsWith(prefix)) continue;

      const raw = this.storage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      if (!data.enrolled) continue;

      enrolled.push({
        ...data,
        startedAt: new Date(data.startedAt),
        lastActivityAt: new Date(data.lastActivityAt),
      });
    }

    // Most recently active first
    return enrolled.sort(
      (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime(),
    );
  }

  // ==================== USER PROFILE ====================

  // In production: single indexer call that aggregates XP token balance,
  // Learner PDA (streak/achievements), and any other on-chain state.
  // Here we just fan out to the individual localStorage methods.
  async getUser({ userId }: UserPayload): Promise<UserProfile> {
    const [xp, level, streak, achievements] = await Promise.all([
      this.getXP({ userId }),
      this.getLevel({ userId }),
      this.getStreak(userId),
      this.getAchievements({ userId }),
    ]);

    // Break streak if user missed yesterday — same logic as checkAndBreakStreak
    // but inline so getUser always returns the correct current value.
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastActivity = streak.lastActivityDate.toDateString();

    const currentStreak =
      lastActivity === today || lastActivity === yesterday.toDateString()
        ? streak.currentStreak
        : 0;

    // Persist the reset if streak was broken
    if (currentStreak === 0 && streak.currentStreak !== 0) {
      const key = this.getKey("streak", userId);
      this.storage?.setItem(
        key,
        JSON.stringify({ ...streak, currentStreak: 0 }),
      );
    }

    return {
      userId,
      xp,
      level,
      streak: {
        current: currentStreak,
        longest: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
      },
      achievements,
    };
  }

  // Achievement definitions live in Sanity in production.
  // Kept here only for the mock so the service remains self-contained.
  private getAllAchievementDefinitions(): Achievement[] {
    return [
      {
        id: "first_steps",
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "first_steps",
      },
      {
        id: "course_completer",
        name: "Course Completer",
        description: "Complete your first course",
        icon: "course_completer",
      },
      {
        id: "week_warrior",
        name: "Week Warrior",
        description: "7-day streak",
        icon: "week_warrior",
      },
      {
        id: "monthly_master",
        name: "Monthly Master",
        description: "30-day streak",
        icon: "monthly_master",
      },
      {
        id: "consistency_king",
        name: "Consistency King",
        description: "100-day streak",
        icon: "consistency_king",
      },
      {
        id: "rust_rookie",
        name: "Rust Rookie",
        description: "Complete 5 Rust lessons",
        icon: "rust_rookie",
      },
      {
        id: "anchor_expert",
        name: "Anchor Expert",
        description: "Complete the Anchor track",
        icon: "anchor_expert",
      },
      {
        id: "early_adopter",
        name: "Early Adopter",
        description: "Join in the first month",
        icon: "early_adopter",
      },
    ];
  }
}

export const learningService = new MockLearningService();
