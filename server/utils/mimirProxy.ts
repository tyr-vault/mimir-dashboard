import type { H3Event } from 'h3'

export const MIMIR_TOKEN_COOKIE = 'mimir-token'
export const MIMIR_USER_COOKIE = 'mimir-user'

export interface MimirApiSuccess<T = unknown> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export interface MimirApiError {
  statusCode: number
  data: null
  message: string
  success: false
  errors?: unknown[]
}

export interface AuthPayload {
  token: string
  user: {
    id: string
    email: string
    name: string
    createdAt?: string
    updatedAt?: string
  }
}

export function getMimirBaseUrl(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const base = config.mimirApiBaseUrl as string
  if (!base) {
    throw createError({
      statusCode: 503,
      message: 'NUXT_MIMIR_API_BASE_URL is not configured'
    })
  }
  return base.replace(/\/$/, '')
}

export function getToken(event: H3Event): string | undefined {
  return getCookie(event, MIMIR_TOKEN_COOKIE)
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, MIMIR_TOKEN_COOKIE, { path: '/' })
  deleteCookie(event, MIMIR_USER_COOKIE, { path: '/' })
}

const cookieSecure = () => !import.meta.dev

export function setAuthCookies(event: H3Event, payload: AuthPayload) {
  setCookie(event, MIMIR_TOKEN_COOKIE, payload.token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
  setCookie(event, MIMIR_USER_COOKIE, JSON.stringify(payload.user), {
    httpOnly: false,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export async function proxyToMimir<T = unknown>(
  event: H3Event,
  path: string,
  options: {
    method?: string
    body?: unknown
    requireAuth?: boolean
  } = {}
): Promise<MimirApiSuccess<T>> {
  const { method = event.method, body, requireAuth = true } = options
  const token = getToken(event)

  if (requireAuth && !token) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  const url = `${getMimirBaseUrl(event)}/${path.replace(/^\//, '')}`
  const query = getQuery(event)

  try {
    const response = await $fetch<MimirApiSuccess<T> | MimirApiError>(url, {
      method: method as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      query,
      body: (body !== undefined
        ? body
        : (method !== 'GET' && method !== 'DELETE' ? await readBody(event).catch(() => undefined) : undefined)) as Record<string, unknown> | undefined,
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined
    })

    if (!response.success) {
      const err = response as MimirApiError
      if (err.statusCode === 401) {
        clearAuthCookies(event)
      }
      throw createError({
        statusCode: err.statusCode || 400,
        message: err.message || 'Request failed'
      })
    }

    return response as MimirApiSuccess<T>
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    const fetchError = error as { data?: MimirApiError, statusCode?: number, message?: string }
    if (fetchError.data && !fetchError.data.success) {
      if (fetchError.data.statusCode === 401) {
        clearAuthCookies(event)
      }
      throw createError({
        statusCode: fetchError.data.statusCode || fetchError.statusCode || 502,
        message: fetchError.data.message || 'Upstream request failed'
      })
    }
    throw createError({
      statusCode: fetchError.statusCode || 502,
      message: fetchError.message || 'Failed to reach Mimir API'
    })
  }
}

export async function postToMimirAuth(
  event: H3Event,
  path: 'auth/login' | 'auth/register',
  body: unknown
): Promise<AuthPayload> {
  const url = `${getMimirBaseUrl(event)}/${path}`

  try {
    const response = await $fetch<MimirApiSuccess<AuthPayload> | MimirApiError>(url, {
      method: 'POST',
      body: body as Record<string, string>
    })

    if (!response.success) {
      const err = response as MimirApiError
      throw createError({
        statusCode: err.statusCode || 400,
        message: err.message || 'Authentication failed'
      })
    }

    return (response as MimirApiSuccess<AuthPayload>).data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    const fetchError = error as { data?: MimirApiError, statusCode?: number }
    if (fetchError.data && !fetchError.data.success) {
      throw createError({
        statusCode: fetchError.data.statusCode || 400,
        message: fetchError.data.message || 'Authentication failed'
      })
    }
    throw createError({
      statusCode: 502,
      message: 'Failed to reach Mimir API'
    })
  }
}
