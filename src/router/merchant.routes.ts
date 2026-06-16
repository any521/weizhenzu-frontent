import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/merchant/login',
    name: 'MerchantLogin',
    component: () => import('@/views/merchant/auth/Login.vue'),
    meta: { requireAuth: false, title: '商家登录' }
  },
  {
    path: '/merchant/register',
    name: 'MerchantRegister',
    component: () => import('@/views/merchant/auth/Register.vue'),
    meta: { requireAuth: false, title: '商家入驻' }
  },
  {
    path: '/merchant',
    component: () => import('@/views/merchant/layout/Layout.vue'),
    meta: { requireAuth: true, roles: [2] },
    children: [
      {
        path: 'dashboard',
        name: 'MerchantDashboard',
        component: () => import('@/views/merchant/dashboard/Index.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'orders',
        name: 'MerchantOrders',
        component: () => import('@/views/merchant/order/List.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'orders/realtime',
        name: 'MerchantOrdersRealtime',
        component: () => import('@/views/merchant/order/Realtime.vue'),
        meta: { title: '实时订单' }
      },
      {
        path: 'dishes',
        name: 'MerchantDishes',
        component: () => import('@/views/merchant/dish/List.vue'),
        meta: { title: '菜品管理' }
      },
      {
        path: 'dishes/edit/:id?',
        name: 'MerchantDishEdit',
        component: () => import('@/views/merchant/dish/Edit.vue'),
        meta: { title: '编辑菜品' }
      },
      {
        path: 'categories',
        name: 'MerchantCategories',
        component: () => import('@/views/merchant/category/Index.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'reviews',
        name: 'MerchantReviews',
        component: () => import('@/views/merchant/review/Index.vue'),
        meta: { title: '评价管理' }
      },
      {
        path: 'finance',
        name: 'MerchantFinance',
        component: () => import('@/views/merchant/finance/Index.vue'),
        meta: { title: '财务对账' }
      },
      {
        path: 'promotions',
        name: 'MerchantPromotions',
        component: () => import('@/views/merchant/promotion/Index.vue'),
        meta: { title: '促销管理' }
      },
      {
        path: 'settings',
        name: 'MerchantSettings',
        component: () => import('@/views/merchant/settings/Index.vue'),
        meta: { title: '店铺设置' }
      },
      {
        path: 'stats',
        name: 'MerchantStats',
        component: () => import('@/views/merchant/stats/Index.vue'),
        meta: { title: '销售统计' }
      }
    ]
  }
]

export default routes
