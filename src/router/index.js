import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard - Wedding Planner' },
    },
    {
      path: '/checklist',
      name: 'checklist',
      component: () => import('@/views/ChecklistView.vue'),
      meta: { title: 'Checklist Persiapan - Wedding Planner' },
    },
    {
      path: '/budget',
      name: 'budget',
      component: () => import('@/views/BudgetView.vue'),
      meta: { title: 'Budget Planner - Wedding Planner' },
    },
    {
      path: '/vendors',
      name: 'vendors',
      component: () => import('@/views/VendorsView.vue'),
      meta: { title: 'Vendor Management - Wedding Planner' },
    },
    {
      path: '/guests',
      name: 'guests',
      component: () => import('@/views/GuestsView.vue'),
      meta: { title: 'Guest List - Wedding Planner' },
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('@/views/TimelineView.vue'),
      meta: { title: 'Timeline & Rundown - Wedding Planner' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Pengaturan - Wedding Planner' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
