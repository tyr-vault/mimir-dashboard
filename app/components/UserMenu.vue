<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { user, logout } = useMimirAuth()

const items = computed<DropdownMenuItem[][]>(() => {
  if (!user.value) {
    return [[{
      label: 'Sign in',
      icon: 'i-lucide-log-in',
      to: '/login'
    }]]
  }

  return [[{
    type: 'label',
    label: user.value.name,
    description: user.value.email
  }], [{
    label: 'Account',
    icon: 'i-lucide-user',
    to: '/account'
  }], [{
    label: 'Log out',
    icon: 'i-lucide-log-out',
    onSelect: () => logout()
  }]]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="collapsed ? undefined : user?.name"
      :avatar="user ? { alt: user.name } : undefined"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
