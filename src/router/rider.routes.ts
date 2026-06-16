import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/rider/login',
    name: 'RiderLogin',
    component: () => import('@/views/rider/auth/Login.vue'),
    meta: { requireAuth: false, title: '骑手登录' }
  },
  {
    path: '/rider',
    component: () => import('@/views/rider/layout/Layout.vue'),
    meta: { requireAuth: true, roles: [3] },
    children: [
      {
        path: 'hall',
        name: 'RiderHall',
        component: () => import('@/views/rider/hall/Index.vue'),
        meta: { title: '接单大厅' }
      },
      {
        path: 'tasks',
        name: 'RiderTasks',
        component: () => import('@/views/rider/task/Active.vue'),
        meta: { title: '进行中' }
      },
      {
        path: 'task/:id',
        name: 'RiderTaskDetail',
        component: () => import('@/views/rider/task/Detail.vue'),
        meta: { title: '任务详情' }
      },
      {
        path: 'task/:id/navigate',
        name: 'RiderNavigate',
        component: () => import('@/views/rider/task/Navigate.vue'),
        meta: { title: '导航' }
      },
      {
        path: 'income',
        name: 'RiderIncome',
        component: () => import('@/views/rider/income/Index.vue'),
        meta: { title: '收入明细' }
      },
      {
        path: 'profile',
        name: 'RiderProfile',
        component: () => import('@/views/rider/profile/Index.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'history',
        name: 'RiderHistory',
        component: () => import('@/views/rider/task/History.vue'),
        meta: { title: '历史订单' }
      }
    ]
  }
]

export default routes
