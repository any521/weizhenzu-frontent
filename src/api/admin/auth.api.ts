import { request } from '@/api/request'

export interface AdminLoginDTO {
  username: string
  password: string
}

export interface AdminLoginVO {
  token: string
  refreshToken: string
  adminId: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
}

/** 管理员登录 */
export function login(data: AdminLoginDTO) {
  return request<AdminLoginVO>({
    url: '/admin/auth/login',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 退出 */
export function logout() {
  return request<void>({
    url: '/admin/auth/logout',
    method: 'POST',
    noLoading: true
  })
}

/** 当前用户信息 */
export function getProfile() {
  return request<{
    id: number
    username: string
    nickname: string
    avatar: string
    roles: string[]
    permissions: string[]
  }>({
    url: '/admin/auth/profile',
    method: 'GET',
    noLoading: true
  })
}

/** 修改密码 */
export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return request<void>({
    url: '/admin/auth/password',
    method: 'PUT',
    data
  })
}
