/**
 * localStorage 封装 - 支持过期时间、JSON 序列化
 */

const PREFIX = 'weizhenzu:'

interface StorageItem<T> {
  value: T
  expire?: number
}

class Storage {
  private storage: globalThis.Storage

  constructor(storage: globalThis.Storage = localStorage) {
    this.storage = storage
  }

  /**
   * 设置
   * @param key 键
   * @param value 值
   * @param expire 过期时间（毫秒），不传则永不过期
   */
  set<T>(key: string, value: T, expire?: number): void {
    const item: StorageItem<T> = {
      value,
      expire: expire ? Date.now() + expire : undefined
    }
    try {
      this.storage.setItem(PREFIX + key, JSON.stringify(item))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  }

  /**
   * 获取
   */
  get<T = any>(key: string): T | null {
    const raw = this.storage.getItem(PREFIX + key)
    if (!raw) return null
    try {
      const item: StorageItem<T> = JSON.parse(raw)
      if (item.expire && Date.now() > item.expire) {
        this.remove(key)
        return null
      }
      return item.value
    } catch {
      return null
    }
  }

  /**
   * 删除
   */
  remove(key: string): void {
    this.storage.removeItem(PREFIX + key)
  }

  /**
   * 清空所有带前缀的
   */
  clear(): void {
    Object.keys(this.storage).forEach(k => {
      if (k.startsWith(PREFIX)) {
        this.storage.removeItem(k)
      }
    })
  }

  /**
   * 是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

export const localStore = new Storage(localStorage)
export const sessionStore = new Storage(sessionStorage)

export default localStore
