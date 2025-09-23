import { ref, computed } from 'vue'
import {
  SupabaseAuthService,
  UserData,
  AuthResult,
} from '../services/authService'

// Estado global de autenticación
const user = ref<UserData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)

// Inicializar el listener de autenticación una sola vez
let unsubscribe: (() => void) | null = null

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value))
  const isEmailVerified = computed(() => {
    if (!user.value) return false
    // Los usuarios de Google siempre están verificados
    if (user.value.loginMethod === 'google') return true
    // Los usuarios de email dependen del estado real
    return user.value.emailVerified
  })
  const needsEmailVerification = computed(() => {
    return isAuthenticated.value && !isEmailVerified.value
  })

  // Inicializar el listener de Supabase si no está inicializado
  const initialize = async () => {
    if (!initialized.value) {
      try {
        // Verificar la conexión a Supabase antes de inicializar
        await SupabaseAuthService.checkConnection()

        unsubscribe = SupabaseAuthService.onAuthStateChanged((userData) => {
          user.value = userData
          initialized.value = true
        })

        // Establecer un timeout para la inicialización
        setTimeout(() => {
          if (!initialized.value) {
            console.warn('Auth initialization is taking longer than expected')
            error.value =
              'La inicialización de autenticación está tardando más de lo esperado'
          }
        }, 3000)
      } catch (err) {
        console.error('Error initializing auth:', err)
        error.value =
          'Error al inicializar la autenticación. Verifica tu conexión a internet.'
        initialized.value = true // Marcar como inicializado incluso con error para evitar bucles
      }
    }
  }

  // Limpiar el listener
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      initialized.value = false
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    loading.value = true
    error.value = null

    try {
      const result = await SupabaseAuthService.signInWithEmail(email, password)
      user.value = result.user
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Registrarse con email y contraseña
   */
  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> => {
    loading.value = true
    error.value = null

    try {
      const result = await SupabaseAuthService.signUpWithEmail(
        email,
        password,
        displayName,
      )

      // Actualizar el estado del usuario
      user.value = result.user

      // Para usuarios de email, el estado de verificación se maneja automáticamente

      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrarse'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Iniciar sesión con Google
   */
  const signInWithGoogle = async (): Promise<{ redirecting: boolean }> => {
    loading.value = true
    error.value = null

    try {
      const result = await SupabaseAuthService.signInWithGoogle()
      // No actualizar user.value aquí ya que la autenticación real ocurrirá en el callback
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión con Google'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Manejar callback de OAuth (Google)
   */
  const handleOAuthCallback = async (): Promise<AuthResult | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await SupabaseAuthService.handleOAuthCallback()
      if (result) user.value = result.user
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error en callback de OAuth'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Cerrar sesión
   */
  const signOut = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await SupabaseAuthService.signOut()
      user.value = null
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cerrar sesión'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  const resetPassword = async (email: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await SupabaseAuthService.sendPasswordReset(email)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al enviar email de recuperación'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reenviar email de verificación
   */
  const resendEmailVerification = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await SupabaseAuthService.resendEmailVerification()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al reenviar email de verificación'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reautenticar usuario con Google (para operaciones sensibles)
   * Nota: En Supabase esto se maneja diferente que en Firebase
   */
  const reauthenticateWithGoogle = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // En Supabase, la reautenticación se maneja automáticamente
      // o se puede implementar solicitando login nuevamente
      throw new Error(
        'Reautenticación con Google - implementar según necesidades específicas',
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al reautenticar'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  // No inicializar automáticamente, se debe llamar explícitamente
  // initialize()

  return {
    // Estado
    user: computed(() => user.value),
    isAuthenticated,
    isEmailVerified,
    needsEmailVerification,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    initialized: computed(() => initialized.value),

    // Métodos de autenticación
    signIn,
    signUp,
    signInWithGoogle,
    handleOAuthCallback,
    reauthenticateWithGoogle,
    signOut,
    resetPassword,
    resendEmailVerification,

    // Utilidades
    clearError,
    cleanup,
    initialize,
  }
}
