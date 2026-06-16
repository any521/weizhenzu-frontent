import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface OrderItemDTO {
  dishId: number
  specId?: number
  quantity: number
}

export interface OrderCreateDTO {
  merchantId: number
  addressId: number
  items: OrderItemDTO[]
  userCouponId?: number
  remark?: string
  clientToken: string
}

export interface OrderItemVO {
  id: number
  dishId: number
  dishName: string
  dishImage: string
  specName: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface AddressVO {
  id: number
  contactName: string
  contactPhone: string
  detail: string
  longitude: number
  latitude: number
  tag: string
  isDefault: number
}

export interface OrderVO {
  id: number
  orderNo: string
  merchantId: number
  merchantName: string
  merchantLogo: string
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
  payTime: string
  expectedTime: string
  createdAt: string
  completeTime: string
  items: OrderItemVO[]
  address: AddressVO
}

export interface OrderListItemVO {
  id: number
  orderNo: string
  merchantId: number
  merchantName: string
  merchantLogo: string
  status: number
  statusDesc: string
  payStatus: number
  itemCount: number
  payAmount: number
  createdAt: string
  items: OrderItemVO[]
}

export interface OrderQuery extends PageQuery {
  status?: number
}

export interface OrderCancelDTO {
  reason: string
}

export interface DeliveryTrackingVO {
  orderId: number
  status: number
  riderName: string
  riderPhone: string
  riderAvatar: string
  merchantName: string
  merchantAddress: string
  merchantLng: number
  merchantLat: number
  deliveryLng: number
  deliveryLat: number
  destinationLng: number
  destinationLat: number
  distance: number
  estimatedTime: number
  steps: Array<{
    title: string
    desc: string
    time: string
    done: boolean
  }>
}

/** 创建订单 */
export function createOrder(data: OrderCreateDTO) {
  return request<OrderVO>({ url: '/user/orders', method: 'POST', data })
}

/** 订单详情 */
export function getOrderDetail(id: number) {
  return request<OrderVO>({ url: `/user/orders/${id}`, method: 'GET' })
}

/** 我的订单列表 */
export function getMyOrders(params: OrderQuery) {
  return request<PageResult<OrderListItemVO>>({
    url: '/user/orders',
    method: 'GET',
    params
  })
}

/** 取消订单 */
export function cancelOrder(id: number, reason: string) {
  return request<void>({
    url: `/user/orders/${id}/cancel`,
    method: 'POST',
    params: { reason }
  })
}

/** 确认收货 */
export function confirmReceived(id: number) {
  return request<void>({
    url: `/user/orders/${id}/confirm`,
    method: 'POST'
  })
}

/** 配送跟踪 */
export function getDeliveryTracking(orderId: number) {
  return request<DeliveryTrackingVO>({
    url: `/user/orders/${orderId}/tracking`,
    method: 'GET',
    noLoading: true
  })
}

/** 申请退款 */
export function applyRefund(orderId: number, data: { reason: string; amount?: number }) {
  return request<void>({
    url: `/user/orders/${orderId}/refund`,
    method: 'POST',
    data
  })
}

/** 退款详情 */
export function getRefundDetail(orderId: number) {
  return request<any>({
    url: `/user/orders/${orderId}/refund`,
    method: 'GET'
  })
}
