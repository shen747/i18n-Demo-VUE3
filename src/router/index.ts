import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LanguageSwitcher from '@/views/LanguageSwitcher.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/language-switcher',
      name: 'language-switcher',
      component: LanguageSwitcher,
    },
  ],
})

export default router
