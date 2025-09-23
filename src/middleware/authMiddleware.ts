/**
 * Auth Middleware para rutas protegidas
 */

import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import type { UserData } from '../services/authService'
import { logger } from '../utils/logger'

export interface AuthMiddlewareOptions {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiresPassword?: boolean
  requiresEmailVerification?: boolean
  redirectTo?: string
}

export async function authMiddleware(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: AuthMiddlewareOptions = {},
) {
  const { isAuthenticated, needsEmailVerification, initialized, initialize } =
    useAuth()

  if (!initialized.value) {
    await initialize()
    let attempts = 0
    const maxAttempts = 50

    while (!initialized.value && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (!initialized.value) {
      logger.warn('Auth initialization timeout', {
        component: 'authMiddleware',
        method: 'authMiddleware',
      })
      logger.warn(
        'Continuando sin autenticación inicializada. Algunas funciones pueden no estar disponibles.',
        { component: 'authMiddleware', method: 'authMiddleware' },
      )
    }
  }

  const {
    requiresAuth = false,
    requiresGuest = false,
    requiresEmailVerification = false,
    redirectTo,
  } = options

  if (requiresGuest && isAuthenticated.value) {
    if (needsEmailVerification.value) next('/auth/verify-email')
    else next(redirectTo || '/dashboard')

    return
  }

  if (requiresAuth && !isAuthenticated.value) {
    next('/auth/login')
    return
  }

  if (requiresEmailVerification && needsEmailVerification.value) {
    next('/auth/verify-email')
    return
  }

  next()
}

export const createAuthGuard = (options: AuthMiddlewareOptions) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    await authMiddleware(to, from, next, options)
  }
}

export const requireAuth = createAuthGuard({
  requiresAuth: true,
  requiresEmailVerification: true,
})
export const requireGuest = createAuthGuard({ requiresGuest: true })
export const requireAuthOnly = createAuthGuard({ requiresAuth: true })

export const requireAuthNoPassword = createAuthGuard({
  requiresAuth: true,
  requiresPassword: false,
})

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
    needsPasswordSetup: false,
    initialized: initialized.value,
  }
}

export function getRedirectRoute(
  user: UserData | null,
  needsPasswordSetup: boolean,
): string {
  if (!user) return '/auth/login'

  if (needsPasswordSetup) return '/auth/set-password'

  return '/dashboard'
}
