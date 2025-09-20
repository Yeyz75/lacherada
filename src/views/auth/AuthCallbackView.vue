<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div
          v-if="!error"
          class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <div
          v-else
          class="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <Icon icon="mdi:alert-circle" class="h-6 w-6 text-red-600" />
        </div>

        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ error ? 'Error de Autenticación' : 'Procesando autenticación...' }}
        </h2>

        <p class="mt-2 text-center text-sm text-gray-600">
          {{
            error ||
            'Estamos verificando tu información con Google. No cierres esta página.'
          }}
        </p>

        <div v-if="error" class="mt-4">
          <button
            @click="retryAuth"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2">
            Reintentar
          </button>
          <button
            @click="goToLogin"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { handleOAuthCallback } = useAuth()

const error = ref<string | null>(null)
let redirectTimeout: NodeJS.Timeout | null = null

const processCallback = async () => {
  try {
    // Intentar manejar el callback de OAuth
    const result = await handleOAuthCallback()

    if (result) {
      // Si hay resultado, el usuario se autenticó correctamente

      // Verificar si necesita establecer contraseña
      if (result.needsPasswordSetup) {
        // Redirigir a la página de establecer contraseña
        router.push('/auth/set-password')
        return
      }

      // Redirigir al dashboard después de un breve delay
      redirectTimeout = setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      // Si no hay resultado, podría haber un error o el usuario canceló
      error.value =
        'No se pudo completar la autenticación con Google. Es posible que hayas cancelado el proceso.'
    }
  } catch (err) {
    console.error('Error in OAuth callback:', err)

    // Mostrar error específico
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value =
        'Ocurrió un error durante la autenticación. Por favor, inténtalo de nuevo.'
    }
  }
}

const retryAuth = () => {
  error.value = null
  processCallback()
}

const goToLogin = () => {
  router.push('/auth/login')
}

onMounted(() => {
  processCallback()
})

onUnmounted(() => {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout)
  }
})
</script>
