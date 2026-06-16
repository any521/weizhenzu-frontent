import { request } from '@/api/request'

export interface RiderLoginDTO {
  phone: string
  password: string
}

export interface RiderLoginVO {
  token: string
  refreshToken: string
  riderId: number
  name: string
  phone: string
  avatar: string
}

export interface RiderProfileVO {
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
  todayIncome: number
  monthIncome: number
  balance: number
}

/** 骑手登录 */
export function login(data: RiderLoginDTO) {
  return request<RiderLoginVO>({
    url: '/rider/auth/login',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 退出 */
export function logout() {
  return request<void>({
    url: '/rider/auth/logout',
    method: 'POST',
    noLoading: true
  })
}

/** 个人信息 */
export function getProfile() {
  return request<RiderProfileVO>({
    url: '/rider/profile',
    method: 'GET',
    noLoading: true
  })
}

/** 修改密码 */
export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return request<void>({
    url: '/rider/profile/password',
    method: 'PUT',
    data
  })
}

/** 上线/下线 */
export function toggleOnline(online: boolean) {
  return request<void>({
    url: '/rider/profile/online',
    method: 'PUT',
    params: { online }
  })
}

/** 上报位置 */
export function reportLocation(lng: number, lat: number) {
  return request<void>({
    url: '/rider/profile/location',
    method: 'PUT',
    params: { lng, lat },
    noLoading: true
  })
}
