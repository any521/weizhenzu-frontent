import { request } from '@/api/request'

export interface AddressDTO {
  contactName: string
  contactPhone: string
  province?: string
  city?: string
  district?: string
  detail: string
  longitude: number
  latitude: number
  tag?: string
  isDefault?: number
}

export interface AddressVO {
  id: number
  contactName: string
  contactPhone: string
  province: string
  city: string
  district: string
  detail: string
  fullAddress: string
  longitude: number
  latitude: number
  tag: string
  isDefault: number
  createdAt: string
}

/** 地址列表 */
export function getAddresses() {
  return request<AddressVO[]>({
    url: '/user/addresses',
    method: 'GET'
  })
}

/** 地址详情 */
export function getAddressDetail(id: number) {
  return request<AddressVO>({
    url: `/user/addresses/${id}`,
    method: 'GET'
  })
}

/** 新增地址 */
export function createAddress(data: AddressDTO) {
  return request<AddressVO>({
    url: '/user/addresses',
    method: 'POST',
    data
  })
}

/** 修改地址 */
export function updateAddress(id: number, data: AddressDTO) {
  return request<void>({
    url: `/user/addresses/${id}`,
    method: 'PUT',
    data
  })
}

/** 删除地址 */
export function deleteAddress(id: number) {
  return request<void>({
    url: `/user/addresses/${id}`,
    method: 'DELETE'
  })
}

/** 设为默认 */
export function setDefaultAddress(id: number) {
  return request<void>({
    url: `/user/addresses/${id}/default`,
    method: 'PUT'
  })
}
