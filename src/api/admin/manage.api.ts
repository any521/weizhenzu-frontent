import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface AdminUserVO {
  id: number
  nickname: string
  avatar: string
  phone: string
  gender: number
  status: number
  statusDesc: string
  orderCount: number
  totalAmount: number
  createdAt: string
  lastLoginAt: string
}

export interface AdminMerchantVO {
  id: number
  name: string
  logo: string
  phone: string
  contactName: string
  contactPhone: string
  address: string
  categoryId: number
  categoryName: string
  status: number
  statusDesc: string
  rating: number
  monthlySales: number
  businessLicense: string
  createdAt: string
}

export interface AdminRiderVO {
  id: number
  name: string
  phone: string
  avatar: string
  idCard: string
  status: number
  statusDesc: string
  online: boolean
  rating: number
  totalOrders: number
  todayOrders: number
  createdAt: string
}

export interface AdminOrderVO {
  id: number
  orderNo: string
  userId: number
  userNickname: string
  merchantId: number
  merchantName: string
  riderId: number
  riderName: string
  status: number
  statusDesc: string
  payStatus: number
  payAmount: number
  payType: number
  createdAt: string
  paidTime: string
  completeTime: string
}

export interface AdminRefundVO {
  id: number
  refundNo: string
  orderId: number
  orderNo: string
  userId: number
  userNickname: string
  merchantId: number
  merchantName: string
  amount: number
  reason: string
  status: number
  statusDesc: string
  applyTime: string
  approveTime: string
  refundTime: string
  rejectReason: string
}

export interface UserQuery extends PageQuery {
  status?: number
  phone?: string
}

export interface MerchantQuery extends PageQuery {
  status?: number
  categoryId?: number
  name?: string
}

export interface RiderQuery extends PageQuery {
  status?: number
  online?: boolean
}

export interface OrderQuery extends PageQuery {
  status?: number
  payStatus?: number
  merchantId?: number
  startDate?: string
  endDate?: string
}

// ============== 用户管理 ==============
export function getUsers(params: UserQuery) {
  return request<PageResult<AdminUserVO>>({
    url: '/admin/users',
    method: 'GET',
    params
  })
}

export function updateUserStatus(id: number, status: number) {
  return request<void>({
    url: `/admin/users/${id}/status`,
    method: 'PUT',
    params: { status }
  })
}

// ============== 商家管理 ==============
export function getMerchants(params: MerchantQuery) {
  return request<PageResult<AdminMerchantVO>>({
    url: '/admin/merchants',
    method: 'GET',
    params
  })
}

export function updateMerchantStatus(id: number, status: number) {
  return request<void>({
    url: `/admin/merchants/${id}/status`,
    method: 'PUT',
    params: { status }
  })
}

export function auditMerchant(id: number, data: { approved: boolean; reason?: string }) {
  return request<void>({
    url: `/admin/merchants/${id}/audit`,
    method: 'POST',
    data
  })
}

// ============== 骑手管理 ==============
export function getRiders(params: RiderQuery) {
  return request<PageResult<AdminRiderVO>>({
    url: '/admin/riders',
    method: 'GET',
    params
  })
}

export function updateRiderStatus(id: number, status: number) {
  return request<void>({
    url: `/admin/riders/${id}/status`,
    method: 'PUT',
    params: { status }
  })
}

// ============== 订单管理 ==============
export function getOrders(params: OrderQuery) {
  return request<PageResult<AdminOrderVO>>({
    url: '/admin/orders',
    method: 'GET',
    params
  })
}

export function getOrderDetail(id: number) {
  return request<AdminOrderVO>({
    url: `/admin/orders/${id}`,
    method: 'GET'
  })
}

export function closeOrder(id: number, reason: string) {
  return request<void>({
    url: `/admin/orders/${id}/close`,
    method: 'POST',
    params: { reason }
  })
}

// ============== 退款管理 ==============
export function getRefunds(params: PageQuery & { status?: number }) {
  return request<PageResult<AdminRefundVO>>({
    url: '/admin/refunds',
    method: 'GET',
    params
  })
}

export function approveRefund(id: number, data: { approved: boolean; reason?: string }) {
  return request<void>({
    url: `/admin/refunds/${id}/audit`,
    method: 'POST',
    data
  })
}

// ============== 数据大盘 ==============
export function getDashboard() {
  return request<{
    userCount: number
    merchantCount: number
    riderCount: number
    todayOrderCount: number
    todayRevenue: number
    pendingRefundCount: number
    pendingMerchantCount: number
    weeklyStats: Array<{ date: string; orders: number; revenue: number }>
    categoryDistribution: Array<{ name: string; value: number }>
  }>({
    url: '/admin/dashboard',
    method: 'GET'
  })
}
