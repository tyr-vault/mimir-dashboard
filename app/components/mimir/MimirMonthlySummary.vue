<script setup lang="ts">
import type { MonthlySummaryItem } from '~/types'

defineProps<{
  items: MonthlySummaryItem[]
  year: number
  pending?: boolean
}>()
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-highlighted">
        Monthly summary · {{ year }}
      </h3>
    </template>

    <div v-if="pending" class="space-y-2">
      <USkeleton v-for="i in 6" :key="i" class="h-8" />
    </div>

    <div v-else-if="!items.length" class="text-sm text-muted py-4 text-center">
      No activity recorded for this year.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-muted border-b border-default">
            <th class="py-2 pr-4 font-medium">
              Month
            </th>
            <th class="py-2 pr-4 font-medium">
              Income
            </th>
            <th class="py-2 pr-4 font-medium">
              Expenses
            </th>
            <th class="py-2 font-medium">
              Net
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in items"
            :key="row.month"
            class="border-b border-default last:border-0"
          >
            <td class="py-2.5 pr-4">
              {{ row.month }}
            </td>
            <td class="py-2.5 pr-4">
              <MoneyFormat :value="row.totalIncome" />
            </td>
            <td class="py-2.5 pr-4">
              <MoneyFormat :value="row.totalExpense" />
            </td>
            <td class="py-2.5">
              <MoneyFormat :value="row.net" colored />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
