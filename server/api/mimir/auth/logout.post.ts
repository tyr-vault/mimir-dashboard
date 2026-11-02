import { clearAuthCookies } from '../../../utils/mimirProxy'

export default defineEventHandler((event) => {
  clearAuthCookies(event)
  return { success: true }
})
