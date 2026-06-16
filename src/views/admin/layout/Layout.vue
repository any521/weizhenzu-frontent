<template>
  <div class="admin-layout">
    <el-container class="container">
      <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
        <div class="logo">
          <van-icon name="shop-o" size="24" color="#FF6B35" />
          <span v-if="!collapsed">味真足后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          :collapse="collapsed"
          class="menu"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#FF6B35"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>数据大盘</span>
          </el-menu-item>
          <el-sub-menu index="user-mgmt">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/users">用户列表</el-menu-item>
            <el-menu-item index="/admin/riders">骑手管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="merchant-mgmt">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>商家管理</span>
            </template>
            <el-menu-item index="/admin/merchants">商家列表</el-menu-item>
            <el-menu-item index="/admin/merchants/audit">商家审核</el-menu-item>
            <el-menu-item index="/admin/categories">类目管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="order-mgmt">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/admin/orders">订单列表</el-menu-item>
            <el-menu-item index="/admin/refunds">退款审核</el-menu-item>
            <el-menu-item index="/admin/reviews">评价管理</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/admin/coupons">
            <el-icon><Present /></el-icon>
            <span>优惠券管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/finance">
            <el-icon><Money /></el-icon>
            <span>财务管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/risk">
            <el-icon><Warning /></el-icon>
            <span>风控管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/logs">
            <el-icon><Tickets /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
          <el-menu-item index="/admin/system">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="left">
            <el-icon class="collapse-btn" @click="collapsed = !collapsed">
              <Fold v-if="!collapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right">
            <el-dropdown @command="onCommand">
              <span class="user">
                <el-avatar :size="32" :src="adminInfo?.avatar" />
                <span>{{ adminInfo?.nickname || '管理员' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { getProfile, logout as logoutApi } from '@/api/admin/auth.api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()

const collapsed = ref(false)
const adminInfo = ref<any>(null)

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '管理后台')

async function loadProfile() {
  try {
    const profile = await getProfile()
    adminInfo.value = profile
    adminStore.setAdminInfo({
      id: profile.id,
      username: profile.username,
      nickname: profile.nickname,
      avatar: profile.avatar,
      roles: profile.roles,
      permissions: profile.permissions
    })
  } catch {
    // ignore
  }
}

async function onCommand(cmd: string) {
  if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
      await logoutApi().catch(() => {})
      userStore.logout()
      adminStore.clear()
      ElMessage.success('已退出登录')
      router.push('/admin/login')
    } catch {
      // cancel
    }
  }
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  .container {
    height: 100%;
  }
  .aside {
    background: #001529;
    transition: width 0.3s;
    overflow-x: hidden;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 60px;
    padding: 0 20px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #1f1f1f;
    white-space: nowrap;
  }
  .menu {
    border-right: none;
    &:not(.el-menu--collapse) {
      width: 220px;
    }
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #eee;
    .left {
      display: flex;
      align-items: center;
      gap: 16px;
      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .right {
      .user {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
    }
  }
  .main {
    background: #f5f5f5;
    overflow-y: auto;
  }
}
</style>
