// ── admin auth ──────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  username: string
  displayName: string | null
}

export interface AdminTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AdminLoginResponse {
  admin: AdminUser
  tokens: AdminTokens
}

// ── analytics ─────────────────────────────────────────────────────────────────
export interface SeriesPoint {
  date: string
  value: number
}

export interface KeyValue {
  key: string
  value: number
}

export interface OverviewResponse {
  users: {
    total: number
    real: number
    anonymous: number
    bots: number
    newToday: number
    new7d: number
    new30d: number
  }
  active: { dau: number; wau: number; mau: number }
  onboarding: { total: number; onboarded: number; rate: number }
  monetization: { activeSubscribers: number; mrr: number; currency: string }
}

export interface GrowthResponse {
  days: number
  newUsers: SeriesPoint[]
  activeUsers: SeriesPoint[]
}

export interface FoodLoggingResponse {
  days: number
  logsByDay: SeriesPoint[]
  bySource: KeyValue[]
  byMeal: KeyValue[]
  totals: { totalLogs: number; aiScans: number; loggingUsers: number }
}

export interface DimensionStat {
  dimension: string
  passed: number
  finalized: number
  total: number
  passRate: number
}

export interface ChallengesAnalyticsResponse {
  days: number
  dailyStatus: KeyValue[]
  dailyByDimension: DimensionStat[]
  weeklyStatus: KeyValue[]
  streakDistribution: { bucket: string; value: number }[]
  longestStreak: number
  broccoli: { date: string; earned: number; spent: number }[]
}

export interface MonetizationResponse {
  days: number
  byStatus: KeyValue[]
  byStore: KeyValue[]
  byPeriod: KeyValue[]
  newSubscriptionsByDay: SeriesPoint[]
  mrr: number
  currency: string
}

// ── challenge pool ────────────────────────────────────────────────────────────
export type ChallengeType = 'threshold' | 'positive' | 'avoidance'
export type ChallengeDimension = 'nutrition' | 'habit' | 'activity'
export type PoolType = 'daily' | 'weekly'

export interface ChallengeTemplate {
  id: string
  emoji: string
  titleCanonicalEn: string
  titleTranslations: Record<string, string>
  challengeType: ChallengeType
  dimension: ChallengeDimension
  ruleTemplate: unknown
  parameterVariants: unknown[]
  difficultyDefault: number
  broccoliRewardMin: number
  broccoliRewardMax: number
  applicableGoals: string[] | null
  starterPool: boolean
  active: boolean
  createdAt: string
  usage: {
    materialized: number
    passed: number
    finalized: number
    passRate: number
  }
}

export interface ChallengeTemplateInput {
  id?: string
  emoji: string
  titleCanonicalEn: string
  titleTranslations?: Record<string, string> | null
  challengeType: ChallengeType
  dimension: ChallengeDimension
  ruleTemplate: unknown
  parameterVariants?: unknown[]
  difficultyDefault?: number
  broccoliRewardMin?: number
  broccoliRewardMax?: number
  applicableGoals?: string[] | null
  starterPool?: boolean
  active?: boolean
}

export const SUPPORTED_LOCALES = ['en', 'vi', 'fr', 'de', 'es', 'pt', 'ko', 'ru'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

// ── skins ───────────────────────────────────────────────────────────────────
export type SkinType = 'free' | 'paid' | 'premium'
export type SkinCategory = 'drinks' | 'nature' | 'weather' | 'effects' | 'festive'

export const SKIN_TYPES: SkinType[] = ['free', 'paid', 'premium']
export const SKIN_CATEGORIES: SkinCategory[] = [
  'drinks',
  'nature',
  'weather',
  'effects',
  'festive',
]

export interface Skin {
  id: string
  name: string
  slug: string
  type: SkinType
  amount: number | null
  category: SkinCategory
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface SkinInput {
  name: string
  slug: string
  type: SkinType
  amount?: number | null
  category: SkinCategory
  active?: boolean
  sortOrder?: number
}
