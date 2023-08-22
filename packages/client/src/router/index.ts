import { createRouter, createWebHistory } from 'vue-router'

import EditView from '@/views/EditView.vue'
import EvalView from '@/views/EvalView.vue'
import RoiView from '@/views/RoiView.vue'
import VisualView from '@/views/VisualView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/edit'
    },
    {
      name: 'edit',
      path: '/edit',
      component: EditView
    },
    {
      name: 'eval',
      path: '/eval',
      component: EvalView
    },
    {
      name: 'roi',
      path: '/roi',
      component: RoiView
    },
    {
      name: 'visual',
      path: '/visual',
      component: VisualView
    }
  ]
})

export default router
