/**
 * Auth Middleware
 *
 * Middleware para manejar la autenticación y verificar el estado de contraseña
 * en las rutas protegidas de la aplicación
 */

import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export interface AuthMiddlewareOptions {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiresPassword?: boolean
  redirectTo?: string
}

/**
 * Middleware de autenticación principal
 * Maneja todas las verificaciones de autenticación y redirecciones
 */
export async function authMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: AuthMiddlewareOptions = {},
) {
  const { isAuthenticated, needsPasswordSetup, initialized } = useAuth()

  // Esperar a que la autenticación se inicialice
  if (!initialized.value) {
    // Usar un timeout para evitar bucles infinitos
    let attempts = 0
    const maxAttempts = 50 // 5 segundos máximo

    while (!initialized.value && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (!initialized.value) console.warn('Auth initialization timeout')
  }

  const {
    requiresAuth = false,
    requiresGuest = false,
    requiresPassword = false,
    redirectTo,
  } = options

  // 1. Verificar si la ruta requiere que NO esté autenticado (páginas de guest)
  if (requiresGuest && isAuthenticated.value) {
    // Si ya está autenticado pero necesita establecer contraseña
    if (needsPasswordSetup.value) {
      next('/auth/set-password')
      return
    }
    // Si ya está autenticado y no necesita contraseña, ir al dashboard
    next(redirectTo || '/dashboard')
    return
  }

  // 2. Verificar si la ruta requiere autenticación
  if (requiresAuth && !isAuthenticated.value) {
    next('/auth/login')
    return
  }

  // 3. Si está autenticado, verificar el estado de contraseña
  if (isAuthenticated.value) {
    // Si necesita establecer contraseña y no está en la página de establecer contraseña
    if (needsPasswordSetup.value && to.path !== '/auth/set-password') {
      next('/auth/set-password')
      return
    }

    // Si ya tiene contraseña pero está en la página de establecer contraseña
    if (!needsPasswordSetup.value && to.path === '/auth/set-password') {
      next('/dashboard')
      return
    }
  }

  // 4. Verificar si la ruta específicamente requiere contraseña establecida
  if (requiresPassword && isAuthenticated.value && needsPasswordSetup.value) {
    next('/auth/set-password')
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
  requiresPassword: true,
})
export const requireGuest = createAuthGuard({ requiresGuest: true })
export const requirePassword = createAuthGuard({ requiresPassword: true })

/**
 * Verificar el estado de autenticación sin redireccionar
 * Útil para componentes que necesitan verificar estado
 */
export async function checkAuthState() {
  const { user, isAuthenticated, needsPasswordSetup, initialized } = useAuth()

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
    needsPasswordSetup: needsPasswordSetup.value,
    initialized: initialized.value,
  }
}

/**
 * Determinar la ruta de redirección basada en el estado del usuario
 */
export function getRedirectRoute(
  user: any,
  needsPasswordSetup: boolean,
): string {
  if (!user) return '/auth/login'

  if (needsPasswordSetup) return '/auth/set-password'

  return '/dashboard'
}
