/**
 * 文件下载工具
 */

import axios from 'axios'

/** 通过 URL 下载文件 */
export function downloadByUrl(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 通过 Blob 下载 */
export function downloadByBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadByUrl(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 下载文件流 */
export async function downloadFile(
  url: string,
  filename: string,
  params?: Record<string, any>
): Promise<void> {
  const response = await axios.get(url, {
    params,
    responseType: 'blob'
  })
  downloadByBlob(response.data, filename)
}

/** Base64 转 Blob */
export function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

/** 文件转 Base64 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
