import { request } from '@/api/request'

export interface PayDTO {
  orderId: number
  payType: number
  clientToken?: string
}

export interface PaymentVO {
  id: number
  orderId: number
  orderNo: string
  payType: number
  payTypeDesc: string
  amount: number
  status: number
  statusDesc: string
  payUrl: string
  payQrCode: string
  tradeNo: string
  paidTime: string
  createdAt: string
}

export interface RefundVO {
  id: number
  orderId: number
  orderNo: string
  refundNo: string
  amount: number
  reason: string
  status: number
  statusDesc: string
  applyTime: string
  approveTime: string
  refundTime: string
  rejectReason: string
}

/** 创建支付 */
export function createPayment(data: PayDTO) {
  return request<PaymentVO>({
    url: '/user/payments',
    method: 'POST',
    data
  })
}

/** 查询支付状态 */
export function getPaymentStatus(orderId: number) {
  return request<PaymentVO>({
    url: `/user/payments/${orderId}`,
    method: 'GET',
    noLoading: true
  })
}

/** 退款详情 */
export function getRefundDetail(orderId: number) {
  return request<RefundVO>({
    url: `/user/refunds/${orderId}`,
    method: 'GET'
  })
}

/** 我的退款列表 */
export function getMyRefunds(params: { current?: number; size?: number }) {
  return request<any>({
    url: '/user/refunds',
    method: 'GET',
    params
  })
}
