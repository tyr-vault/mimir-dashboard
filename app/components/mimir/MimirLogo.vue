<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <NuxtLink
    to="/"
    class="flex items-center rounded-md hover:bg-elevated/50 transition-colors"
    :class="collapsed ? 'justify-center px-0 py-2 w-full' : 'gap-2.5 px-2 py-2'"
  >
    <span class="flex size-10 shrink-0 items-center justify-center">
      <img
        src="/logo.png"
        alt="Mimir"
        class="size-8 h-8 w-8 min-h-8 min-w-8 object-contain"
      >
    </span>
    <span
      v-if="!collapsed"
      class="font-semibold text-highlighted tracking-tight"
    >
      Mimir
    </span>
  </NuxtLink>
</template>
