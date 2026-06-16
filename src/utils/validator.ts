export const phonePattern = /^1[3-9]\d{9}$/
export const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
export const emailPattern = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/
export const urlPattern = /^https?:\/\/.+$/
export const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/
export const smsCodePattern = /^\d{4,6}$/
export const usernamePattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/

export function isPhone(v: string): boolean {
  return phonePattern.test(v)
}

export function isIdCard(v: string): boolean {
  return idCardPattern.test(v)
}

export function isEmail(v: string): boolean {
  return emailPattern.test(v)
}

export function isUrl(v: string): boolean {
  return urlPattern.test(v)
}

export function isPassword(v: string): boolean {
  return passwordPattern.test(v)
}

export function isSmsCode(v: string): boolean {
  return smsCodePattern.test(v)
}

export function isUsername(v: string): boolean {
  return usernamePattern.test(v)
}

export function isPositive(v: number | string): boolean {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return !isNaN(n) && n > 0
}

export function isNonNegative(v: number | string): boolean {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return !isNaN(n) && n >= 0
}

export function isInteger(v: number | string): boolean {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return !isNaN(n) && Number.isInteger(n)
}

/** 是否为空 */
export function isEmpty(v: any): boolean {
  if (v === null || v === undefined || v === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  if (typeof v === 'object' && Object.keys(v).length === 0) return true
  return false
}

/** 范围校验 */
export function inRange(v: number, min: number, max: number): boolean {
  return v >= min && v <= max
}

/** 长度校验 */
export function lengthRange(v: string, min: number, max: number): boolean {
  return v.length >= min && v.length <= max
}

/** 表单校验规则 */
export const formRules = {
  required: (msg = '必填项') => ({
    required: true,
    message: msg
  }),
  phone: (msg = '手机号格式错误') => ({
    pattern: phonePattern,
    message: msg
  }),
  email: (msg = '邮箱格式错误') => ({
    pattern: emailPattern,
    message: msg
  }),
  password: (msg = '密码6-20位，需包含字母和数字') => ({
    pattern: passwordPattern,
    message: msg
  }),
  smsCode: (msg = '验证码为4-6位数字') => ({
    pattern: smsCodePattern,
    message: msg
  })
}
