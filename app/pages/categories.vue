<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '~/types'

const api = useMimirApi()
const { refreshAfterCategoryChange } = useMimirRefresh()
const createOpen = ref(false)

const { data: categories, pending, refresh } = await useAsyncData(
  'categories',
  () => api.listCategories(),
  { default: () => [] as Category[] }
)

const columns: TableColumn<Category>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => row.original.createdAt
      ? new Date(row.original.createdAt).toLocaleDateString()
      : '—'
  }
]

async function onSaved() {
  await refresh()
  await refreshAfterCategoryChange()
}
</script>

<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <AppNavbarTrailing>
            <UButton
              icon="i-lucide-plus"
              label="Add category"
              @click="createOpen = true"
            />
          </AppNavbarTrailing>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="!pending && !(categories?.length)"
        class="flex flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <div class="rounded-full bg-elevated p-4">
          <UIcon name="i-lucide-tags" class="size-8 text-muted" />
        </div>
        <div>
          <p class="font-medium text-highlighted">
            No categories yet
          </p>
          <p class="text-sm text-muted mt-1 max-w-sm">
            Create categories to organize income and expenses. Rename and delete will be available when the API supports them.
          </p>
        </div>
        <UButton
          icon="i-lucide-plus"
          label="Add category"
          @click="createOpen = true"
        />
      </div>

      <template v-else>
        <p class="text-sm text-muted mb-3">
          Rename and delete will be available when the API supports them.
        </p>

        <UTable
          :data="categories"
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
      </template>

      <CategoryFormModal
        v-model:open="createOpen"
        @saved="onSaved"
      />
    </template>
  </UDashboardPanel>
</template>
