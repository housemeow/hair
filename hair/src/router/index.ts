import { createRouter, createWebHistory } from 'vue-router'
import Poc from '@/Poc.vue'
import Crop from '@/Crop.vue'

const routes = [
  {
    path: '/',
    name: 'Poc',
    component: Poc,
  },
  {
    path: '/crop',
    name: 'Crop',
    component: Crop,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
