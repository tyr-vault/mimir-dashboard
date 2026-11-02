<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: '',
  password: ''
})

const { login } = useMimirAuth()
const toast = useToast()
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await login(event.data.email, event.data.password)
    await navigateTo('/')
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Login failed',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard class="w-full max-w-md shadow-lg bg-default text-default ring-default">
    <template #header>
      <div class="flex flex-col items-center gap-3 text-center">
        <img src="/logo.png" alt="Mimir" class="size-14 object-contain">
        <div>
          <h1 class="text-xl font-semibold text-highlighted">
            Sign in to Mimir
          </h1>
          <p class="text-sm text-muted mt-1">
            Personal finance visualization
          </p>
        </div>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField label="Email" name="email" required>
        <UInput v-model="state.email" type="email" autocomplete="email" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput v-model="state.password" type="password" autocomplete="current-password" />
      </UFormField>

      <UButton
        type="submit"
        label="Sign in"
        block
        :loading="loading"
      />

      <p class="text-center text-sm text-muted">
        No account?
        <NuxtLink to="/register" class="text-primary font-medium hover:underline">
          Create one
        </NuxtLink>
      </p>
    </UForm>
  </UCard>
</template>
