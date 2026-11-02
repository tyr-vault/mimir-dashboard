<script setup lang="ts">
import type { Transaction } from '~/types'

defineProps<{
  transactions: Transaction[]
  pending?: boolean
}>()

const emit = defineEmits<{
  edit: [tx: Transaction]
}>()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h3 class="font-semibold text-highlighted">
          Recent transactions
        </h3>
        <UButton
          to="/transactions"
          label="View all"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
    </template>

    <div v-if="pending" class="space-y-2">
      <USkeleton v-for="i in 5" :key="i" class="h-10" />
    </div>

    <div v-else-if="!transactions.length" class="text-sm text-muted py-4 text-center">
      No transactions yet.
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="tx in transactions"
        :key="tx.id"
        class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 group"
      >
        <button
          type="button"
          class="min-w-0 flex-1 text-left rounded-md hover:bg-elevated/50 -mx-1 px-1 py-0.5 transition-colors"
          @click="emit('edit', tx)"
        >
          <p class="font-medium truncate">
            {{ tx.categoryName || 'Category' }}
          </p>
          <p class="text-xs text-muted">
            {{ tx.date }} · {{ tx.type }}
          </p>
        </button>
        <div class="flex items-center gap-1 shrink-0">
          <MoneyFormat
            :value="tx.type === 'expense' ? -tx.amount : tx.amount"
            colored
          />
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            class="opacity-0 group-hover:opacity-100 focus:opacity-100"
            @click="emit('edit', tx)"
          />
        </div>
      </li>
    </ul>
  </UCard>
</template>
