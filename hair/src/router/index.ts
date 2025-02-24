import { createRouter, createWebHistory } from 'vue-router'
import HairDyePage from '@/pages/MainPage.vue'
import Poc from '@/Poc.vue'
import Crop from '@/Crop.vue'

const routes = [
  {
    path: '/',
    name: 'HairDyePage',
    component: HairDyePage
  },
  {
    path: '/poc',
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
