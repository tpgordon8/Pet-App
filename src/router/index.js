import { createRouter, createWebHistory } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresHousehold: false }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresHousehold: false }
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresHousehold: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresHousehold: true }
    }
  ]
})

// Navigation guard to check household authentication
router.beforeEach((to, from, next) => {
  const householdStore = useHouseholdStore()

  if (to.meta.requiresHousehold && !householdStore.isAuthenticated) {
    next('/onboarding')
  } else if (to.path === '/' && householdStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
