import { request } from '@/api/request'

export interface CartItemVO {
  id: number
  merchantId: number
  merchantName: string
  dishId: number
  dishName: string
  dishImage: string
  specId?: number
  specName?: string
  unitPrice: number
  quantity: number
  stock: number
}

export interface CartVO {
  merchantId: number
  merchantName: string
  items: CartItemVO[]
  totalAmount: number
  totalCount: number
}

export interface CartAddDTO {
  merchantId: number
  dishId: number
  specId?: number
  quantity: number
}

export interface CartUpdateDTO {
  quantity: number
}

/** 获取购物车 */
export function getCart() {
  return request<CartVO>({
    url: '/user/cart',
    method: 'GET',
    noLoading: true
  })
}

/** 添加到购物车 */
export function addToCart(data: CartAddDTO) {
  return request<CartVO>({
    url: '/user/cart',
    method: 'POST',
    data,
    noLoading: true
  })
}

/** 修改数量 */
export function updateCartItem(itemId: number, data: CartUpdateDTO) {
  return request<CartVO>({
    url: `/user/cart/${itemId}`,
    method: 'PUT',
    data,
    noLoading: true
  })
}

/** 删除购物车项 */
export function removeCartItem(itemId: number) {
  return request<CartVO>({
    url: `/user/cart/${itemId}`,
    method: 'DELETE',
    noLoading: true
  })
}

/** 清空购物车 */
export function clearCart() {
  return request<void>({
    url: '/user/cart',
    method: 'DELETE',
    noLoading: true
  })
}
