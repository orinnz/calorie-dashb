import { apiClient } from './client'

export type NotificationCategory = 'engagement' | 'challenge'

export interface NotificationPreference {
  type: string
  enabled: boolean
  defaultEnabled: boolean
  category: NotificationCategory
}

export type NotificationOutcome =
  | 'sent'
  | 'skipped_pref'
  | 'skipped_quiet'
  | 'skipped_dedup'
  | 'skipped_no_tokens'
  | 'skipped_disabled'
  | 'failed'

export type FcmDebugStatus = 'sent' | 'unregistered' | 'failed'

export interface FcmDebugResult {
  status: FcmDebugStatus
  token: string
  httpStatus?: number
  body?: string
}

export interface RegisterPushTokenRequest {
  token: string
  platform: 'ios' | 'android' | 'web'
  deviceId?: string
  locale?: string
  appVersion?: string
}

export interface RegisterPushTokenResponse {
  id: string
  platform: string
  locale: string | null
  createdAt: string
}

export const notificationsApi = {
  getPreferences: async () => {
    const response = await apiClient.get<{ preferences: NotificationPreference[] }>(
      '/api/user/notification-preferences'
    )
    return response.data.preferences
  },

  updatePreference: async (type: string, enabled: boolean) => {
    const response = await apiClient.patch<{ ok: true }>(
      '/api/user/notification-preferences',
      { type, enabled }
    )
    return response.data
  },

  registerPushToken: async (data: RegisterPushTokenRequest) => {
    const response = await apiClient.post<RegisterPushTokenResponse>(
      '/api/user/push-token',
      data
    )
    return response.data
  },

  deletePushToken: async (token: string) => {
    const response = await apiClient.delete<{ ok: true }>('/api/user/push-token', {
      data: { token },
    })
    return response.data
  },

  sendTest: async (
    type: string,
    options?: { context?: Record<string, unknown>; force?: boolean }
  ) => {
    const response = await apiClient.post<{ outcome: NotificationOutcome }>(
      '/api/user/notifications/send-test',
      { type, context: options?.context, force: options?.force }
    )
    return response.data
  },

  fcmDebug: async (input: {
    token: string
    title?: string
    body?: string
    data?: Record<string, unknown>
  }) => {
    const response = await apiClient.post<{ result: FcmDebugResult }>(
      '/api/user/notifications/fcm-debug',
      input
    )
    return response.data.result
  },
}
