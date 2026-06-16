import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface DeliveryTaskVO {
  id: number
  taskId: string
  orderId: number
  orderNo: string
  status: number
  statusDesc: string
  merchantId: number
  merchantName: string
  merchantPhone: string
  merchantAddress: string
  merchantLng: number
  merchantLat: number
  userNickname: string
  userPhone: string
  userAddress: string
  userLng: number
  userLat: number
  distance: number
  estimatedTime: number
  deliveryFee: number
  createdAt: string
  acceptedAt: string
  pickedUpAt: string
  deliveredAt: string
  items: Array<{ dishName: string; quantity: number }>
}

/** 接单大厅 */
export function getHallTasks(params: PageQuery & { lng?: number; lat?: number }) {
  return request<PageResult<DeliveryTaskVO>>({
    url: '/rider/tasks/hall',
    method: 'GET',
    params
  })
}

/** 进行中任务 */
export function getActiveTasks() {
  return request<DeliveryTaskVO[]>({
    url: '/rider/tasks/active',
    method: 'GET',
    noLoading: true
  })
}

/** 任务详情 */
export function getTaskDetail(id: number) {
  return request<DeliveryTaskVO>({
    url: `/rider/tasks/${id}`,
    method: 'GET'
  })
}

/** 抢单 */
export function grabTask(id: number) {
  return request<DeliveryTaskVO>({
    url: `/rider/tasks/${id}/grab`,
    method: 'POST'
  })
}

/** 到达商家 */
export function arriveMerchant(id: number) {
  return request<void>({
    url: `/rider/tasks/${id}/arrive`,
    method: 'POST'
  })
}

/** 取餐 */
export function pickup(id: number) {
  return request<void>({
    url: `/rider/tasks/${id}/pickup`,
    method: 'POST'
  })
}

/** 送达 */
export function deliver(id: number, proofImage?: string) {
  return request<void>({
    url: `/rider/tasks/${id}/deliver`,
    method: 'POST',
    params: { proofImage }
  })
}

/** 历史任务 */
export function getHistoryTasks(params: PageQuery & { startDate?: string; endDate?: string }) {
  return request<PageResult<DeliveryTaskVO>>({
    url: '/rider/tasks/history',
    method: 'GET',
    params
  })
}

/** 收入明细 */
export function getIncomeRecords(params: PageQuery & { startDate?: string; endDate?: string }) {
  return request<PageResult<{
    id: number
    orderId: number
    orderNo: string
    amount: number
    type: number
    typeDesc: string
    createdAt: string
  }>>({
    url: '/rider/income',
    method: 'GET',
    params
  })
}
