import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/index.vue'

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
    }
  ]
})

export default router