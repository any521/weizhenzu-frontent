import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AdminInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export const useAdminStore = defineStore(
  'admin',
  () => {
    const adminInfo = ref<AdminInfo | null>(null)
    const permissions = ref<string[]>([])
    const roles = ref<string[]>([])

    function setAdminInfo(info: AdminInfo) {
      adminInfo.value = info
      permissions.value = info.permissions || []
      roles.value = info.roles || []
    }

    function hasPermission(perm: string): boolean {
      if (!permissions.value.length) return true
      return permissions.value.includes(perm) || permissions.value.includes('*')
    }

    function hasRole(role: string): boolean {
      if (!roles.value.length) return true
      return roles.value.includes(role)
    }

    function clear() {
      adminInfo.value = null
      permissions.value = []
      roles.value = []
    }

    return {
      adminInfo,
      permissions,
      roles,
      setAdminInfo,
      hasPermission,
      hasRole,
      clear
    }
  },
  {
    persist: {
      key: 'weizhenzu-admin',
      storage: localStorage
    }
  }
)
