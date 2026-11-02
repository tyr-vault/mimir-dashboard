<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Range, Transaction, TransactionType } from '~/types'
import { rangeToQuery, thisMonthRange } from '~/utils/mimir'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useMimirApi()
const toast = useToast()
const { refreshAfterTransactionChange } = useMimirRefresh()

const range = shallowRef<Range>(thisMonthRange())

const typeFilter = ref<'all' | TransactionType>('all')
const categoryFilter = ref<string | 'all'>('all')
const page = ref(1)
const pageSize = 20

const formOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)

const deleteOpen = ref(false)
const deletingTransaction = ref<Transaction | null>(null)
const deleteLoading = ref(false)

const { data: categories } = await useAsyncData(
  'tx-categories',
  () => api.listCategories(),
  { default: () => [] }
)

const listQuery = computed(() => {
  const { from, to } = rangeToQuery(range.value)
  return {
    from,
    to,
    type: typeFilter.value === 'all' ? undefined : typeFilter.value,
    categoryId: categoryFilter.value === 'all' ? undefined : categoryFilter.value,
    limit: pageSize,
    offset: (page.value - 1) * pageSize
  }
})

const { data: transactions, pending, refresh } = await useAsyncData(
  'transactions',
  () => api.listTransactions(listQuery.value),
  { watch: [listQuery], default: () => [] as Transaction[] }
)

watch([typeFilter, categoryFilter, range], () => {
  page.value = 1
})

function openCreate() {
  editingTransaction.value = null
  formOpen.value = true
}

function openEdit(tx: Transaction) {
  editingTransaction.value = tx
  formOpen.value = true
}

function openDelete(tx: Transaction) {
  deletingTransaction.value = tx
  deleteOpen.value = true
}

async function onSaved() {
  await refresh()
  await refreshAfterTransactionChange()
}

async function confirmDelete() {
  const tx = deletingTransaction.value
  if (!tx) {
    return
  }
  deleteLoading.value = true
  try {
    await api.deleteTransaction(tx.id)
    toast.add({ title: 'Transaction deleted', color: 'success' })
    deleteOpen.value = false
    deletingTransaction.value = null
    await onSaved()
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Delete failed',
      color: 'error'
    })
  } finally {
    deleteLoading.value = false
  }
}

const columns: TableColumn<Transaction>[] = [
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => row.original.categoryName || '—'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) =>
      h(UBadge, {
        variant: 'subtle',
        color: row.original.type === 'income' ? 'primary' : 'neutral',
        class: 'capitalize'
      }, () => row.original.type)
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      h('span', { class: 'font-medium tabular-nums' }, [
        h(resolveComponent('MoneyFormat'), {
          value: row.original.amount
        })
      ])
  },
  {
    accessorKey: 'note',
    header: 'Note',
    cell: ({ row }) => row.original.note || '—'
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: { align: 'end' },
            items: [[
              {
                label: 'Edit',
                icon: 'i-lucide-pencil',
                onSelect: () => openEdit(row.original)
              },
              {
                label: 'Delete',
                icon: 'i-lucide-trash',
                color: 'error',
                onSelect: () => openDelete(row.original)
              }
            ]]
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost'
            })
        )
      )
  }
]

const categoryItems = computed(() => [
  { label: 'All categories', value: 'all' },
  ...((categories.value ?? []).map(c => ({ label: c.name, value: c.id })))
])

const typeItems = [
  { label: 'All types', value: 'all' },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' }
]

const deleteMessage = computed(() => {
  const tx = deletingTransaction.value
  if (!tx) {
    return 'This action cannot be undone.'
  }
  return `Delete the ${tx.type} of ${tx.amount} on ${tx.date}? This cannot be undone.`
})
</script>

<template>
  <UDashboardPanel id="transactions">
    <template #header>
      <UDashboardNavbar title="Transactions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <AppNavbarTrailing>
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
          <USelect
            v-model="typeFilter"
            :items="typeItems"
            class="min-w-32"
          />
          <USelect
            v-model="categoryFilter"
            :items="categoryItems"
            class="min-w-40"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UTable
        :data="transactions"
        :columns="columns"
        :loading="pending"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
      />

      <div class="flex items-center justify-between pt-4 border-t border-default mt-4">
        <p class="text-sm text-muted">
          Page {{ page }} · {{ transactions?.length ?? 0 }} rows
        </p>
        <div class="flex gap-2">
          <UButton
            label="Previous"
            color="neutral"
            variant="outline"
            :disabled="page <= 1"
            @click="page--"
          />
          <UButton
            label="Next"
            color="neutral"
            variant="outline"
            :disabled="(transactions?.length ?? 0) < pageSize"
            @click="page++"
          />
        </div>
      </div>

      <TransactionFormModal
        v-model:open="formOpen"
        :categories="categories ?? []"
        :transaction="editingTransaction"
        @saved="onSaved"
      />

      <ConfirmDeleteModal
        v-model:open="deleteOpen"
        title="Delete transaction"
        :message="deleteMessage"
        :loading="deleteLoading"
        @confirm="confirmDelete"
      />
    </template>
  </UDashboardPanel>
</template>
