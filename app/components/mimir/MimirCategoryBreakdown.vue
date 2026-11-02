<script setup lang="ts">
import type { CategorySummaryItem } from '~/types'

const props = defineProps<{
  items: CategorySummaryItem[]
  pending?: boolean
}>()

const maxTotal = computed(() =>
  Math.max(...props.items.map(i => i.total), 1)
)
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-highlighted">
        Spending by category
      </h3>
    </template>

    <div v-if="pending" class="space-y-3">
      <USkeleton v-for="i in 4" :key="i" class="h-8" />
    </div>

    <div v-else-if="items.length === 0" class="text-sm text-muted py-4 text-center">
      No category data for this period.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="item in items"
        :key="item.categoryId"
        class="space-y-1"
      >
        <div class="flex justify-between text-sm gap-2">
          <span class="font-medium truncate">{{ item.name }}</span>
          <MoneyFormat :value="item.total" />
        </div>
        <UProgress
          :model-value="(item.total / maxTotal) * 100"
          color="primary"
          size="sm"
        />
      </li>
    </ul>
  </UCard>
</template>
