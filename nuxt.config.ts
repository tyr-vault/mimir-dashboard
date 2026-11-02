// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],

  // Flat names for app/components/** (TransactionFormModal, ConfirmDeleteModal, …)
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  // Avoid @nuxt/fonts fetching fonts.google.com at dev/build (offline/VPN/firewall).
  ui: {
    fonts: false
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'mimir-color-mode'
  },

  runtimeConfig: {
    mimirApiBaseUrl: 'http://localhost:5000'
  },

  devServer: {
    port: 3000
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  vite: {
    optimizeDeps: {
      include: ['date-fns', 'zod']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
