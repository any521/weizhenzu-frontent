import { ref } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

export interface LocationInfo {
  lng: number
  lat: number
  address?: string
  province?: string
  city?: string
  district?: string
}

/**
 * 地理定位组合式函数
 */
export function useGeolocation() {
  const loading = ref(false)
  const location = ref<LocationInfo | null>(null)
  const error = ref<string>('')

  async function getCurrent(): Promise<LocationInfo | null> {
    loading.value = true
    error.value = ''
    try {
      // 1. 浏览器定位
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000
        })
      })

      const result: LocationInfo = {
        lng: pos.coords.longitude,
        lat: pos.coords.latitude
      }

      // 2. 高德逆地理编码（如果配置了 key）
      if (import.meta.env.VITE_AMAP_KEY && import.meta.env.VITE_AMAP_KEY !== 'your-amap-key') {
        try {
          const AMap = await AMapLoader.load({
            key: import.meta.env.VITE_AMAP_KEY,
            version: '2.0',
            plugins: ['AMap.Geocoder']
          })
          const geocoder = new AMap.Geocoder()
          const lnglat = [pos.coords.longitude, pos.coords.latitude]
          const address = await new Promise<any>((resolve) => {
            geocoder.getAddress(lnglat, (status: string, result: any) => {
              if (status === 'complete' && result.info === 'OK') {
                resolve(result.regeocode)
              } else {
                resolve(null)
              }
            })
          })
          if (address) {
            result.address = address.formattedAddress
            result.province = address.addressComponent?.province
            result.city = address.addressComponent?.city
            result.district = address.addressComponent?.district
          }
        } catch {
          // 高德加载失败，忽略
        }
      }

      location.value = result
      return result
    } catch (e: any) {
      error.value = e.message || '定位失败'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, location, error, getCurrent }
}
