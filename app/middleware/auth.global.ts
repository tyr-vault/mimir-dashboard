export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/register']
  const isPublic = publicPaths.includes(to.path)

  const { user, sessionLoaded, fetchSession } = useMimirAuth()

  if (!sessionLoaded.value) {
    await fetchSession()
  }

  if (!user.value && !isPublic) {
    return navigateTo('/login')
  }

  if (user.value && isPublic) {
    return navigateTo('/')
  }
})
