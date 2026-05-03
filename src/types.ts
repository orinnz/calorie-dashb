// Bot Types
export type BotRegion = 'vn' | 'intl'

export interface Bot {
  id: string
  anonymousId: string
  displayName: string
  isBot: boolean
  // IANA timezone from user_profiles.timezone (e.g. 'Asia/Ho_Chi_Minh').
  timezone: string
  // Derived from timezone: 'vn' for Asia/Ho_Chi_Minh, otherwise 'intl'.
  region: BotRegion
}

export interface BotsResponse {
  bots: Bot[]
}

// Auth Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email?: string
  displayName: string
  isBot: boolean
  anonymousId: string
  timezone?: string
  region?: BotRegion
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

// Challenge Types
export interface Threshold {
  metric: 'water_ml' | 'calories' | 'protein' | 'carbs'
  operator: 'gte' | 'lte' | 'eq'
  target: number
}

export interface QuickCreateChallengeRequest {
  groupName: string
  visibility: 'public' | 'private' | 'invite_only'
  durationDays?: number
  threshold?: Threshold
}

export interface ChallengeInstance {
  id: string
  instanceId?: string
  groupId?: string
  inviteCode?: string
  title: string
  challengeType: 'threshold' | 'avoidance' | string
  status: 'active' | 'inactive' | 'cancelled' | 'completed'
  visibility: 'public' | 'private' | 'invite_only'
  startDate?: string
  endDate?: string
  limit?: number | null
  emoji?: string
  fileName?: string | null
  dailyMaxPoints?: number
  totalScore?: number
  totalPassDays?: number
  rule?: {
    type: string
    metric: string
    operator: string
    target: number
    dailyMaxPoints?: number
    scoring?: string
    titleIntent?: string
  }
  group: {
    id: string
    name?: string
    inviteCode: string
    role: 'owner' | 'member'
    joinedAt?: string
  }
}

export interface JoinGroupResponse {
  joined: boolean
  message?: string
  member: {
    id: string
    challengeGroupId: string
    userId: string
    role: string
  }
}

export interface ChallengeUpdateRequest {
  visibility?: 'public' | 'private' | 'invite_only'
  endDate?: string
}

export interface ApiActionResponse {
  success: boolean
  message: string
}

// Daily Record Types
export interface FoodLogRequest {
  name: string
  descriptionText: string
  calories: number
  protein: number
  fileName?: string
}

export interface FoodLog {
  id: string
  name: string
  calories: number
  protein?: number
}

export interface DailyRecord {
  id: string
  date: string
  totalCaloriesIntake: number
  totalWaterIntake?: number
  foodLogs: FoodLog[]
}

// Leaderboard Types
export interface LeaderboardTodayProgress {
  status: 'IN_PROGRESS' | 'PASS' | 'FAIL'
  progress: number
  isAchieved: boolean
  actual: number | null
  target: number | null
  metric: string | null
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  isAnonymous: boolean
  totalScore: number
  totalPassDays: number
  currentStreak: number
  lastScoredDate: string | null
  todayProgress: LeaderboardTodayProgress | null
}

export interface LeaderboardScoringInfo {
  lastFinalizedDate: string | null
  nextUpdateAt: string | null
  todayDate: string
  note: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  pagination: {
    limit: number
    page: number
    totalPages: number
    total: number
  }
  scoringInfo: LeaderboardScoringInfo
}

// State Types
export interface ChallengeState {
  instanceId: string
  date: string
  ruleType: string
  official: {
    exists: boolean
    status: string | null
  }
  temporary: {
    status: 'PASS_TEMP' | 'FAIL_TEMP' | 'PENDING'
    progress: number
    target: number
    tempScoreProjection: number
  }
  display: {
    badge: string
    isLockedForDate: boolean
  }
}

export interface WaterLogItem {
  waterLogId: string
  amountMl: number
  timestamp: string
}

export interface ChallengeHistoryEntry {
  date: string
  status: 'pass' | 'fail' | 'partial' | string
  score: number
  progress: number
  actual: number | null
  target: number | null
  isFinalized: boolean
  failReason: string | null
  foodEvaluations?: FoodEvaluationItem[]
  waterLogs?: WaterLogItem[]
}

export interface ChallengeHistoryResponse {
  instanceId: string
  history: ChallengeHistoryEntry[]
}

// Food AI Evaluation Types
export type FoodEvaluationStatus = 'eligible' | 'ineligible' | 'unknown' | 'pending' | 'error'

export interface FoodEvaluationResult {
  status: FoodEvaluationStatus
  confidence: number
  reason: string
  evaluatedAt: string
}

export interface FoodEvaluationItem {
  foodLogId: string
  foodName: string
  calories: number
  fileName: string | null
  imageUrl: string | null
  evaluation: FoodEvaluationResult | null
}

export interface FoodEvaluationsResponse {
  date: string
  items: FoodEvaluationItem[]
}

// Public Challenge Types
export interface PublicChallengeListItem {
  id: string
  groupId: string
  title: string
  challengeType: 'threshold' | 'avoidance' | 'positive' | string
  startDate: string
  endDate: string
  limit: number | null
  emoji: string | null
  status: 'active' | 'completed' | 'cancelled'
  dailyMaxPoints: number
  createdAt: string
  memberCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    limit: number
    page: number
    totalPages: number
    total: number
  }
}

// Subscription Admin Types
export type SubscriptionStatus =
  | 'active'
  | 'in_grace'
  | 'paused'
  | 'expired'
  | 'refunded'

export interface AdminUserListItem {
  userId: string
  displayName: string | null
  fileName: string | null
  isAnonymous: boolean
  isBot: boolean
  isPremium: boolean
  premiumExpiresAt: string | null
  eventCount: number
  lastEventType: string
  lastEventAt: string
}

export interface AdminSubscription {
  id: string
  userId: string
  revenuecatCustomerId: string
  productId: string
  store: string
  environment: string
  status: SubscriptionStatus
  autoRenew: boolean
  periodType: string | null
  originalTransactionId: string
  currentPeriodStartedAt: string
  currentPeriodExpiresAt: string
  gracePeriodExpiresAt: string | null
  cancelReason: string | null
  expirationReason: string | null
  priceInPurchasedCurrency: number | null
  currency: string | null
  entitlementIds: string[]
  createdAt: string
  updatedAt: string
}

export type AdminEventStatus = 'received' | 'processed' | 'failed' | 'skipped'

export interface AdminEvent {
  eventId: string
  eventType: string
  status: AdminEventStatus
  note: string | null
  receivedAt: string
  processedAt: string | null
  eventTimestampAt: string
  payload: unknown
  payloadParseError?: string
}

export interface AdminUserDetail {
  user: {
    id: string
    displayName: string | null
    fileName: string | null
    isAnonymous: boolean
    isBot: boolean
    isPremium: boolean
    premiumExpiresAt: string | null
  } | null
  currentSubscription: AdminSubscription | null
  allSubscriptions: AdminSubscription[]
  events: AdminEvent[]
  eventsTruncated: boolean
}
