import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface MerchantOrderVO {
  id: number
  orderNo: string
  userId: number
  userNickname: string
  userPhone: string
  status: number
  statusDesc: string
  payStatus: number
  itemCount: number
  totalAmount: number
  packingFee: number
  deliveryFee: number
  couponAmount: number
  payAmount: number
  remark: string
  payType: number
  expectedTime: string
  createdAt: string
  items: Array<{
    id: number
    dishId: number
    dishName: string
    dishImage: string
    specName: string
    unitPrice: number
    quantity: number
    subtotal: number
  }>
  address: {
    contactName: string
    contactPhone: string
    detail: string
    longitude: number
    latitude: number
  }
}

export interface MerchantOrderQuery extends PageQuery {
  status?: number
  startDate?: string
  endDate?: string
}

/** 订单列表 */
export function getOrders(params: MerchantOrderQuery) {
  return request<PageResult<MerchantOrderVO>>({
    url: '/merchant/orders',
    method: 'GET',
    params
  })
}

/** 订单详情 */
export function getOrderDetail(id: number) {
  return request<MerchantOrderVO>({
    url: `/merchant/orders/${id}`,
    method: 'GET'
  })
}

/** 接单 */
export function acceptOrder(id: number) {
  return request<void>({
    url: `/merchant/orders/${id}/accept`,
    method: 'POST'
  })
}

/** 拒单 */
export function rejectOrder(id: number, reason: string) {
  return request<void>({
    url: `/merchant/orders/${id}/reject`,
    method: 'POST',
    params: { reason }
  })
}

/** 备餐完成 */
export function markReady(id: number) {
  return request<void>({
    url: `/merchant/orders/${id}/ready`,
    method: 'POST'
  })
}

/** 实时订单（待处理） */
export function getRealtimeOrders() {
  return request<MerchantOrderVO[]>({
    url: '/merchant/orders/realtime',
    method: 'GET',
    noLoading: true
  })
}

/** 销售统计 */
export function getSalesStats(params: { startDate: string; endDate: string }) {
  return request<{
    totalOrders: number
    totalAmount: number
    avgOrderAmount: number
    dailyStats: Array<{ date: string; orders: number; amount: number }>
    topDishes: Array<{ dishId: number; dishName: string; sales: number; amount: number }>
  }>({
    url: '/merchant/orders/stats',
    method: 'GET',
    params
  })
}
