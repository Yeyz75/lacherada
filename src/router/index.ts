import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/index.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/explore',
      name: 'explore',
      component: Home // Por ahora redirigimos a Home
    },
    {
      path: '/how-it-works',
      name: 'howItWorks',
      component: Home // Por ahora redirigimos a Home
    },
    {
      path: '/contact',
      name: 'contact',
      component: Home // Por ahora redirigimos a Home
    },
    {
      path: '/auth/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/auth/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/auth/forgot-password',
      name: 'forgotPassword',
      component: ForgotPasswordView
    }
  ]
})

export default router