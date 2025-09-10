import { ref, computed } from 'vue'
import {
  FirebaseAuthService,
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
  const needsPasswordSetup = computed(() => {
    return (
      user.value &&
      !user.value.hasPassword &&
      user.value.loginMethod === 'google'
    )
  })

  // Inicializar el listener de Firebase si no está inicializado
  const initialize = () => {
    if (!initialized.value) {
      unsubscribe = FirebaseAuthService.onAuthStateChanged((userData) => {
        user.value = userData
        initialized.value = true
      })
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
      const result = await FirebaseAuthService.signInWithEmail(email, password)
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
      const result = await FirebaseAuthService.signUpWithEmail(
        email,
        password,
        displayName,
      )
      user.value = result.user
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
  const signInWithGoogle = async (): Promise<AuthResult> => {
    loading.value = true
    error.value = null

    try {
      const result = await FirebaseAuthService.signInWithGoogle()
      user.value = result.user
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
   * Establecer contraseña (para usuarios de Google)
   */
  const setPassword = async (password: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await FirebaseAuthService.setPassword(password)

      // Actualizar el estado local del usuario
      if (user.value) {
        user.value = {
          ...user.value,
          hasPassword: true,
          loginMethod: 'mixed',
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al establecer contraseña'
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
      await FirebaseAuthService.signOut()
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
      await FirebaseAuthService.sendPasswordReset(email)
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
   * Verificar si el usuario actual necesita establecer contraseña
   */
  const checkPasswordSetupRequired = async (): Promise<boolean> => {
    try {
      return await FirebaseAuthService.currentUserNeedsPasswordSetup()
    } catch (err) {
      console.error('Error checking password setup requirement:', err)
      return false
    }
  }

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  // Inicializar automáticamente
  initialize()

  return {
    // Estado
    user: computed(() => user.value),
    isAuthenticated,
    needsPasswordSetup,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    initialized: computed(() => initialized.value),

    // Métodos de autenticación
    signIn,
    signUp,
    signInWithGoogle,
    setPassword,
    signOut,
    resetPassword,

    // Utilidades
    checkPasswordSetupRequired,
    clearError,
    cleanup,
  }
}
