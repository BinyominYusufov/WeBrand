import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_LOGOUT_EVENT, apiFetch } from '../api/client'
import { API_BASE } from '../api/config'
import { login as loginRequest } from '../api/resources'
import { clearTokens, getRefresh, setAccess, setTokens } from '../api/tokens'

type AuthState = {
  status: 'booting' | 'authed' | 'anon'
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthState | undefined>(undefined)

const USER_KEY = 'wb_admin_user'

// Decode the username from a JWT payload (no verification — display only).
function usernameFromAccess(access: string): string | null {
  try {
    const payload = JSON.parse(atob(access.split('.')[1]))
    return payload.username ?? payload.user ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('booting')
  const [username, setUsername] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearTokens()
    localStorage.removeItem(USER_KEY)
    setUsername(null)
    setStatus('anon')
  }, [])

  // On boot: if a refresh token exists, mint a fresh access token to rehydrate.
  useEffect(() => {
    let cancelled = false
    const refresh = getRefresh()
    if (!refresh) {
      setStatus('anon')
      return
    }
    fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (r) => {
        if (cancelled) return
        if (!r.ok) {
          logout()
          return
        }
        const data = await r.json().catch(() => ({}))
        if (data.access) {
          setAccess(data.access)
          setUsername(localStorage.getItem(USER_KEY) || usernameFromAccess(data.access))
          setStatus('authed')
        } else {
          logout()
        }
      })
      .catch(() => {
        if (!cancelled) logout()
      })
    return () => {
      cancelled = true
    }
  }, [logout])

  // Forced logout from the fetch wrapper when a refresh fails mid-session.
  useEffect(() => {
    const onLogout = () => logout()
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout)
  }, [logout])

  const login = useCallback(async (user: string, password: string) => {
    const { access, refresh } = await loginRequest(user, password)
    setTokens(access, refresh)
    const name = usernameFromAccess(access) || user
    localStorage.setItem(USER_KEY, name)
    setUsername(name)
    setStatus('authed')
  }, [])

  return (
    <Ctx.Provider value={{ status, username, login, logout }}>{children}</Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Re-export so callers can use the authed fetch if needed.
export { apiFetch }
