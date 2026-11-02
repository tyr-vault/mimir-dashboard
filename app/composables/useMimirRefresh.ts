const LIST_KEYS = [
  'transactions',
  'tx-categories',
  'categories'
] as const

const OVERVIEW_KEYS = [
  'overview-summary',
  'overview-categories',
  'overview-monthly',
  'overview-recent'
] as const

/**
 * Refresh related useAsyncData keys after create/update/delete mutations.
 * Keys that are not mounted are skipped silently by refreshNuxtData.
 */
export function useMimirRefresh() {
  async function refreshLists() {
    await Promise.all(LIST_KEYS.map(key => refreshNuxtData(key)))
  }

  async function refreshOverview() {
    await Promise.all(OVERVIEW_KEYS.map(key => refreshNuxtData(key)))
  }

  async function refreshAfterTransactionChange() {
    await Promise.all([refreshLists(), refreshOverview()])
  }

  async function refreshAfterCategoryChange() {
    await Promise.all([
      refreshNuxtData('categories'),
      refreshNuxtData('tx-categories'),
      refreshOverview()
    ])
  }

  return {
    refreshLists,
    refreshOverview,
    refreshAfterTransactionChange,
    refreshAfterCategoryChange
  }
}
