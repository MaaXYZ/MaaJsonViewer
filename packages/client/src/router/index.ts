import { createRouter, createWebHistory } from 'vue-router'

import EditView from '@/views/EditView.vue'
import EvalView from '@/views/EvalView.vue'
import RoiView from '@/views/RoiView.vue'

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
    },
    {
      path: '/eval',
      component: EvalView
    },
    {
      path: '/roi',
      component: RoiView
    }
  ]
})

export default router