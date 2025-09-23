/**
 * Auth Middleware
 *
 * Middleware para manejar la autenticación y verificar el estado de contraseña
 * en las rutas protegidas de la aplicación
 */

import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import type { UserData } from '../services/authService'

export interface AuthMiddlewareOptions {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiresPassword?: boolean
  requiresEmailVerification?: boolean
  redirectTo?: string
}

/**
 * Middleware de autenticación principal
 * Maneja todas las verificaciones de autenticación y redirecciones
 */
export async function authMiddleware(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: AuthMiddlewareOptions = {},
) {
  const { isAuthenticated, needsEmailVerification, initialized, initialize } =
    useAuth()

  // Esperar a que la autenticación se inicialice
  if (!initialized.value) {
    // Inicializar explícitamente si no está inicializado
    await initialize()
    // Usar un timeout para evitar bucles infinitos
    let attempts = 0
    const maxAttempts = 50 // 5 segundos máximo

    while (!initialized.value && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (!initialized.value) {
      console.warn('Auth initialization timeout')
      // En lugar de bloquear la navegación, permitimos continuar pero mostramos una advertencia
      console.warn(
        'Continuando sin autenticación inicializada. Algunas funciones pueden no estar disponibles.',
      )
    }
  }

  const {
    requiresAuth = false,
    requiresGuest = false,
    requiresEmailVerification = false,
    redirectTo,
  } = options

  // 1. Verificar si la ruta requiere que NO esté autenticado (páginas de guest)
  if (requiresGuest && isAuthenticated.value) {
    // Si ya está autenticado y verificado, ir al dashboard
    // Si no está verificado, ir a verificación
    if (needsEmailVerification.value) next('/auth/verify-email')
    else next(redirectTo || '/dashboard')

    return
  }

  // 2. Verificar si la ruta requiere autenticación
  if (requiresAuth && !isAuthenticated.value) {
    next('/auth/login')
    return
  }

  // 3. Verificar si la ruta requiere verificación de email
  if (requiresEmailVerification && needsEmailVerification.value) {
    next('/auth/verify-email')
    return
  }

  // Si todas las verificaciones pasan, continuar
  next()
}

/**
 * Helper para crear middleware específicos
 */
export const createAuthGuard = (options: AuthMiddlewareOptions) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    await authMiddleware(to, from, next, options)
  }
}

/**
 * Middleware preconfigurados para casos comunes
 */
export const requireAuth = createAuthGuard({
  requiresAuth: true,
  requiresEmailVerification: true,
})
export const requireGuest = createAuthGuard({ requiresGuest: true })
export const requireAuthOnly = createAuthGuard({ requiresAuth: true })

/**
 * Middleware especial para la página de establecer contraseña
 * Solo requiere autenticación, pero NO requiere contraseña
 */
export const requireAuthNoPassword = createAuthGuard({
  requiresAuth: true,
  requiresPassword: false,
})

/**
 * Verificar el estado de autenticación sin redireccionar
 * Útil para componentes que necesitan verificar estado
 */
export async function checkAuthState() {
  const { user, isAuthenticated, initialized } = useAuth()

  if (!initialized.value) {
    let attempts = 0
    const maxAttempts = 50

    while (!initialized.value && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }
  }

  return {
    user: user.value,
    isAuthenticated: isAuthenticated.value,
    needsPasswordSetup: false, // Ya no necesitamos esto
    initialized: initialized.value,
  }
}

/**
 * Determinar la ruta de redirección basada en el estado del usuario
 */
export function getRedirectRoute(
  user: UserData | null,
  needsPasswordSetup: boolean,
): string {
  if (!user) return '/auth/login'

  if (needsPasswordSetup) return '/auth/set-password'

  return '/dashboard'
}
