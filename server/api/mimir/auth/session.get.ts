import { getToken, MIMIR_USER_COOKIE } from '../../../utils/mimirProxy'

export default defineEventHandler((event) => {
  const token = getToken(event)
  const userRaw = getCookie(event, MIMIR_USER_COOKIE)

  if (!token || !userRaw) {
    return { authenticated: false, user: null }
  }

  try {
    const user = JSON.parse(userRaw)
    return { authenticated: true, user }
  } catch {
    return { authenticated: false, user: null }
  }
})
