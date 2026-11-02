<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

const props = withDefaults(defineProps<{
  title?: string
  message?: string
  confirmLabel?: string
  loading?: boolean
}>(), {
  title: 'Delete',
  message: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  loading: false
})

const emit = defineEmits<{
  confirm: []
}>()

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <UModal v-model:open="open" :title="props.title">
    <template #body>
      <p class="text-sm text-muted">
        {{ props.message }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          :disabled="props.loading"
          @click="open = false"
        />
        <UButton
          :label="props.confirmLabel"
          color="error"
          :loading="props.loading"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
