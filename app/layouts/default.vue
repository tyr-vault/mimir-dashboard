<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const links = [[{
  label: 'Overview',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: () => { open.value = false }
}, {
  label: 'Drafts',
  icon: 'i-lucide-inbox',
  to: '/drafts',
  onSelect: () => { open.value = false }
}, {
  label: 'Transactions',
  icon: 'i-lucide-arrow-left-right',
  to: '/transactions',
  onSelect: () => { open.value = false }
}, {
  label: 'Categories',
  icon: 'i-lucide-tags',
  to: '/categories',
  onSelect: () => { open.value = false }
}, {
  label: 'Account',
  icon: 'i-lucide-user',
  to: '/account',
  onSelect: () => { open.value = false }
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ header: 'min-h-14', footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <MimirLogo :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
