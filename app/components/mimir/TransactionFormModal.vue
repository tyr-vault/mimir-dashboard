<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Transaction } from '~/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  categories: Category[]
  transaction?: Transaction | null
}>()

const emit = defineEmits<{
  saved: []
}>()

const schema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  categoryId: undefined,
  type: 'expense',
  amount: undefined,
  date: new Date().toISOString().slice(0, 10),
  note: ''
})

const api = useMimirApi()
const toast = useToast()
const loading = ref(false)

const isEdit = computed(() => !!props.transaction)

watch([open, () => props.transaction], ([isOpen, tx]) => {
  if (!isOpen) {
    return
  }
  if (tx) {
    state.categoryId = tx.categoryId
    state.type = tx.type
    state.amount = tx.amount
    state.date = tx.date
    state.note = tx.note || ''
  } else {
    state.categoryId = props.categories[0]?.id
    state.type = 'expense'
    state.amount = undefined
    state.date = new Date().toISOString().slice(0, 10)
    state.note = ''
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const body = {
      categoryId: event.data.categoryId,
      type: event.data.type,
      amount: event.data.amount,
      date: event.data.date,
      note: event.data.note || null
    }

    if (isEdit.value && props.transaction) {
      await api.updateTransaction(props.transaction.id, body)
      toast.add({ title: 'Transaction updated', color: 'success' })
    } else {
      await api.createTransaction(body)
      toast.add({ title: 'Transaction created', color: 'success' })
    }

    open.value = false
    emit('saved')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save transaction'
    toast.add({ title: message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const hasCategories = computed(() => props.categories.length > 0)

const categoryItems = computed(() =>
  props.categories.map(c => ({ label: c.name, value: c.id }))
)

const typeItems = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' }
]
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit transaction' : 'New transaction'"
  >
    <template #body>
      <p
        v-if="!hasCategories"
        class="text-sm text-muted mb-4"
      >
        No categories yet.
        <NuxtLink
          to="/categories"
          class="text-primary font-medium hover:underline"
          @click="open = false"
        >
          Create a category
        </NuxtLink>
        before adding a transaction.
      </p>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Category" name="categoryId" required>
          <USelect
            v-model="state.categoryId"
            :items="categoryItems"
            placeholder="Select category"
            class="w-full"
            :disabled="!hasCategories"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Type" name="type" required>
            <USelect
              v-model="state.type"
              :items="typeItems"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Amount" name="amount" required>
            <UInput
              v-model="state.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </UFormField>
        </div>

        <UFormField label="Date" name="date" required>
          <UInput v-model="state.date" type="date" />
        </UFormField>

        <UFormField label="Note" name="note">
          <UTextarea v-model="state.note" placeholder="Optional note" :rows="2" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton
            type="submit"
            :label="isEdit ? 'Save' : 'Create'"
            :loading="loading"
            :disabled="!hasCategories"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
