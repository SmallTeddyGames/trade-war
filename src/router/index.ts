import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/e-card'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../App.vue')
    }
  ]
})

export default router
