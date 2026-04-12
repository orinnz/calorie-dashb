import { apiClient } from './client'
import type { BotsResponse, AuthResponse } from '../types'

export const authApi = {
  getBots: async () => {
    const response = await apiClient.get<BotsResponse>('/api/auth/bots')
    return response.data
  },

  loginAsBot: async (anonymousId: string) => {
    const response = await apiClient.post<AuthResponse>('/api/auth/anonymous', {
      anonymous_id: anonymousId,
    })
    return response.data
  },
}
