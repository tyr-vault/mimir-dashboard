import type { User } from '~/types'
import { MimirApiClientError } from '~/utils/mimir'

interface SessionResponse {
  authenticated: boolean
  user: User | null
}

export function useMimirAuth() {
  const user = useState<User | null>('mimir-user', () => null)
  const sessionLoaded = useState('mimir-session-loaded', () => false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    const fetchSessionRequest = useRequestFetch()
    try {
      const session = await fetchSessionRequest<SessionResponse>('/api/mimir/auth/session')
      user.value = session.authenticated ? session.user : null
    } catch {
      user.value = null
    } finally {
      sessionLoaded.value = true
    }
  }

  async function login(email: string, password: string) {
    try {
      const result = await $fetch<{ user: User }>('/api/mimir/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = result.user
      sessionLoaded.value = true
      return result.user
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }, message?: string }
      throw new MimirApiClientError(
        err.data?.message || err.message || 'Login failed',
        (error as { statusCode?: number }).statusCode || 401
      )
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const result = await $fetch<{ user: User }>('/api/mimir/auth/register', {
        method: 'POST',
        body: { name, email, password }
      })
      user.value = result.user
      sessionLoaded.value = true
      return result.user
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }, message?: string }
      throw new MimirApiClientError(
        err.data?.message || err.message || 'Registration failed',
        (error as { statusCode?: number }).statusCode || 400
      )
    }
  }

  async function logout() {
    await $fetch('/api/mimir/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    sessionLoaded,
    isAuthenticated,
    fetchSession,
    login,
    register,
    logout
  }
}
