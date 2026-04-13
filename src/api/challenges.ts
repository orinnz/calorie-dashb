import { apiClient } from './client'
import type {
  ChallengeInstance,
  QuickCreateChallengeRequest,
  JoinGroupResponse,
  LeaderboardResponse,
  ChallengeState,
  FoodEvaluationsResponse,
  ChallengeUpdateRequest,
  ApiActionResponse,
  PaginatedResponse,
  PublicChallengeListItem,
  ChallengeHistoryResponse,
} from '../types'

export const challengesApi = {
  quickCreate: async (data: QuickCreateChallengeRequest) => {
    const response = await apiClient.post<ChallengeInstance>(
      '/api/challenges/quick-create',
      data
    )
    return response.data
  },

  listPublic: async (page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<PublicChallengeListItem>>(
      '/api/challenges/public',
      {
        params: { page, limit },
      }
    )
    return response.data
  },

  getMyInstances: async () => {
    const response = await apiClient.get<ChallengeInstance[] | { instances: ChallengeInstance[] }>(
      '/api/challenges/me/instances'
    )

    const rawInstances = Array.isArray(response.data)
      ? response.data
      : response.data.instances || []

    // Map API response to ensure instanceId and groupId are available
    return rawInstances.map((item) => ({
      ...item,
      instanceId: item.id,
      groupId: item.group?.id,
      inviteCode: item.group?.inviteCode,
    })) as ChallengeInstance[]
  },

  joinByCode: async (inviteCode: string) => {
    const response = await apiClient.post<JoinGroupResponse>(
      '/api/challenges/groups/join-by-code',
      { inviteCode }
    )
    return response.data
  },

  joinGroup: async (groupId: string) => {
    const response = await apiClient.post<JoinGroupResponse>(
      `/api/challenges/groups/${groupId}/join`
    )
    return response.data
  },

  updateChallenge: async (instanceId: string, data: ChallengeUpdateRequest) => {
    const response = await apiClient.patch<ApiActionResponse>(
      `/api/challenges/instances/${instanceId}`,
      data
    )
    return response.data
  },

  cancelChallenge: async (instanceId: string) => {
    const response = await apiClient.post<ApiActionResponse>(
      `/api/challenges/instances/${instanceId}/cancel`
    )
    return response.data
  },

  leaveGroup: async (groupId: string) => {
    const response = await apiClient.post<ApiActionResponse>(
      `/api/challenges/groups/${groupId}/leave`
    )
    return response.data
  },

  getLeaderboard: async (instanceId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<LeaderboardResponse>(
      `/api/challenges/instances/${instanceId}/leaderboard`,
      {
        params: { page, limit },
      }
    )
    return response.data
  },

  getState: async (instanceId: string, date: string) => {
    const response = await apiClient.get<ChallengeState>(
      `/api/challenges/instances/${instanceId}/me/state`,
      {
        params: { date },
      }
    )
    return response.data
  },

  getHistory: async (instanceId: string) => {
    const response = await apiClient.get<ChallengeHistoryResponse>(
      `/api/challenges/instances/${instanceId}/me/history`
    )
    return response.data
  },

  getFoodEvaluations: async (instanceId: string, date: string) => {
    const response = await apiClient.get<FoodEvaluationsResponse>(
      `/api/challenges/instances/${instanceId}/me/food-evaluations`,
      {
        params: { date },
      }
    )
    return response.data
  },
}
