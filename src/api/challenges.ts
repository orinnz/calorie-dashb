import { apiClient } from './client'
import type {
  ChallengeInstance,
  QuickCreateChallengeRequest,
  JoinGroupResponse,
  LeaderboardResponse,
  ChallengeState,
} from '../types'

export const challengesApi = {
  quickCreate: async (data: QuickCreateChallengeRequest) => {
    const response = await apiClient.post<ChallengeInstance>(
      '/api/challenges/quick-create',
      data
    )
    return response.data
  },

  getMyInstances: async () => {
    const response = await apiClient.get<{ instances: any[] }>(
      '/api/challenges/me/instances'
    )
    // Map API response to ensure instanceId and groupId are available
    return response.data.instances.map((item: any) => ({
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

  updateVisibility: async (instanceId: string, visibility: string) => {
    const response = await apiClient.patch(`/api/challenges/instances/${instanceId}`, {
      visibility,
    })
    return response.data
  },

  cancelChallenge: async (instanceId: string) => {
    const response = await apiClient.post(
      `/api/challenges/instances/${instanceId}/cancel`
    )
    return response.data
  },

  leaveGroup: async (groupId: string) => {
    const response = await apiClient.post(
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
}
