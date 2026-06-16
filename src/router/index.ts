import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { setupGuards } from './guards'
import userRoutes from './user.routes'
import merchantRoutes from './merchant.routes'
import riderRoutes from './rider.routes'
import adminRoutes from './admin.routes'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/user/home' },
  ...userRoutes,
  ...merchantRoutes,
  ...riderRoutes,
  ...adminRoutes,
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { requireAuth: false, title: '无权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { requireAuth: false, title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

setupGuards(router)

export default router
