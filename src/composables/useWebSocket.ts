import { ref, onUnmounted, type Ref } from 'vue'

export interface WebSocketOptions {
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (data: any) => void
  onError?: (e: Event) => void
  autoReconnect?: boolean
  reconnectInterval?: number
}

/**
 * WebSocket 组合式函数
 */
export function useWebSocket(url: string, options: WebSocketOptions = {}) {
  const ws: Ref<WebSocket | null> = ref(null)
  const connected = ref(false)
  const messages = ref<any[]>([])
  let reconnectTimer: number | undefined
  let manualClosed = false

  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000
  } = options

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return
    manualClosed = false
    try {
      ws.value = new WebSocket(url)
    } catch (e) {
      console.error('WebSocket connect error:', e)
      scheduleReconnect()
      return
    }

    ws.value.onopen = () => {
      connected.value = true
      onOpen?.()
    }

    ws.value.onclose = () => {
      connected.value = false
      onClose?.()
      if (autoReconnect && !manualClosed) {
        scheduleReconnect()
      }
    }

    ws.value.onmessage = (e) => {
      let data: any
      try {
        data = JSON.parse(e.data)
      } catch {
        data = e.data
      }
      messages.value.push(data)
      onMessage?.(data)
    }

    ws.value.onerror = (e) => {
      connected.value = false
      onError?.(e)
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = window.setTimeout(() => {
      if (!manualClosed) connect()
    }, reconnectInterval)
  }

  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(typeof data === 'string' ? data : JSON.stringify(data))
      return true
    }
    return false
  }

  function close() {
    manualClosed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws.value?.close()
    ws.value = null
    connected.value = false
  }

  onUnmounted(close)

  return {
    ws,
    connected,
    messages,
    connect,
    send,
    close
  }
}
