<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type {
  Category,
  CategoryDraftPayload,
  Draft,
  TransactionDraftPayload
} from '~/types'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  draft: Draft | null
  categories: Category[]
}>()

const emit = defineEmits<{
  saved: []
}>()

const api = useMimirApi()
const toast = useToast()
const loading = ref(false)

const txSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional()
})

const catSchema = z.object({
  name: z.string().min(1, 'Name is required')
})

type TxSchema = z.output<typeof txSchema>
type CatSchema = z.output<typeof catSchema>

const txState = reactive<Partial<TxSchema>>({
  categoryId: undefined,
  type: 'expense',
  amount: undefined,
  date: new Date().toISOString().slice(0, 10),
  note: ''
})

const catState = reactive<Partial<CatSchema>>({
  name: ''
})

const isTransaction = computed(() => props.draft?.kind === 'transaction')

watch([open, () => props.draft], ([isOpen, draft]) => {
  if (!isOpen || !draft) {
    return
  }
  if (draft.kind === 'transaction') {
    const payload = draft.payload as TransactionDraftPayload
    const byName = payload.categoryName
      ? props.categories.find(c => c.name.toLowerCase() === payload.categoryName!.toLowerCase())
      : undefined
    txState.categoryId = payload.categoryId || byName?.id
    txState.type = payload.type
    txState.amount = payload.amount
    txState.date = payload.date
    txState.note = payload.note || ''
  } else {
    const payload = draft.payload as CategoryDraftPayload
    catState.name = payload.name
  }
})

const pendingCategoryName = computed(() => {
  if (props.draft?.kind !== 'transaction') return null
  const payload = props.draft.payload as TransactionDraftPayload
  if (!payload.categoryName) return null
  const exists = props.categories.some(
    c => c.name.toLowerCase() === payload.categoryName!.toLowerCase()
  )
  return exists ? null : payload.categoryName
})

const categoryItems = computed(() =>
  props.categories.map(c => ({ label: c.name, value: c.id }))
)

const typeItems = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' }
]

async function saveTransaction(event: FormSubmitEvent<TxSchema>) {
  if (!props.draft) {
    return
  }
  loading.value = true
  try {
    const selected = props.categories.find(c => c.id === event.data.categoryId)
    const payload: TransactionDraftPayload = {
      categoryId: event.data.categoryId,
      categoryName: selected?.name,
      type: event.data.type,
      amount: event.data.amount,
      date: event.data.date,
      note: event.data.note || null
    }
    await api.updateDraft(props.draft.id, payload)
    toast.add({ title: 'Draft updated', color: 'success' })
    open.value = false
    emit('saved')
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Failed to update draft',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function saveCategory(event: FormSubmitEvent<CatSchema>) {
  if (!props.draft) {
    return
  }
  loading.value = true
  try {
    const payload: CategoryDraftPayload = { name: event.data.name }
    await api.updateDraft(props.draft.id, payload)
    toast.add({ title: 'Draft updated', color: 'success' })
    open.value = false
    emit('saved')
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Failed to update draft',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isTransaction ? 'Edit transaction draft' : 'Edit category draft'"
  >
    <template #body>
      <UForm
        v-if="isTransaction"
        :schema="txSchema"
        :state="txState"
        class="space-y-4"
        @submit="saveTransaction"
      >
        <UFormField label="Category" name="categoryId" required>
          <USelect
            v-model="txState.categoryId"
            :items="categoryItems"
            class="w-full"
            :placeholder="pendingCategoryName ? `${pendingCategoryName} (confirm category draft first)` : 'Select a category'"
          />
          <p
            v-if="pendingCategoryName && !txState.categoryId"
            class="text-xs text-muted mt-1"
          >
            Linked to pending category draft “{{ pendingCategoryName }}”. Confirm that draft first, or pick an existing category.
          </p>
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Type" name="type" required>
            <USelect v-model="txState.type" :items="typeItems" class="w-full" />
          </UFormField>
          <UFormField label="Amount" name="amount" required>
            <UInput
              v-model="txState.amount"
              type="number"
              step="0.01"
              min="0"
            />
          </UFormField>
        </div>

        <UFormField label="Date" name="date" required>
          <UInput v-model="txState.date" type="date" />
        </UFormField>

        <UFormField label="Note" name="note">
          <UTextarea v-model="txState.note" :rows="2" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton type="submit" label="Save" :loading="loading" />
        </div>
      </UForm>

      <UForm
        v-else
        :schema="catSchema"
        :state="catState"
        class="space-y-4"
        @submit="saveCategory"
      >
        <UFormField label="Name" name="name" required>
          <UInput v-model="catState.name" autofocus />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton type="submit" label="Save" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
