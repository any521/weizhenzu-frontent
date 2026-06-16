import { request } from '@/api/request'
import type { UserInfoVO } from '@/stores/user'

export interface LoginBySmsDTO {
  phone: string
  code: string
  userType: 1 | 2 | 3 | 4
}

export interface LoginByPasswordDTO {
  account: string
  password: string
  userType: 1 | 2 | 3 | 4
}

export interface LoginResultVO {
  token: string
  refreshToken: string
  userId: number
  nickname: string
  avatar: string
}

export interface RefreshTokenDTO {
  refreshToken: string
}

/** 发送短信验证码 */
export function sendSmsCode(phone: string, scene: 'LOGIN' | 'REGISTER' | 'RESET') {
  return request<void>({
    url: '/user/auth/sms-code',
    method: 'POST',
    data: { phone, scene },
    noAuth: true
  })
}

/** 短信登录 */
export function loginBySms(data: LoginBySmsDTO) {
  return request<LoginResultVO>({
    url: '/user/auth/login/sms',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 密码登录 */
export function loginByPassword(data: LoginByPasswordDTO) {
  return request<LoginResultVO>({
    url: '/user/auth/login/password',
    method: 'POST',
    data,
    noAuth: true
  })
}

/** 退出登录 */
export function logout() {
  return request<void>({ url: '/user/auth/logout', method: 'POST', noLoading: true })
}

/** 刷新 token */
export function refreshToken(refreshToken: string) {
  return request<LoginResultVO>({
    url: '/user/auth/refresh',
    method: 'POST',
    data: { refreshToken },
    noAuth: true,
    noLoading: true
  })
}

/** 获取当前用户信息 */
export function fetchUserInfo() {
  return request<UserInfoVO>({
    url: '/user/profile',
    method: 'GET',
    noLoading: true
  })
}

/** 修改密码 */
export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return request<void>({
    url: '/user/profile/password',
    method: 'PUT',
    data
  })
}

/** 修改昵称 */
export function updateNickname(nickname: string) {
  return request<void>({
    url: '/user/profile/nickname',
    method: 'PUT',
    params: { nickname }
  })
}

/** 修改头像 */
export function updateAvatar(avatar: string) {
  return request<void>({
    url: '/user/profile/avatar',
    method: 'PUT',
    params: { avatar }
  })
}

/** 修改性别 */
export function updateGender(gender: number) {
  return request<void>({
    url: '/user/profile/gender',
    method: 'PUT',
    params: { gender }
  })
}

/** 注销账号 */
export function deleteAccount() {
  return request<void>({
    url: '/user/profile',
    method: 'DELETE'
  })
}
