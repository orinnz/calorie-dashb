import { apiClient } from './client'
import type {
  AdminLoginResponse,
  AdminTokens,
  ChallengeTemplate,
  ChallengeTemplateInput,
  ChallengesAnalyticsResponse,
  FoodLoggingResponse,
  GrowthResponse,
  MonetizationResponse,
  OverviewResponse,
  PoolType,
  Skin,
  SkinInput,
} from '#/types'

export const adminApi = {
  // ── auth ──
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    const { data } = await apiClient.post<AdminLoginResponse>('/api/admin/login', {
      username,
      password,
    })
    return data
  },

  async refresh(refresh_token: string): Promise<AdminTokens> {
    const { data } = await apiClient.post<AdminTokens>('/api/admin/refresh', { refresh_token })
    return data
  },

  async me(): Promise<{ admin: AdminLoginResponse['admin'] }> {
    const { data } = await apiClient.get('/api/admin/me')
    return data
  },

  // ── analytics ──
  async overview(): Promise<OverviewResponse> {
    const { data } = await apiClient.get<OverviewResponse>('/api/admin/analytics/overview')
    return data
  },

  async growth(days: number): Promise<GrowthResponse> {
    const { data } = await apiClient.get<GrowthResponse>('/api/admin/analytics/growth', {
      params: { days },
    })
    return data
  },

  async foodLogging(days: number): Promise<FoodLoggingResponse> {
    const { data } = await apiClient.get<FoodLoggingResponse>(
      '/api/admin/analytics/food-logging',
      { params: { days } },
    )
    return data
  },

  async challenges(days: number): Promise<ChallengesAnalyticsResponse> {
    const { data } = await apiClient.get<ChallengesAnalyticsResponse>(
      '/api/admin/analytics/challenges',
      { params: { days } },
    )
    return data
  },

  async monetization(days: number): Promise<MonetizationResponse> {
    const { data } = await apiClient.get<MonetizationResponse>(
      '/api/admin/analytics/monetization',
      { params: { days } },
    )
    return data
  },

  // ── challenge pool CRUD ──
  async listTemplates(type: PoolType): Promise<ChallengeTemplate[]> {
    const { data } = await apiClient.get<{ templates: ChallengeTemplate[] }>(
      `/api/admin/challenge-pool/${type}`,
    )
    return data.templates
  },

  async createTemplate(type: PoolType, input: ChallengeTemplateInput): Promise<ChallengeTemplate> {
    const { data } = await apiClient.post<ChallengeTemplate>(
      `/api/admin/challenge-pool/${type}`,
      input,
    )
    return data
  },

  async updateTemplate(
    type: PoolType,
    id: string,
    input: Partial<ChallengeTemplateInput>,
  ): Promise<ChallengeTemplate> {
    const { data } = await apiClient.patch<ChallengeTemplate>(
      `/api/admin/challenge-pool/${type}/${id}`,
      input,
    )
    return data
  },

  async deleteTemplate(type: PoolType, id: string): Promise<{ ok: boolean; id: string }> {
    const { data } = await apiClient.delete(`/api/admin/challenge-pool/${type}/${id}`)
    return data
  },

  // ── skins CRUD ──
  async listSkins(): Promise<Skin[]> {
    const { data } = await apiClient.get<{ skins: Skin[] }>('/api/admin/skins')
    return data.skins
  },

  async createSkin(input: SkinInput): Promise<Skin> {
    const { data } = await apiClient.post<Skin>('/api/admin/skins', input)
    return data
  },

  async updateSkin(id: string, input: Partial<SkinInput>): Promise<Skin> {
    const { data } = await apiClient.patch<Skin>(`/api/admin/skins/${id}`, input)
    return data
  },

  async deleteSkin(id: string): Promise<{ ok: boolean; id: string }> {
    const { data } = await apiClient.delete(`/api/admin/skins/${id}`)
    return data
  },
}
