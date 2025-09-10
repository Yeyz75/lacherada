import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest } from '../middleware/authMiddleware'

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
      meta: { requiresAuth: true },
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

// No necesitamos navigation guards globales ya que usamos beforeEnter
// El middleware maneja toda la lógica de autenticación

export default router
