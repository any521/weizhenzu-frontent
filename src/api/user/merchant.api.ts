import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface MerchantVO {
  id: number
  name: string
  logo: string
  coverImage: string
  categoryId: number
  categoryName: string
  phone: string
  address: string
  longitude: number
  latitude: number
  description: string
  notice: string
  avgPrice: number
  rating: number
  monthlySales: number
  status: number
  deliveryFee: number
  packingFee: number
  minOrderAmount: number
  deliveryTime: number
  distance?: number
  tags: string[]
  openingHours: string
}

export interface MerchantCategoryVO {
  id: number
  name: string
  icon: string
}

export interface MerchantQuery extends PageQuery {
  categoryId?: number
  lng?: number
  lat?: number
  sort?: 'distance' | 'rating' | 'sales'
}

export interface HomeVO {
  banners: Array<{ id: number; image: string; link: string }>
  categories: MerchantCategoryVO[]
  hotMerchants: MerchantVO[]
  nearbyMerchants: MerchantVO[]
  newMerchants: MerchantVO[]
}

/** 首页数据 */
export function getHomeData(lng?: number, lat?: number) {
  return request<HomeVO>({
    url: '/user/merchants/home',
    method: 'GET',
    params: { lng, lat }
  })
}

/** 商家列表 */
export function getMerchants(params: MerchantQuery) {
  return request<PageResult<MerchantVO>>({
    url: '/user/merchants',
    method: 'GET',
    params
  })
}

/** 商家详情 */
export function getMerchantDetail(id: number) {
  return request<MerchantVO>({
    url: `/user/merchants/${id}`,
    method: 'GET'
  })
}

/** 商家分类 */
export function getMerchantCategories() {
  return request<MerchantCategoryVO[]>({
    url: '/user/merchants/categories',
    method: 'GET',
    noLoading: true
  })
}

/** 搜索商家 */
export function searchMerchants(keyword: string, lng?: number, lat?: number) {
  return request<PageResult<MerchantVO>>({
    url: '/user/merchants/search',
    method: 'GET',
    params: { keyword, lng, lat }
  })
}

/** 收藏商家 */
export function favoriteMerchant(merchantId: number) {
  return request<void>({
    url: `/user/merchants/${merchantId}/favorite`,
    method: 'POST'
  })
}

/** 取消收藏 */
export function unfavoriteMerchant(merchantId: number) {
  return request<void>({
    url: `/user/merchants/${merchantId}/favorite`,
    method: 'DELETE'
  })
}

/** 收藏列表 */
export function getFavoriteMerchants(params: PageQuery) {
  return request<PageResult<MerchantVO>>({
    url: '/user/merchants/favorites',
    method: 'GET',
    params
  })
}
