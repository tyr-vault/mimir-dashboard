<script setup lang="ts">
import type { PeriodSummary } from '~/types'

defineProps<{
  summary: PeriodSummary | null | undefined
  pending?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard>
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm text-muted">
            Income
          </p>
          <p v-if="pending" class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
          <p v-else-if="summary" class="text-2xl font-semibold mt-1 text-highlighted">
            <MoneyFormat :value="summary.totalIncome" />
          </p>
          <p v-else class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
        </div>
        <UIcon name="i-lucide-trending-up" class="size-5 text-primary shrink-0" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm text-muted">
            Expenses
          </p>
          <p v-if="pending" class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
          <p v-else-if="summary" class="text-2xl font-semibold mt-1 text-highlighted">
            <MoneyFormat :value="summary.totalExpense" />
          </p>
          <p v-else class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
        </div>
        <UIcon name="i-lucide-trending-down" class="size-5 text-error shrink-0" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm text-muted">
            Net
          </p>
          <p v-if="pending" class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
          <p v-else-if="summary" class="text-2xl font-semibold mt-1">
            <MoneyFormat :value="summary.net" colored />
          </p>
          <p v-else class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
        </div>
        <UIcon name="i-lucide-wallet" class="size-5 text-dimmed shrink-0" />
      </div>
    </UCard>

    <UCard>
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-sm text-muted">
            Transactions
          </p>
          <p v-if="pending" class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
          <p v-else-if="summary" class="text-2xl font-semibold mt-1 text-highlighted">
            {{ summary.count }}
          </p>
          <p v-else class="text-2xl font-semibold mt-1 text-muted">
            —
          </p>
        </div>
        <UIcon name="i-lucide-list" class="size-5 text-dimmed shrink-0" />
      </div>
    </UCard>
  </div>
</template>
