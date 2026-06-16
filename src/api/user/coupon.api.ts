import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface CouponVO {
  id: number
  name: string
  type: number
  typeDesc: string
  amount: number
  threshold: number
  discount: number
  scope: number
  scopeDesc: string
  validType: number
  validStartTime: string
  validEndTime: string
  validDays: number
  description: string
  status: number
  received: boolean
}

export interface UserCouponVO {
  id: number
  couponId: number
  coupon: CouponVO
  status: number
  statusDesc: string
  usedTime: string
  expiredTime: string
  orderId: number
}

/** 可领取优惠券列表 */
export function getAvailableCoupons() {
  return request<CouponVO[]>({
    url: '/user/coupons/available',
    method: 'GET'
  })
}

/** 领取优惠券 */
export function receiveCoupon(couponId: number) {
  return request<void>({
    url: `/user/coupons/${couponId}/receive`,
    method: 'POST'
  })
}

/** 我的优惠券 */
export function getMyCoupons(params: PageQuery & { status?: number }) {
  return request<PageResult<UserCouponVO>>({
    url: '/user/coupons',
    method: 'GET',
    params
  })
}

/** 下单可用优惠券 */
export function getUsableCoupons(merchantId: number, amount: number) {
  return request<UserCouponVO[]>({
    url: '/user/coupons/usable',
    method: 'GET',
    params: { merchantId, amount }
  })
}
