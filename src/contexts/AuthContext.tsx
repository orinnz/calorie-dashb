import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { adminApi } from '#/api/admin'
import { clearTokens, loadTokensFromStorage, setTokens } from '#/api/client'
import type { AdminUser } from '#/types'

interface AuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  isReady: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_KEY = 'admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount (client-only).
  useEffect(() => {
    const { accessToken } = loadTokensFromStorage()
    const storedAdmin = window.localStorage.getItem(ADMIN_KEY)
    if (accessToken && storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin))
      } catch {
        window.localStorage.removeItem(ADMIN_KEY)
      }
    }
    setIsReady(true)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await adminApi.login(username, password)
      setTokens(res.tokens)
      setAdmin(res.admin)
      window.localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setAdmin(null)
    setError(null)
    window.localStorage.removeItem(ADMIN_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, isLoading, isReady, error, login, logout }}>
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
