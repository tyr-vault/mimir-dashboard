import { proxyToMimir } from '../../utils/mimirProxy'

export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, 'path')
  if (!pathParam) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const path = pathParam.replace(/,/g, '/')

  if (path.startsWith('auth/')) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const method = event.method
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const response = await proxyToMimir(event, path, { method })
  return response
})
