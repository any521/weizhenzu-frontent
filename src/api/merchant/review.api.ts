import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface MerchantReviewVO {
  id: number
  orderId: number
  orderNo: string
  userId: number
  userNickname: string
  userAvatar: string
  rating: number
  content: string
  images: string[]
  tasteRating: number
  serviceRating: number
  reply: string
  replyTime: string
  createdAt: string
  items: Array<{ dishId: number; dishName: string }>
}

export interface ReviewQuery extends PageQuery {
  rating?: number
  replied?: boolean
}

/** 评价列表 */
export function getReviews(params: ReviewQuery) {
  return request<PageResult<MerchantReviewVO>>({
    url: '/merchant/reviews',
    method: 'GET',
    params
  })
}

/** 评价详情 */
export function getReviewDetail(id: number) {
  return request<MerchantReviewVO>({
    url: `/merchant/reviews/${id}`,
    method: 'GET'
  })
}

/** 回复评价 */
export function replyReview(id: number, reply: string) {
  return request<void>({
    url: `/merchant/reviews/${id}/reply`,
    method: 'POST',
    params: { reply }
  })
}
