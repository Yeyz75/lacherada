import { createRouter, createWebHistory } from 'vue-router'
import {
  requireAuth,
  requireGuest,
  requireAuthOnly,
} from '../middleware/authMiddleware'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    // Si hay una posición guardada (navegación con botón atrás/adelante), la respetamos
    if (savedPosition) return savedPosition

    // Si la ruta tiene un hash (#section), navegar a esa sección con scroll suave
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Por defecto, siempre ir al top con efecto suave
    return {
      top: 0,
      behavior: 'smooth',
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/index.vue'),
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue'),
    },
    {
      path: '/how-it-works',
      name: 'howItWorks',
      component: () => import('../views/HowItWorksView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/auth/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      beforeEnter: requireGuest,
    },
    {
      path: '/auth/callback',
      name: 'authCallback',
      component: () => import('../views/auth/AuthCallbackView.vue'),
      // No requiere autenticación ya que es parte del proceso de OAuth
    },
    {
      path: '/auth/verify-email',
      name: 'verifyEmail',
      component: () => import('../views/auth/EmailVerificationView.vue'),
      beforeEnter: requireAuthOnly, // Solo requiere autenticación, no verificación
    },
    // Protected routes for authenticated users
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/authenticated/DashboardView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/authenticated/ProfileView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/authenticated/PublishView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/authenticated/MessagesView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/authenticated/FavoritesView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/my-items',
      name: 'myItems',
      component: () => import('../views/authenticated/MyItemsView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/design-system',
      name: 'designSystem',
      component: () => import('../views/DesignSystemView.vue'),
    },
  ],
})

// Guard global para verificar email en todas las navegaciones
router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated, needsEmailVerification, initialized, initialize } =
    useAuth()

  // Esperar inicialización
  if (!initialized.value) {
    await initialize()
    let attempts = 0
    while (!initialized.value && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }
  }

  // VERIFICACIÓN CRÍTICA: Si el usuario está autenticado pero no verificado
  // y está intentando ir a cualquier ruta que NO sea verificación,
  // redirigir inmediatamente
  if (
    isAuthenticated.value &&
    needsEmailVerification.value &&
    to.name !== 'verifyEmail'
  ) {
    next('/auth/verify-email')
    return
  }

  // Rutas que NO requieren autenticación
  const publicRoutes = [
    '/',
    'home',
    'explore',
    'howItWorks',
    'contact',
    'designSystem',
  ]
  const authRoutes = ['login', 'register', 'forgotPassword', 'authCallback']
  const verifyRoute = 'verifyEmail'

  // Si es una ruta pública, permitir siempre
  if (publicRoutes.includes(to.name as string)) {
    next()
    return
  }

  // Si es una ruta de auth y el usuario está autenticado
  if (authRoutes.includes(to.name as string) && isAuthenticated.value) {
    // Si necesita verificación, ir a verificar
    if (needsEmailVerification.value) next('/auth/verify-email')
    else next('/dashboard')

    return
  }

  // Si es la ruta de verificación y el usuario está autenticado, permitir
  if (to.name === verifyRoute && isAuthenticated.value) {
    // Si ya está verificado, ir al dashboard
    if (!needsEmailVerification.value) next('/dashboard')
    else next()

    return
  }

  // Si es una ruta protegida (dashboard, profile, etc)
  if (
    !authRoutes.includes(to.name as string) &&
    !publicRoutes.includes(to.name as string)
  ) {
    // Si no está autenticado
    if (!isAuthenticated.value) {
      next('/auth/login')
      return
    }

    // Si está autenticado pero necesita verificar email
    if (needsEmailVerification.value && to.name !== verifyRoute) {
      next('/auth/verify-email')
      return
    }
  }

  next()
})

export default router
