import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/auth/Login.vue'),
    meta: { requireAuth: false, title: '管理员登录' }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/layout/Layout.vue'),
    meta: { requireAuth: true, roles: [4] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/dashboard/Index.vue'),
        meta: { title: '数据大盘' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/user/Index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'merchants',
        name: 'AdminMerchants',
        component: () => import('@/views/admin/merchant/Index.vue'),
        meta: { title: '商家管理' }
      },
      {
        path: 'merchants/audit',
        name: 'AdminMerchantAudit',
        component: () => import('@/views/admin/merchant/Audit.vue'),
        meta: { title: '商家审核' }
      },
      {
        path: 'riders',
        name: 'AdminRiders',
        component: () => import('@/views/admin/rider/Index.vue'),
        meta: { title: '骑手管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/order/Index.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'refunds',
        name: 'AdminRefunds',
        component: () => import('@/views/admin/refund/Index.vue'),
        meta: { title: '退款审核' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/category/Index.vue'),
        meta: { title: '类目管理' }
      },
      {
        path: 'coupons',
        name: 'AdminCoupons',
        component: () => import('@/views/admin/coupon/Index.vue'),
        meta: { title: '优惠券管理' }
      },
      {
        path: 'finance',
        name: 'AdminFinance',
        component: () => import('@/views/admin/finance/Index.vue'),
        meta: { title: '财务管理' }
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('@/views/admin/review/Index.vue'),
        meta: { title: '评价管理' }
      },
      {
        path: 'risk',
        name: 'AdminRisk',
        component: () => import('@/views/admin/risk/Index.vue'),
        meta: { title: '风控管理' }
      },
      {
        path: 'system',
        name: 'AdminSystem',
        component: () => import('@/views/admin/system/Index.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/log/Index.vue'),
        meta: { title: '操作日志' }
      }
    ]
  }
]

export default routes
