import { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export function setupGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    document.title = (to.meta.title as string) || import.meta.env.VITE_APP_TITLE || '味真足'

    const userStore = useUserStore()
    const requireAuth = to.meta.requireAuth !== false
    const allowedRoles = to.meta.roles as number[] | undefined

    if (!requireAuth) return next()

    if (!userStore.token) {
      const loginPath = getLoginPathByRoute(to.path)
      return next({ path: loginPath, query: { redirect: to.fullPath } })
    }

    // 角色校验
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userStore.userType)) {
        return next({ path: '/403' })
      }
    }

    // 用户信息未加载
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch {
        userStore.logout()
        const loginPath = getLoginPathByRoute(to.path)
        return next({ path: loginPath })
      }
    }
    next()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

function getLoginPathByRoute(path: string): string {
  if (path.startsWith('/merchant')) return '/merchant/login'
  if (path.startsWith('/rider')) return '/rider/login'
  if (path.startsWith('/admin')) return '/admin/login'
  return '/login'
}
