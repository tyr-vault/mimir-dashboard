<script setup lang="ts">
import { formatMoney } from '~/utils/mimir'

const props = withDefaults(defineProps<{
  value: number
  currency?: string
  colored?: boolean
}>(), {
  currency: 'USD',
  colored: false
})

const formatted = computed(() => formatMoney(props.value, props.currency))

const colorClass = computed(() => {
  if (!props.colored) {
    return ''
  }
  if (props.value > 0) {
    return 'text-primary'
  }
  if (props.value < 0) {
    return 'text-error'
  }
  return 'text-muted'
})
</script>

<template>
  <span :class="colorClass">{{ formatted }}</span>
</template>
