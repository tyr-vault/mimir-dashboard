<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type {
  CategoryDraftPayload,
  Draft,
  TransactionDraftPayload
} from '~/types'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useMimirApi()
const toast = useToast()

const editOpen = ref(false)
const editingDraft = ref<Draft | null>(null)
const actionLoading = ref<string | null>(null)

const { data: categories } = await useAsyncData(
  'tx-categories',
  () => api.listCategories(),
  { default: () => [] }
)

const { data: drafts, pending, refresh } = await useAsyncData(
  'drafts-pending',
  () => api.listDrafts('pending'),
  { default: () => [] as Draft[] }
)

function draftSummary(draft: Draft): string {
  if (draft.kind === 'transaction') {
    const p = draft.payload as TransactionDraftPayload
    const prefix = p.type === 'income' ? '+' : ''
    const category = p.categoryName?.trim()
      || categories.value?.find(c => c.id === p.categoryId)?.name
      || p.categoryId
      || '—'
    const note = p.note?.trim()
    const mid = note ? `${note} · ${category}` : category
    return `${prefix}${p.amount} · ${p.type} · ${mid} · ${p.date}`
  }
  const p = draft.payload as CategoryDraftPayload
  return p.name
}

function ageLabel(createdAt: string): string {
  const created = new Date(createdAt).getTime()
  const days = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24))
  if (days <= 0) {
    return 'today'
  }
  if (days === 1) {
    return '1 day'
  }
  return `${days} days`
}

function openEdit(draft: Draft) {
  editingDraft.value = draft
  editOpen.value = true
}

async function confirm(draft: Draft) {
  actionLoading.value = draft.id
  try {
    await api.confirmDraft(draft.id)
    toast.add({ title: 'Draft confirmed', color: 'success' })
    await refresh()
    await refreshNuxtData(['transactions', 'categories', 'tx-categories', 'overview-summary', 'overview-recent'])
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Confirm failed',
      color: 'error'
    })
  } finally {
    actionLoading.value = null
  }
}

async function reject(draft: Draft) {
  actionLoading.value = draft.id
  try {
    await api.rejectDraft(draft.id)
    toast.add({ title: 'Draft rejected', color: 'success' })
    await refresh()
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Reject failed',
      color: 'error'
    })
  } finally {
    actionLoading.value = null
  }
}

const columns: TableColumn<Draft>[] = [
  {
    accessorKey: 'kind',
    header: 'Kind',
    cell: ({ row }) =>
      h(UBadge, {
        variant: 'subtle',
        color: row.original.kind === 'transaction' ? 'primary' : 'neutral',
        class: 'capitalize'
      }, () => row.original.kind)
  },
  {
    id: 'summary',
    header: 'Summary',
    cell: ({ row }) => draftSummary(row.original)
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => row.original.source
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString()
  },
  {
    id: 'age',
    header: 'Age',
    cell: ({ row }) => ageLabel(row.original.createdAt)
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
                label: 'Confirm',
                icon: 'i-lucide-check',
                onSelect: () => confirm(row.original)
              },
              {
                label: 'Reject',
                icon: 'i-lucide-x',
                color: 'error',
                onSelect: () => reject(row.original)
              }
            ]]
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              loading: actionLoading.value === row.original.id
            })
        )
      )
  }
]
</script>

<template>
  <UDashboardPanel id="drafts">
    <template #header>
      <UDashboardNavbar title="Drafts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <AppNavbarTrailing>
            <UBadge
              v-if="drafts?.length"
              variant="subtle"
              color="warning"
            >
              {{ drafts.length }} pending
            </UBadge>
            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              square
              @click="refresh()"
            />
          </AppNavbarTrailing>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <p class="text-sm text-muted mb-4">
        Bot creates land here for review. Pending drafts older than 3 days are confirmed automatically.
      </p>

      <div
        v-if="!pending && !(drafts?.length)"
        class="flex flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <UIcon name="i-lucide-inbox" class="size-8 text-muted" />
        <p class="font-medium text-highlighted">
          No pending drafts
        </p>
        <p class="text-sm text-muted max-w-sm">
          When you add expenses or categories from Telegram, they will appear here until confirmed.
        </p>
      </div>

      <UTable
        v-else
        :data="drafts"
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

      <DraftEditModal
        v-model:open="editOpen"
        :draft="editingDraft"
        :categories="categories ?? []"
        @saved="refresh()"
      />
    </template>
  </UDashboardPanel>
</template>
