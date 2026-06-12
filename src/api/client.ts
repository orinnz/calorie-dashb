import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { AdminTokens } from '#/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787'

const APP_CHECK_BYPASS_KEY = (import.meta.env.VITE_APP_CHECK_BYPASS_KEY ||
  'dev-bypass-key-change-me-for-prod') as string | undefined

const ACCESS_KEY = 'admin_access_token'
const REFRESH_KEY = 'admin_refresh_token'

let accessToken: string | null = null
let refreshToken: string | null = null

const isBrowser = typeof window !== 'undefined'

export function loadTokensFromStorage(): { accessToken: string | null; refreshToken: string | null } {
  if (isBrowser) {
    accessToken = window.localStorage.getItem(ACCESS_KEY)
    refreshToken = window.localStorage.getItem(REFRESH_KEY)
  }
  return { accessToken, refreshToken }
}

export function setTokens(tokens: AdminTokens) {
  accessToken = tokens.accessToken
  refreshToken = tokens.refreshToken
  if (isBrowser) {
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken)
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  }
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  if (isBrowser) {
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
  }
}

export const getAccessToken = () => accessToken

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (APP_CHECK_BYPASS_KEY) {
    config.headers['X-AppCheck-Bypass'] = APP_CHECK_BYPASS_KEY
  }
  return config
})

// ── single-flight refresh on 401 ──────────────────────────────────────────────
let refreshing: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  if (!refreshToken) return null
  try {
    const { data } = await axios.post<AdminTokens>(
      `${API_BASE_URL}/api/admin/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    setTokens(data)
    return data.accessToken
  } catch {
    clearTokens()
    return null
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url: string = original?.url ?? ''
    const isAuthCall = url.includes('/api/admin/login') || url.includes('/api/admin/refresh')

    if (status === 401 && original && !original._retry && !isAuthCall && refreshToken) {
      original._retry = true
      refreshing = refreshing ?? doRefresh()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
      if (isBrowser) window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
