import type { PublicKey } from '@solana/web3.js'

export interface Progress {
  courseId: string
  completedLessons: string[]
  completionPercentage: number
  xpEarned: number
  startedAt: Date
  lastActivityAt: Date,
  enrolled:boolean,
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  streakHistory: Date[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  xp: number
  level: number
  rank: number
  streak: number
}

export interface Credential {
  id: string
  track: string
  level: number
  mintAddress: string
  metadata: {
    name: string
    image: string
    attributes: Array<{ trait_type: string; value: string }>
  }
  issuedAt: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}


/**
 * Service interface for learning progress and gamification
 * This abstraction allows swapping between mock (localStorage) and on-chain implementations
 */
export interface LearningProgressService {
  // Progress tracking
  getProgress(data:{userId: string, courseId: string}): Promise<Progress>
  completeLesson(data:{userId: string, courseId: string, lessonId: string}): Promise<any>
  enrollInCourse(data:{userId: string, courseId: string}): Promise<any>
  
  // XP & Leveling
  getXP(data:{userId: string}): Promise<number>
  getLevel(data:{userId: string}): Promise<number>
  addXP(data:{userId: string, amount: number}): Promise<void>
  
  // Streaks
  getStreak(userId: string): Promise<StreakData>
  
  // Leaderboard
  getLeaderboard(data:{timeframe: 'weekly' | 'monthly' | 'alltime'}): Promise<LeaderboardEntry[]>
  
  // Credentials (cNFTs)
  getCredentials(data:{wallet: PublicKey}): Promise<Credential[]>
  
  // Achievements
  getAchievements(data:{userId: string}): Promise<Achievement[]>
  unlockAchievement(data:{userId: string, achievementId: string}): Promise<void>
}