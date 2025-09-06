import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('../views/home/index.vue'), // Por ahora redirigimos a Home
    },
    {
      path: '/how-it-works',
      name: 'howItWorks',
      component: () => import('../views/home/index.vue'), // Por ahora redirigimos a Home
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/home/index.vue'), // Por ahora redirigimos a Home
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/auth/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
    },
  ],
})

export default router
