import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiClient, setAccessToken } from '../api/client'
import { authApi } from '../api/auth'
import type { AuthUser, Bot } from '../types'

/**
 * Best-effort backfill so the bot's `user_profiles.timezone` matches the
 * machine running the dashboard. Without this, fresh anonymous bots stay on
 * the schema default `'UTC'` and cron-window pushes (`daily_food_log_nudge`
 * 19–21h local, `streak_at_risk` 20–22h, etc.) fire at the wrong wall-clock
 * time. The backend has its own opportunistic backfill from
 * `request.cf.timezone`, but that's empty in `wrangler dev`, so this client
 * call covers local QA. Errors are swallowed — the rest of the dashboard
 * must keep working even if `PUT /profile` 4xx's for any reason.
 */
async function syncBrowserTimezone(): Promise<void> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz || tz === 'UTC') return
    await apiClient.put('/api/user/profile', { timezone: tz })
  } catch (err) {
    console.warn('Timezone sync skipped:', err)
  }
}

interface AuthContextType {
  currentUser: AuthUser | null
  currentBot: Bot | null
  isLoading: boolean
  error: string | null
  bots: Bot[]
  loginAsBot: (bot: Bot) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'auth_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [currentBot, setCurrentBot] = useState<Bot | null>(null)
  const [bots, setBots] = useState<Bot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBots = useCallback(async () => {
    try {
      const data = await authApi.getBots()
      setBots(data.bots)
    } catch (err) {
      console.error('Failed to fetch bots:', err)
    }
  }, [])

  // Restore auth from localStorage on mount
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const { user, bot, token } = JSON.parse(stored)
          setCurrentUser(user)
          setCurrentBot(bot)
          setAccessToken(token)
          // Re-sync on restore too — covers the case where a tester opens
          // the dashboard from a different machine / timezone than last login.
          void syncBrowserTimezone()
        }
      } catch (err) {
        console.error('Failed to restore auth:', err)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    restoreAuth()
    fetchBots()
  }, [fetchBots])

  const loginAsBot = useCallback(async (bot: Bot) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.loginAsBot(bot.anonymousId)
      setCurrentUser(response.user)
      setCurrentBot(bot)
      setAccessToken(response.tokens.accessToken)

      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: response.user,
          bot: bot,
          token: response.tokens.accessToken,
        })
      )

      // Fire-and-forget — runs after token is set so the request carries auth.
      // Don't block login if it fails.
      void syncBrowserTimezone()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCurrentBot(null)
    setAccessToken(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentBot,
        isLoading,
        error,
        bots,
        loginAsBot,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
