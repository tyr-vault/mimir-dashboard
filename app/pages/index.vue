<script setup lang="ts">
import type { Range, Transaction } from '~/types'
import { rangeToQuery, thisMonthRange } from '~/utils/mimir'

const api = useMimirApi()
const { refreshAfterTransactionChange } = useMimirRefresh()

const range = shallowRef<Range>(thisMonthRange())

const queryParams = computed(() => rangeToQuery(range.value))
const year = computed(() => range.value.end.getFullYear())

const formOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const { data: categories } = await useAsyncData(
  'tx-categories',
  () => api.listCategories(),
  { default: () => [] }
)

const { data: summary, pending: summaryPending, refresh: refreshSummary } = await useAsyncData(
  'overview-summary',
  () => api.getPeriodSummary(queryParams.value),
  { watch: [queryParams] }
)

const { data: categorySummary, pending: categoryPending, refresh: refreshCategories } = await useAsyncData(
  'overview-categories',
  () => api.getCategorySummary({ ...queryParams.value, type: 'expense' }),
  { watch: [queryParams] }
)

const { data: monthlySummary, pending: monthlyPending, refresh: refreshMonthly } = await useAsyncData(
  'overview-monthly',
  () => api.getMonthlySummary({ year: year.value }),
  { watch: [year] }
)

const { data: recentTransactions, pending: recentPending, refresh: refreshRecent } = await useAsyncData(
  'overview-recent',
  () => api.listTransactions({ ...queryParams.value, limit: 10 }),
  { watch: [queryParams] }
)

function refreshAll() {
  refreshSummary()
  refreshCategories()
  refreshMonthly()
  refreshRecent()
}

function openCreate() {
  editingTransaction.value = null
  formOpen.value = true
}

function openEdit(tx: Transaction) {
  editingTransaction.value = tx
  formOpen.value = true
}

async function onSaved() {
  refreshAll()
  await refreshAfterTransactionChange()
}
</script>

<template>
  <UDashboardPanel id="overview">
    <template #header>
      <UDashboardNavbar title="Overview">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <AppNavbarTrailing>
            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              square
              @click="refreshAll"
            />
            <UButton
              icon="i-lucide-plus"
              label="Add transaction"
              @click="openCreate"
            />
          </AppNavbarTrailing>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ms-1" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <MimirOverviewStats :summary="summary" :pending="summaryPending" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MimirCategoryBreakdown
            :items="categorySummary ?? []"
            :pending="categoryPending"
          />
          <MimirMonthlySummary
            :items="monthlySummary ?? []"
            :year="year"
            :pending="monthlyPending"
          />
        </div>

        <MimirRecentTransactions
          :transactions="recentTransactions ?? []"
          :pending="recentPending"
          @edit="openEdit"
        />
      </div>

      <TransactionFormModal
        v-model:open="formOpen"
        :categories="categories ?? []"
        :transaction="editingTransaction"
        @saved="onSaved"
      />
    </template>
  </UDashboardPanel>
</template>
