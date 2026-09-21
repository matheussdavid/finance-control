import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import { clearToken, getStoredUser, getToken, setStoredUser, setToken } from '../services/api'
import type { UserSummary } from '../types'

interface AuthContextValue {
  user: UserSummary | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, username: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => getStoredUser<UserSummary>())
  const [token, setTokenState] = useState<string | null>(() => getToken())

  const applyAuth = useCallback((response: { token: string; user: UserSummary }) => {
    setToken(response.token)
    setStoredUser(response.user)
    setUser(response.user)
    setTokenState(response.token)
  }, [])

  const login = useCallback(
    async (identifier: string, password: string) => {
      const response = await authService.login({ identifier, password })
      applyAuth(response)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (name: string, username: string, email: string, password: string, confirmPassword: string) => {
      const response = await authService.register({ name, username, email, password, confirmPassword })
      applyAuth(response)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setTokenState(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(token), login, register, logout }),
    [user, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}