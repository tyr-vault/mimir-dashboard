<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  email: '',
  password: ''
})

const { register } = useMimirAuth()
const toast = useToast()
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await register(event.data.name, event.data.email, event.data.password)
    await navigateTo('/')
  } catch (error: unknown) {
    toast.add({
      title: error instanceof Error ? error.message : 'Registration failed',
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
            Create your Mimir account
          </h1>
          <p class="text-sm text-muted mt-1">
            Default categories are seeded on signup
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
      <UFormField label="Name" name="name" required>
        <UInput v-model="state.name" autocomplete="name" />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput v-model="state.email" type="email" autocomplete="email" />
      </UFormField>

      <UFormField label="Password" name="password" required>
        <UInput v-model="state.password" type="password" autocomplete="new-password" />
      </UFormField>

      <UButton
        type="submit"
        label="Create account"
        block
        :loading="loading"
      />

      <p class="text-center text-sm text-muted">
        Already have an account?
        <NuxtLink to="/login" class="text-primary font-medium hover:underline">
          Sign in
        </NuxtLink>
      </p>
    </UForm>
  </UCard>
</template>
