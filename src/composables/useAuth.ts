import { ref, computed } from 'vue'
import {
  SupabaseAuthService,
  UserData,
  AuthResult,
} from '../services/authService'
import { logger } from '../utils/logger'

const user = ref<UserData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const initialized = ref(false)

let unsubscribe: (() => void) | null = null
let initializePromise: Promise<void> | null = null

const setAuthState = (userData: UserData | null) => {
  user.value = userData
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value))
  const isEmailVerified = computed(() => {
    if (!user.value) return false
    if (user.value.loginMethod === 'google') return true
    return user.value.emailVerified
  })
  const needsEmailVerification = computed(() => {
    return isAuthenticated.value && !isEmailVerified.value
  })

  const initialize = async () => {
    if (initialized.value) return
    if (initializePromise) return initializePromise

    error.value = null

    if (!unsubscribe) {
      unsubscribe = SupabaseAuthService.onAuthStateChanged((userData) => {
        setAuthState(userData)
      })
    }

    initializePromise = (async () => {
      try {
        const currentUser = await SupabaseAuthService.getCurrentUserProfile()
        setAuthState(currentUser)
      } catch (err) {
        logger.error(
          'Error obtaining current user during initialization',
          { component: 'useAuth', method: 'initialize' },
          err as Error,
        )
        error.value =
          'No se pudo obtener la sesión actual. Verifica tu conexión a internet.'
      } finally {
        initialized.value = true
      }
    })()

    try {
      await initializePromise
    } finally {
      initializePromise = null
    }
  }

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      initialized.value = false
      initializePromise = null
    }
  }

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

  const signInWithGoogle = async (): Promise<{ redirecting: boolean }> => {
    loading.value = true
    error.value = null

    try {
      const result = await SupabaseAuthService.signInWithGoogle()
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

  const reauthenticateWithGoogle = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
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

  const userPhotoURL = computed(() => user.value?.photoURL || null)

  const refreshUserProfile = async (): Promise<void> => {
    try {
      const currentUser = await SupabaseAuthService.getCurrentUserProfile()
      setAuthState(currentUser)
    } catch (err) {
      logger.error(
        'Error refreshing user profile',
        { component: 'useAuth', method: 'refreshUserProfile' },
        err as Error,
      )
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user: computed(() => user.value),
    userPhotoURL,
    isAuthenticated,
    isEmailVerified,
    needsEmailVerification,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    initialized: computed(() => initialized.value),

    signIn,
    signUp,
    signInWithGoogle,
    handleOAuthCallback,
    reauthenticateWithGoogle,
    signOut,
    resetPassword,
    resendEmailVerification,

    refreshUserProfile,
    clearError,
    cleanup,
    initialize,
  }
}
