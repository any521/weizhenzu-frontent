export const ORDER_STATUS = {
  PENDING_PAY: 0,
  PAID: 1,
  MERCHANT_ACCEPTED: 2,
  RIDER_TAKEN: 3,
  PICKED_UP: 4,
  DELIVERING: 5,
  DELIVERED: 6,
  COMPLETED: 7,
  CANCELED: 8,
  REFUNDING: 9,
  REFUNDED: 10
} as const

export const PAY_TYPE = {
  ALIPAY: 1,
  WECHAT: 2,
  BALANCE: 3
} as const

export const PAY_TYPE_DESC: Record<number, string> = {
  1: '支付宝',
  2: '微信支付',
  3: '余额支付'
}

export const USER_TYPE = {
  USER: 1,
  MERCHANT: 2,
  RIDER: 3,
  ADMIN: 4
} as const

export const USER_TYPE_DESC: Record<number, string> = {
  1: '用户',
  2: '商家',
  3: '骑手',
  4: '管理员'
}

export const ORDER_STATUS_DESC: Record<number, string> = {
  0: '待支付',
  1: '待接单',
  2: '商家已接单',
  3: '骑手已接单',
  4: '已取餐',
  5: '配送中',
  6: '已送达',
  7: '已完成',
  8: '已取消',
  9: '退款中',
  10: '已退款'
}

export const REFUND_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  REFUNDED: 3
} as const

export const REFUND_STATUS_DESC: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '已退款'
}

export const COUPON_TYPE = {
  FULL_REDUCE: 1,
  DISCOUNT: 2,
  CASH: 3
} as const

export const COUPON_TYPE_DESC: Record<number, string> = {
  1: '满减券',
  2: '折扣券',
  3: '现金券'
}

export const DELIVERY_TASK_STATUS = {
  PENDING: 0,
  GRABBED: 1,
  ARRIVED_MERCHANT: 2,
  PICKED_UP: 3,
  DELIVERING: 4,
  DELIVERED: 5,
  CANCELED: 6
} as const

export const STORAGE_KEYS = {
  TOKEN: 'weizhenzu-token',
  USER_INFO: 'weizhenzu-user-info',
  LOCATION: 'weizhenzu-location',
  CART: 'weizhenzu-cart'
} as const

// 主题色
export const THEME_COLOR = '#FF6B35'

// API 路径前缀
export const API_PREFIX = {
  USER: '/user',
  MERCHANT: '/merchant',
  RIDER: '/rider',
  ADMIN: '/admin',
  PUBLIC: '/public'
} as const
