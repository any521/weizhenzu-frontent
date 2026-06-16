import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginBySms,
  loginByPassword,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  fetchUserInfo
} from '@/api/user/auth.api'
import { USER_TYPE } from '@/utils/constants'

export interface UserInfoVO {
  id: number
  nickname: string
  avatar: string
  phone?: string
  gender?: number
  birthday?: string
  email?: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const refreshTokenValue = ref<string>('')
    const userType = ref<number>(USER_TYPE.USER)
    const userInfo = ref<UserInfoVO | null>(null)

    const isLogin = computed(() => !!token.value)
    const nickname = computed(() => userInfo.value?.nickname || '游客')
    const avatar = computed(() => userInfo.value?.avatar || '')
    const userId = computed(() => userInfo.value?.id || 0)

    /** 短信登录 */
    async function login(phone: string, code: string, type: number = USER_TYPE.USER) {
      const res = await loginBySms({ phone, code, userType: type })
      token.value = res.token
      refreshTokenValue.value = res.refreshToken
      userType.value = type
      userInfo.value = {
        id: res.userId,
        nickname: res.nickname,
        avatar: res.avatar
      }
      return res
    }

    /** 密码登录 */
    async function loginWithPassword(
      account: string,
      password: string,
      type: number = USER_TYPE.USER
    ) {
      const res = await loginByPassword({ account, password, userType: type })
      token.value = res.token
      refreshTokenValue.value = res.refreshToken
      userType.value = type
      userInfo.value = {
        id: res.userId,
        nickname: res.nickname,
        avatar: res.avatar
      }
      return res
    }

    /** 获取用户信息 */
    async function fetchUserInfoAction() {
      if (!token.value) return
      try {
        const info = await fetchUserInfo()
        userInfo.value = { ...userInfo.value, ...info }
      } catch (e) {
        // ignore
      }
    }

    /** 刷新 token */
    async function refresh() {
      if (!refreshTokenValue.value) {
        logout()
        return
      }
      try {
        const res = await refreshTokenApi(refreshTokenValue.value)
        token.value = res.token
        refreshTokenValue.value = res.refreshToken
      } catch {
        logout()
      }
    }

    /** 退出登录 */
    function logout() {
      const oldToken = token.value
      token.value = ''
      refreshTokenValue.value = ''
      userInfo.value = null
      userType.value = USER_TYPE.USER
      if (oldToken) {
        logoutApi().catch(() => {})
      }
    }

    /** 更新用户信息 */
    function updateUserInfo(info: Partial<UserInfoVO>) {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...info }
      }
    }

    return {
      token,
      refreshToken: refreshTokenValue,
      userType,
      userInfo,
      isLogin,
      nickname,
      avatar,
      userId,
      login,
      loginWithPassword,
      fetchUserInfo: fetchUserInfoAction,
      refresh,
      logout,
      updateUserInfo
    }
  },
  {
    persist: {
      key: 'weizhenzu-user',
      storage: localStorage,
      paths: ['token', 'refreshToken', 'userType', 'userInfo']
    }
  }
)
