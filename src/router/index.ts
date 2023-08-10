import { createRouter, createWebHistory } from 'vue-router'

import EditView from '@/views/EditView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/edit'
    },
    {
      path: '/edit',
      component: EditView
    }
  ]
})

export default router
