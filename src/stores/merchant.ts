import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MerchantVO } from '@/api/user/merchant.api'

export const useMerchantStore = defineStore(
  'merchant',
  () => {
    const merchantInfo = ref<MerchantVO | null>(null)
    const currentMerchantId = ref<number>(0)

    function setMerchant(info: MerchantVO) {
      merchantInfo.value = info
      currentMerchantId.value = info.id
    }

    function clear() {
      merchantInfo.value = null
      currentMerchantId.value = 0
    }

    return {
      merchantInfo,
      currentMerchantId,
      setMerchant,
      clear
    }
  },
  {
    persist: {
      key: 'weizhenzu-merchant',
      storage: localStorage
    }
  }
)
