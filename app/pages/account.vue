<script setup lang="ts">
const { user, logout } = useMimirAuth()
</script>

<template>
  <UDashboardPanel id="account">
    <template #header>
      <UDashboardNavbar title="Account">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <AppNavbarTrailing />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard v-if="user" class="max-w-lg">
        <div class="space-y-4">
          <div>
            <p class="text-sm text-muted">
              Name
            </p>
            <p class="font-medium text-highlighted">
              {{ user.name }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted">
              Email
            </p>
            <p class="font-medium text-highlighted">
              {{ user.email }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted">
              User ID
            </p>
            <p class="font-mono text-xs text-dimmed break-all">
              {{ user.id }}
            </p>
          </div>

          <UButton
            label="Log out"
            icon="i-lucide-log-out"
            color="neutral"
            variant="outline"
            @click="logout()"
          />
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
