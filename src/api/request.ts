import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { showFailToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Result } from './types'

const service: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token && !(config as any).noAuth) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    // 全局 loading（可由 config.noLoading 关闭）
    if (!(config as any).noLoading) {
      showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
        loadingType: 'spinner'
      })
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    closeToast()
    const res = response.data
    // 二进制流直接返回
    if (response.config.responseType === 'blob') {
      return response as any
    }
    if (res.code === 200) return res.data as any

    if (res.code === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      return Promise.reject(new Error(res.message || '登录已过期'))
    }
    showFailToast(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    closeToast()
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    } else if (error.message?.includes('timeout')) {
      showFailToast('请求超时')
    } else if (error.message === 'Network Error') {
      showFailToast('网络异常')
    } else {
      showFailToast(error.response?.data?.message || '系统繁忙')
    }
    return Promise.reject(error)
  }
)

export interface RequestOptions {
  noLoading?: boolean
  noAuth?: boolean
}

export function request<T = any>(config: AxiosRequestConfig & RequestOptions): Promise<T> {
  return service(config) as unknown as Promise<T>
}

export default service
