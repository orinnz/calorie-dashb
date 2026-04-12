// Bot Types
export interface Bot {
  id: string
  anonymousId: string
  displayName: string
  isBot: boolean
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
  threshold?: Threshold
}

export interface ChallengeInstance {
  id: string
  instanceId?: string
  groupId?: string
  inviteCode?: string
  title: string
  challengeType: 'threshold' | 'avoidance' | string
  status: 'active' | 'inactive' | 'cancelled'
  visibility: 'public' | 'private' | 'invite_only'
  startDate?: string
  endDate?: string
  limit?: number | null
  emoji?: string
  fileName?: string | null
  dailyMaxPoints?: number
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
  member: {
    id: string
    challengeGroupId: string
    userId: string
    role: string
  }
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
export interface LeaderboardEntry {
  userId: string
  displayName: string
  isAnonymous: boolean
  totalScore: number
  totalPassDays: number
  lastScoredDate: string
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  total: number
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
  }
  display: {
    badge: string
    isLockedForDate: boolean
  }
}
