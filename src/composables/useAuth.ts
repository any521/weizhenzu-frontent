import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

/**
 * 认证相关组合式函数
 */
export function useAuth() {
  const userStore = useUserStore()
  const loading = ref(false)

  async function login(phone: string, code: string, userType = 1) {
    loading.value = true
    try {
      await userStore.login(phone, code, userType)
      return true
    } finally {
      loading.value = false
    }
  }

  function logout() {
    userStore.logout()
    router.push('/login')
  }

  function requireRole(roles: number[]): boolean {
    if (!userStore.token) return false
    return roles.includes(userStore.userType)
  }

  return {
    userStore,
    loading,
    login,
    logout,
    requireRole,
    isLogin: userStore.isLogin
  }
}
