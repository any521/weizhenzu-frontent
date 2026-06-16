/** 通用响应结果 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** 分页结果 */
export interface PageResult<T = any> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

/** 分页查询 */
export interface PageQuery {
  current?: number
  size?: number
  keyword?: string
}

/** 通用枚举 */
export interface OptionItem<T = any> {
  label: string
  value: T
  disabled?: boolean
}

/** 树形节点 */
export interface TreeNode<T = any> {
  id: number
  parentId: number
  label: string
  value: T
  children?: TreeNode<T>[]
}

/** 状态枚举 */
export interface StatusOption {
  label: string
  value: number
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}
