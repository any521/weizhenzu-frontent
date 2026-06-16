import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderVO } from '@/api/user/order.api'

export const useOrderStore = defineStore(
  'order',
  () => {
    /** 当前进行中的订单（用于骑手/商家实时跟踪） */
    const activeOrders = ref<OrderVO[]>([])
    /** 待支付订单（用于支付提醒） */
    const pendingPayOrders = ref<OrderVO[]>([])

    function addActive(order: OrderVO) {
      const idx = activeOrders.value.findIndex(o => o.id === order.id)
      if (idx >= 0) activeOrders.value[idx] = order
      else activeOrders.value.unshift(order)
    }

    function removeActive(orderId: number) {
      activeOrders.value = activeOrders.value.filter(o => o.id !== orderId)
    }

    function addPendingPay(order: OrderVO) {
      const idx = pendingPayOrders.value.findIndex(o => o.id === order.id)
      if (idx < 0) pendingPayOrders.value.unshift(order)
    }

    function removePendingPay(orderId: number) {
      pendingPayOrders.value = pendingPayOrders.value.filter(o => o.id !== orderId)
    }

    function clear() {
      activeOrders.value = []
      pendingPayOrders.value = []
    }

    return {
      activeOrders,
      pendingPayOrders,
      addActive,
      removeActive,
      addPendingPay,
      removePendingPay,
      clear
    }
  },
  {
    persist: {
      key: 'weizhenzu-order',
      storage: localStorage
    }
  }
)
