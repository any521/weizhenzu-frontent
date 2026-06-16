import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface ReviewVO {
  id: number
  orderId: number
  merchantId: number
  merchantName: string
  userId: number
  userNickname: string
  userAvatar: string
  rating: number
  content: string
  images: string[]
  deliveryRating: number
  tasteRating: number
  serviceRating: number
  reply: string
  replyTime: string
  createdAt: string
  items: Array<{ dishId: number; dishName: string }>
}

export interface ReviewCreateDTO {
  orderId: number
  rating: number
  content: string
  images?: string[]
  tasteRating?: number
  serviceRating?: number
  deliveryRating?: number
}

export interface ReviewQuery extends PageQuery {
  merchantId?: number
  rating?: number
}

/** 创建评价 */
export function createReview(data: ReviewCreateDTO) {
  return request<ReviewVO>({
    url: '/user/reviews',
    method: 'POST',
    data
  })
}

/** 商家评价列表 */
export function getMerchantReviews(params: ReviewQuery) {
  return request<PageResult<ReviewVO>>({
    url: '/user/reviews',
    method: 'GET',
    params
  })
}

/** 我的评价 */
export function getMyReviews(params: PageQuery) {
  return request<PageResult<ReviewVO>>({
    url: '/user/reviews/mine',
    method: 'GET',
    params
  })
}

/** 评价详情 */
export function getReviewDetail(id: number) {
  return request<ReviewVO>({
    url: `/user/reviews/${id}`,
    method: 'GET'
  })
}
