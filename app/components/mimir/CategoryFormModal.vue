<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  created: []
  saved: []
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: ''
})

const api = useMimirApi()
const toast = useToast()
const loading = ref(false)

watch(open, (value) => {
  if (value) {
    state.name = ''
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await api.createCategory({ name: event.data.name })
    toast.add({ title: 'Category created', color: 'success' })
    open.value = false
    emit('created')
    emit('saved')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category'
    toast.add({ title: message, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="New category">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="Groceries" autofocus />
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
            label="Create"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
