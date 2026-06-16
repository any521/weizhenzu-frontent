import { request } from '@/api/request'

export interface DishSpecVO {
  id: number
  name: string
  price: number
  originalPrice?: number
  stock: number
}

export interface DishVO {
  id: number
  merchantId: number
  merchantName: string
  categoryId: number
  categoryName: string
  name: string
  description: string
  image: string
  images: string[]
  price: number
  originalPrice?: number
  boxPrice: number
  sales: number
  stock: number
  status: number
  rating: number
  tags: string[]
  specs: DishSpecVO[]
  isFavorite: boolean
}

export interface DishCategoryVO {
  id: number
  name: string
  sort: number
  dishCount: number
}

/** 商家菜单（分类 + 菜品） */
export function getMerchantMenu(merchantId: number) {
  return request<{
    categories: DishCategoryVO[]
    dishes: DishVO[]
  }>({
    url: `/user/merchants/${merchantId}/menu`,
    method: 'GET'
  })
}

/** 菜品详情 */
export function getDishDetail(id: number) {
  return request<DishVO>({
    url: `/user/dishes/${id}`,
    method: 'GET'
  })
}

/** 推荐菜品 */
export function getRecommendDishes(merchantId?: number) {
  return request<DishVO[]>({
    url: '/user/dishes/recommend',
    method: 'GET',
    params: { merchantId }
  })
}

/** 收藏菜品 */
export function favoriteDish(dishId: number) {
  return request<void>({
    url: `/user/dishes/${dishId}/favorite`,
    method: 'POST'
  })
}

/** 取消收藏 */
export function unfavoriteDish(dishId: number) {
  return request<void>({
    url: `/user/dishes/${dishId}/favorite`,
    method: 'DELETE'
  })
}
