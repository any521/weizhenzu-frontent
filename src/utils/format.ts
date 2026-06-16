import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/** 金额分转元（如有需要） */
export function fenToYuan(fen: number): number {
  return fen / 100
}

/** 金额元转分 */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100)
}

/** 金额格式化 ¥123.45 */
export function formatMoney(amount: number | string | undefined | null, withSymbol = true): string {
  if (amount === undefined || amount === null || amount === '') {
    return withSymbol ? '¥0.00' : '0.00'
  }
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return withSymbol ? '¥0.00' : '0.00'
  const s = n.toFixed(2)
  return withSymbol ? `¥${s}` : s
}

/** 金额格式化（不带货币符号，保留两位小数） */
export function formatAmount(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '0.00'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '0.00'
  return n.toFixed(2)
}

/** 手机号脱敏 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

/** 身份证脱敏 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4)
}

/** 姓名脱敏 */
export function maskName(name: string): string {
  if (!name) return name
  if (name.length <= 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

/** 日期格式化 */
export function formatDate(
  date: string | Date | undefined | null,
  fmt = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return ''
  return d.format(fmt)
}

/** 短日期 */
export function formatDateShort(date: string | Date | undefined | null): string {
  return formatDate(date, 'YYYY-MM-DD')
}

/** 时间 */
export function formatTime(date: string | Date | undefined | null): string {
  return formatDate(date, 'HH:mm')
}

/** 相对时间 */
export function fromNow(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = dayjs(date)
  if (!d.isValid()) return ''
  return d.fromNow()
}

/** 距离格式化 */
export function formatDistance(meter: number): string {
  if (meter === undefined || meter === null || isNaN(meter)) return '-'
  if (meter < 1000) return `${Math.round(meter)}m`
  return `${(meter / 1000).toFixed(1)}km`
}

/** 时长格式化（分钟转 x小时y分钟） */
export function formatDuration(minutes: number): string {
  if (!minutes) return '0分钟'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分钟`
  if (m === 0) return `${h}小时`
  return `${h}小时${m}分钟`
}

/** 秒转 mm:ss */
export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 文件大小格式化 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/** 数字千分位 */
export function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 截取字符串 */
export function truncate(str: string, len: number, suffix = '...'): string {
  if (!str) return ''
  if (str.length <= len) return str
  return str.slice(0, len) + suffix
}

/** 生成订单号 */
export function generateOrderNo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `${y}${m}${d}${h}${mi}${s}${rand}`
}

/** 生成客户端 Token（用于幂等） */
export function generateClientToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
