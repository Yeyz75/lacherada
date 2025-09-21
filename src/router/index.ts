import { createRouter, createWebHistory } from 'vue-router'
import {
  requireAuth,
  requireGuest,
  requireAuthNoPassword,
} from '../middleware/authMiddleware'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
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
      path: '/auth/set-password',
      name: 'setPassword',
      component: () => import('../views/auth/SetPasswordView.vue'),
      beforeEnter: requireAuthNoPassword,
    },
    {
      path: '/auth/callback',
      name: 'authCallback',
      component: () => import('../views/auth/AuthCallbackView.vue'),
      // No requiere autenticación ya que es parte del proceso de OAuth
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

// Guard global para manejar usuarios de Google sin contraseña
// Este guard se ejecuta ANTES que los guards individuales de las rutas
router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated, needsPasswordSetup, initialized, initialize } =
    useAuth()

  // Rutas que no requieren verificación
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/forgot-password',
    '/',
    '/explore',
    '/how-it-works',
    '/contact',
    '/design-system',
  ]
  const isPublicPath = publicPaths.includes(to.path)

  // Si es una ruta pública, continuar sin verificación
  if (isPublicPath) {
    next()
    return
  }

  // Esperar a que la autenticación se inicialice solo si no es una ruta pública
  if (!initialized.value) {
    await initialize()
    // Dar un poco de tiempo para que se complete la inicialización
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Si el usuario está autenticado y necesita establecer contraseña
  if (isAuthenticated.value && needsPasswordSetup.value) {
    // Si ya está en la página de establecer contraseña, permitir
    if (to.path === '/auth/set-password') {
      next()
      return
    }

    // Si intenta ir a cualquier otra ruta protegida, redirigir a establecer contraseña
    next('/auth/set-password')
    return
  }

  // Continuar con la navegación normal y dejar que los guards individuales manejen el resto
  next()
})

export default router
