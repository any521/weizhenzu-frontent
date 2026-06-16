import { request } from '@/api/request'

export interface MerchantLoginDTO {
  account: string
  password: string
}

export interface MerchantLoginVO {
  token: string
  refreshToken: string
  merchantId: number
  name: string
  logo: string
}

export interface MerchantRegisterDTO {
  name: string
  phone: string
  password: string
  categoryId: number
  address: string
  longitude: number
  latitude: number
  contactName: string
  contactPhone: string
  businessLicense: string
}

export interface MerchantProfileVO {
  id: number
  name: string
  logo: string
  coverImage: string
  categoryId: number
  categoryName: string
  phone: string
  contactName: string
  contactPhone: string
  address: string
  longitude: number
  latitude: number
  description: string
  notice: string
  avgPrice: number
  rating: number
  monthlySales: number
  status: number
  statusDesc: string
  deliveryFee: number
  packingFee: number
  minOrderAmount: number
  deliveryTime: number
  openingHours: string
  createdAt: string
}

/** 商家登录 */
export function login(data: MerchantLoginDTO) {
  return request<MerchantLoginVO>({
    url: '/merchant/auth/login',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 退出 */
export function logout() {
  return request<void>({
    url: '/merchant/auth/logout',
    method: 'POST',
    noLoading: true
  })
}

/** 注册 */
export function register(data: MerchantRegisterDTO) {
  return request<void>({
    url: '/merchant/auth/register',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 获取商家信息 */
export function getProfile() {
  return request<MerchantProfileVO>({
    url: '/merchant/profile',
    method: 'GET',
    noLoading: true
  })
}

/** 修改商家信息 */
export function updateProfile(data: Partial<MerchantProfileVO>) {
  return request<void>({
    url: '/merchant/profile',
    method: 'PUT',
    data
  })
}

/** 修改密码 */
export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return request<void>({
    url: '/merchant/profile/password',
    method: 'PUT',
    data
  })
}

/** 营业状态切换 */
export function toggleBusinessStatus(open: boolean) {
  return request<void>({
    url: '/merchant/profile/business-status',
    method: 'PUT',
    params: { open }
  })
}
