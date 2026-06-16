import { request } from '@/api/request'
import type { PageResult, PageQuery } from '@/api/types'

export interface MerchantDishDTO {
  categoryId: number
  name: string
  description: string
  image: string
  images?: string[]
  price: number
  originalPrice?: number
  boxPrice: number
  stock: number
  tags?: string[]
  specs?: Array<{ name: string; price: number; stock: number }>
}

export interface MerchantDishVO {
  id: number
  merchantId: number
  categoryId: number
  categoryName: string
  name: string
  description: string
  image: string
  price: number
  originalPrice?: number
  boxPrice: number
  stock: number
  sales: number
  status: number
  rating: number
  tags: string[]
  specs: Array<{ id: number; name: string; price: number; stock: number }>
  createdAt: string
  updatedAt: string
}

export interface DishCategoryVO {
  id: number
  name: string
  sort: number
  dishCount: number
}

export interface DishQuery extends PageQuery {
  categoryId?: number
  status?: number
}

/** 菜品列表 */
export function getDishes(params: DishQuery) {
  return request<PageResult<MerchantDishVO>>({
    url: '/merchant/dishes',
    method: 'GET',
    params
  })
}

/** 菜品详情 */
export function getDishDetail(id: number) {
  return request<MerchantDishVO>({
    url: `/merchant/dishes/${id}`,
    method: 'GET'
  })
}

/** 新增菜品 */
export function createDish(data: MerchantDishDTO) {
  return request<MerchantDishVO>({
    url: '/merchant/dishes',
    method: 'POST',
    data
  })
}

/** 修改菜品 */
export function updateDish(id: number, data: MerchantDishDTO) {
  return request<void>({
    url: `/merchant/dishes/${id}`,
    method: 'PUT',
    data
  })
}

/** 上架/下架 */
export function toggleDishStatus(id: number, status: number) {
  return request<void>({
    url: `/merchant/dishes/${id}/status`,
    method: 'PUT',
    params: { status }
  })
}

/** 删除菜品 */
export function deleteDish(id: number) {
  return request<void>({
    url: `/merchant/dishes/${id}`,
    method: 'DELETE'
  })
}

/** 分类列表 */
export function getCategories() {
  return request<DishCategoryVO[]>({
    url: '/merchant/dishes/categories',
    method: 'GET'
  })
}

/** 新增分类 */
export function createCategory(name: string, sort?: number) {
  return request<DishCategoryVO>({
    url: '/merchant/dishes/categories',
    method: 'POST',
    data: { name, sort }
  })
}

/** 修改分类 */
export function updateCategory(id: number, name: string, sort?: number) {
  return request<void>({
    url: `/merchant/dishes/categories/${id}`,
    method: 'PUT',
    data: { name, sort }
  })
}

/** 删除分类 */
export function deleteCategory(id: number) {
  return request<void>({
    url: `/merchant/dishes/categories/${id}`,
    method: 'DELETE'
  })
}
