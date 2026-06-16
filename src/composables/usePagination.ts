import { ref, reactive } from 'vue'
import type { PageQuery, PageResult } from '@/api/types'

/**
 * 分页组合式函数
 */
export function usePagination<T>(
  fetchFn: (params: PageQuery & Record<string, any>) => Promise<PageResult<T>>,
  options?: {
    defaultSize?: number
    immediate?: boolean
    extraParams?: Record<string, any>
  }
) {
  const list = ref<T[]>([]) as any
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  const error = ref<string>('')

  const pagination = reactive({
    current: 1,
    size: options?.defaultSize || 10,
    total: 0,
    pages: 0
  })

  async function loadData(isRefresh = false) {
    if (loading.value) return
    loading.value = true
    error.value = ''
    if (isRefresh) {
      pagination.current = 1
      finished.value = false
    }
    try {
      const res = await fetchFn({
        current: pagination.current,
        size: pagination.size,
        ...options?.extraParams
      })
      if (isRefresh) {
        list.value = res.records
      } else {
        list.value = [...list.value, ...res.records]
      }
      pagination.total = res.total
      pagination.pages = res.pages
      if (list.value.length >= res.total || res.records.length === 0) {
        finished.value = true
      } else {
        pagination.current++
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  function refresh() {
    refreshing.value = true
    return loadData(true)
  }

  function loadMore() {
    if (finished.value || loading.value) return
    return loadData(false)
  }

  function reset() {
    list.value = []
    pagination.current = 1
    pagination.total = 0
    pagination.pages = 0
    finished.value = false
    error.value = ''
  }

  if (options?.immediate) {
    loadData(true).catch(() => {})
  }

  return {
    list,
    loading,
    finished,
    refreshing,
    error,
    pagination,
    loadData,
    refresh,
    loadMore,
    reset
  }
}
