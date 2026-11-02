import { postToMimirAuth, setAuthCookies } from '../../../utils/mimirProxy'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = await postToMimirAuth(event, 'auth/register', body)
  setAuthCookies(event, payload)
  return { user: payload.user }
})
