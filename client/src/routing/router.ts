import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Architecture from '../views/Architecture.vue'
import Features from '../views/Features.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/B4IoT',
      name: 'home',
      component: HomeView
    },
    {
      path: '/architecture',
      name: 'architecture',
      component: Architecture,
    },
    {
      path: '/architecture/:arch/features',
      name: 'features',
      component: Features,
      props: true

    }
  ]
})

export default router
