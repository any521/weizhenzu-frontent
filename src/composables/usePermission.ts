import { useAdminStore } from '@/stores/admin'

/**
 * 权限校验组合式函数（用于管理后台）
 */
export function usePermission() {
  const adminStore = useAdminStore()

  function hasPermission(perm: string): boolean {
    return adminStore.hasPermission(perm)
  }

  function hasRole(role: string): boolean {
    return adminStore.hasRole(role)
  }

  function hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => adminStore.hasPermission(p))
  }

  function hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => adminStore.hasPermission(p))
  }

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    permissions: adminStore.permissions,
    roles: adminStore.roles
  }
}
