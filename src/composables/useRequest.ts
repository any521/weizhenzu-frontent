import { ref, type Ref } from 'vue'
import { request } from '@/api/request'

/**
 * 通用请求组合式函数
 */
export function useRequest<T>(fn: (...args: any[]) => Promise<T>, options?: {
  immediate?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (e: Error) => void
}) {
  const data: Ref<T | undefined> = ref(options?.initialData) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<string>('')

  async function execute(...args: any[]) {
    loading.value = true
    error.value = ''
    try {
      const result = await fn(...args)
      data.value = result as any
      options?.onSuccess?.(result)
      return result
    } catch (e: any) {
      error.value = e.message || '请求失败'
      options?.onError?.(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  if (options?.immediate) {
    execute().catch(() => {})
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh: execute
  }
}

/**
 * 简易 GET 请求
 */
export function useGet<T>(url: string, params?: Record<string, any>, options?: {
  immediate?: boolean
  noLoading?: boolean
}) {
  return useRequest<T>(
    () =>
      request<T>({
        url,
        method: 'GET',
        params,
        noLoading: options?.noLoading
      }),
    { immediate: options?.immediate }
  )
}
