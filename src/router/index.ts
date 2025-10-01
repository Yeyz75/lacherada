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
    if (savedPosition) return savedPosition

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

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
    },
    {
      path: '/auth/verify-email',
      name: 'verifyEmail',
      component: () => import('../views/auth/EmailVerificationView.vue'),
      beforeEnter: requireAuthOnly,
    },
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
      path: '/items/:slug',
      name: 'itemDetail',
      component: () => import('../views/marketplace/ItemDetailView.vue'),
    },
    {
      path: '/items/:id/edit',
      name: 'itemEdit',
      component: () => import('../views/marketplace/ItemEditView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/design-system',
      name: 'designSystem',
      component: () => import('../views/DesignSystemView.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated, needsEmailVerification, initialized, initialize } =
    useAuth()

  if (!initialized.value) {
    try {
      await initialize()
    } catch (error) {
      console.error('Error during auth initialization in router', error)
    }
  }

  // VERIFICACIÓN CRÍTICA: Redirigir a verificación si es necesario
  if (
    isAuthenticated.value &&
    needsEmailVerification.value &&
    to.name !== 'verifyEmail'
  ) {
    next('/auth/verify-email')
    return
  }

  const publicRoutes = [
    '/',
    'home',
    'explore',
    'howItWorks',
    'contact',
    'designSystem',
    'itemDetail',
  ]
  const authRoutes = ['login', 'register', 'forgotPassword', 'authCallback']
  const verifyRoute = 'verifyEmail'

  if (publicRoutes.includes(to.name as string)) {
    next()
    return
  }

  if (authRoutes.includes(to.name as string) && isAuthenticated.value) {
    if (needsEmailVerification.value) next('/auth/verify-email')
    else next('/dashboard')

    return
  }

  if (to.name === verifyRoute && isAuthenticated.value) {
    if (!needsEmailVerification.value) next('/dashboard')
    else next()

    return
  }

  if (
    !authRoutes.includes(to.name as string) &&
    !publicRoutes.includes(to.name as string)
  ) {
    if (!isAuthenticated.value) {
      next('/auth/login')
      return
    }

    if (needsEmailVerification.value && to.name !== verifyRoute) {
      next('/auth/verify-email')
      return
    }
  }

  next()
})

export default router
