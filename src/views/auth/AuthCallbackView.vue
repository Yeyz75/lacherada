<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div
          class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Procesando autenticación...
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Estamos verificando tu información con Google. No cierres esta página.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { handleOAuthCallback } = useAuth()

let redirectTimeout: NodeJS.Timeout | null = null

onMounted(async () => {
  try {
    // Intentar manejar el callback de OAuth
    const result = await handleOAuthCallback()

    if (result) {
      // Si hay resultado, el usuario se autenticó correctamente
      console.log('OAuth callback successful:', result)

      // Redirigir al dashboard después de un breve delay
      redirectTimeout = setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      // Si no hay resultado, podría haber un error o el usuario canceló
      console.log('OAuth callback returned null - redirecting to login')
      router.push('/auth/login')
    }
  } catch (error) {
    console.error('Error in OAuth callback:', error)

    // Redirigir a login en caso de error
    router.push('/auth/login')
  }
})

onUnmounted(() => {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout)
  }
})
</script>
