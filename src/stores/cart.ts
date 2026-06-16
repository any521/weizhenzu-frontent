import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showConfirmDialog } from 'vant'

export interface CartItem {
  id: number
  merchantId: number
  merchantName: string
  dishId: number
  dishName: string
  dishImage: string
  specId?: number
  specName?: string
  unitPrice: number
  quantity: number
}

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<CartItem[]>([])
    const currentMerchantId = ref<number | null>(null)

    const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
    const totalPrice = computed(() =>
      items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    )
    const groupedByMerchant = computed(() => {
      const map = new Map<number, CartItem[]>()
      items.value.forEach(i => {
        const arr = map.get(i.merchantId) || []
        arr.push(i)
        map.set(i.merchantId, arr)
      })
      return map
    })

    /** 添加商品，跨商家时弹窗确认清空 */
    async function add(item: CartItem) {
      if (currentMerchantId.value && currentMerchantId.value !== item.merchantId) {
        try {
          await showConfirmDialog({
            title: '提示',
            message: '购物车已有其他商家的商品，是否清空并添加新商品？'
          })
          clear()
        } catch {
          throw new Error('用户取消')
        }
      }
      currentMerchantId.value = item.merchantId
      const exist = items.value.find(
        i => i.dishId === item.dishId && i.specId === item.specId
      )
      if (exist) exist.quantity += item.quantity
      else items.value.push({ ...item })
    }

    /** 直接添加（不弹窗） */
    function addDirectly(item: CartItem) {
      if (currentMerchantId.value && currentMerchantId.value !== item.merchantId) {
        clear()
      }
      currentMerchantId.value = item.merchantId
      const exist = items.value.find(
        i => i.dishId === item.dishId && i.specId === item.specId
      )
      if (exist) exist.quantity += item.quantity
      else items.value.push({ ...item })
    }

    function updateQuantity(dishId: number, specId: number | undefined, qty: number) {
      const item = items.value.find(i => i.dishId === dishId && i.specId === specId)
      if (!item) return
      if (qty <= 0) remove(dishId, specId)
      else item.quantity = qty
    }

    function increment(dishId: number, specId?: number) {
      const item = items.value.find(i => i.dishId === dishId && i.specId === specId)
      if (item) item.quantity++
    }

    function decrement(dishId: number, specId?: number) {
      const item = items.value.find(i => i.dishId === dishId && i.specId === specId)
      if (!item) return
      item.quantity--
      if (item.quantity <= 0) remove(dishId, specId)
    }

    function remove(dishId: number, specId: number | undefined) {
      items.value = items.value.filter(
        i => !(i.dishId === dishId && i.specId === specId)
      )
      if (items.value.length === 0) currentMerchantId.value = null
    }

    function clear() {
      items.value = []
      currentMerchantId.value = null
    }

    function clearByMerchant(merchantId: number) {
      items.value = items.value.filter(i => i.merchantId !== merchantId)
      if (items.value.length === 0) currentMerchantId.value = null
    }

    /** 获取某商家的购物车商品 */
    function getByMerchant(merchantId: number): CartItem[] {
      return items.value.filter(i => i.merchantId === merchantId)
    }

    return {
      items,
      currentMerchantId,
      totalCount,
      totalPrice,
      groupedByMerchant,
      add,
      addDirectly,
      updateQuantity,
      increment,
      decrement,
      remove,
      clear,
      clearByMerchant,
      getByMerchant
    }
  },
  {
    persist: {
      key: 'weizhenzu-cart',
      storage: localStorage
    }
  }
)
