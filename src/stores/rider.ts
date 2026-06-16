import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RiderLocation {
  lng: number
  lat: number
  updatedAt: number
}

export const useRiderStore = defineStore(
  'rider',
  () => {
    const riderInfo = ref<{
      id: number
      name: string
      phone: string
      avatar: string
      status: number
    } | null>(null)
    const currentLocation = ref<RiderLocation | null>(null)
    const online = ref<boolean>(false)

    function setRiderInfo(info: any) {
      riderInfo.value = info
    }

    function updateLocation(lng: number, lat: number) {
      currentLocation.value = {
        lng,
        lat,
        updatedAt: Date.now()
      }
    }

    function setOnline(v: boolean) {
      online.value = v
    }

    function clear() {
      riderInfo.value = null
      currentLocation.value = null
      online.value = false
    }

    return {
      riderInfo,
      currentLocation,
      online,
      setRiderInfo,
      updateLocation,
      setOnline,
      clear
    }
  },
  {
    persist: {
      key: 'weizhenzu-rider',
      storage: localStorage
    }
  }
)
