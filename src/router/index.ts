import { createRouter, createWebHistory } from 'vue-router'
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
      meta: { requiresGuest: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/auth/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    // Protected routes for authenticated users
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/authenticated/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/authenticated/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/authenticated/PublishView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/authenticated/MessagesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/authenticated/FavoritesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-items',
      name: 'myItems',
      component: () => import('../views/authenticated/MyItemsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/design-system',
      name: 'designSystem',
      component: () => import('../views/DesignSystemView.vue'),
    },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'login' })
    return
  }

  // Check if route is for guests only (login, register)
  if (to.meta.requiresGuest && isAuthenticated.value) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
