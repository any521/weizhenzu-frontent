import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/auth/Login.vue'),
    meta: { requireAuth: false, title: '登录' }
  },
  {
    path: '/user',
    component: () => import('@/views/user/layout/Layout.vue'),
    meta: { requireAuth: true, roles: [1] },
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('@/views/user/home/Index.vue'),
        meta: { title: '首页', keepAlive: true, tabbar: true }
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/order/MyOrders.vue'),
        meta: { title: '我的订单', tabbar: true }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/profile/Index.vue'),
        meta: { title: '我的', tabbar: true }
      },
      {
        path: 'search',
        name: 'UserSearch',
        component: () => import('@/views/user/search/Index.vue'),
        meta: { title: '搜索' }
      },
      {
        path: 'search/result',
        name: 'UserSearchResult',
        component: () => import('@/views/user/search/Result.vue'),
        meta: { title: '搜索结果' }
      },
      {
        path: 'merchant/:id',
        name: 'UserMerchant',
        component: () => import('@/views/user/merchant/Detail.vue'),
        meta: { title: '商家详情' }
      },
      {
        path: 'dish/:id',
        name: 'UserDish',
        component: () => import('@/views/user/dish/Detail.vue'),
        meta: { title: '菜品详情' }
      },
      {
        path: 'cart',
        name: 'UserCart',
        component: () => import('@/views/user/cart/Index.vue'),
        meta: { title: '购物车' }
      },
      {
        path: 'checkout',
        name: 'UserCheckout',
        component: () => import('@/views/user/order/Checkout.vue'),
        meta: { title: '确认订单' }
      },
      {
        path: 'payment/:orderId',
        name: 'UserPayment',
        component: () => import('@/views/user/payment/Cashier.vue'),
        meta: { title: '收银台' }
      },
      {
        path: 'payment/result',
        name: 'UserPaymentResult',
        component: () => import('@/views/user/payment/Result.vue'),
        meta: { title: '支付结果', requireAuth: false }
      },
      {
        path: 'order/:id',
        name: 'UserOrderDetail',
        component: () => import('@/views/user/order/Detail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'order/:id/delivery',
        name: 'UserOrderDelivery',
        component: () => import('@/views/user/order/Delivery.vue'),
        meta: { title: '配送跟踪' }
      },
      {
        path: 'order/:id/map',
        name: 'UserOrderMap',
        component: () => import('@/views/user/order/Map.vue'),
        meta: { title: '地图导航' }
      },
      {
        path: 'order/:id/rating',
        name: 'UserOrderRating',
        component: () => import('@/views/user/order/Rating.vue'),
        meta: { title: '评价' }
      },
      {
        path: 'order/:id/refund',
        name: 'UserOrderRefund',
        component: () => import('@/views/user/order/RefundApply.vue'),
        meta: { title: '申请退款' }
      },
      {
        path: 'refund/:id',
        name: 'UserRefundDetail',
        component: () => import('@/views/user/order/RefundDetail.vue'),
        meta: { title: '退款详情' }
      },
      {
        path: 'address',
        name: 'UserAddressList',
        component: () => import('@/views/user/address/List.vue'),
        meta: { title: '地址管理' }
      },
      {
        path: 'address/edit/:id?',
        name: 'UserAddressEdit',
        component: () => import('@/views/user/address/Edit.vue'),
        meta: { title: '编辑地址' }
      },
      {
        path: 'address/map',
        name: 'UserAddressMap',
        component: () => import('@/views/user/address/MapPicker.vue'),
        meta: { title: '选择位置' }
      },
      {
        path: 'coupons',
        name: 'UserCoupons',
        component: () => import('@/views/user/coupon/Index.vue'),
        meta: { title: '我的卡券' }
      },
      {
        path: 'messages',
        name: 'UserMessages',
        component: () => import('@/views/user/message/Index.vue'),
        meta: { title: '消息中心' }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/settings/Index.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'service',
        name: 'UserService',
        component: () => import('@/views/user/service/Index.vue'),
        meta: { title: '客服中心' }
      },
      {
        path: 'favorites',
        name: 'UserFavorites',
        component: () => import('@/views/user/favorite/Index.vue'),
        meta: { title: '我的收藏' }
      }
    ]
  }
]

export default routes
