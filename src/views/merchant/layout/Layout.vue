<template>
  <div class="merchant-layout">
    <el-container class="container">
      <el-aside width="220px" class="aside">
        <div class="logo">
          <van-icon name="shop-o" size="24" color="#FF6B35" />
          <span>味真足商家</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#FF6B35"
        >
          <el-menu-item index="/merchant/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/merchant/orders/realtime">
            <el-icon><Bell /></el-icon>
            <span>实时订单</span>
          </el-menu-item>
          <el-menu-item index="/merchant/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/dishes">
            <el-icon><Food /></el-icon>
            <span>菜品管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/categories">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/promotions">
            <el-icon><Present /></el-icon>
            <span>促销管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/finance">
            <el-icon><Money /></el-icon>
            <span>财务对账</span>
          </el-menu-item>
          <el-menu-item index="/merchant/stats">
            <el-icon><TrendCharts /></el-icon>
            <span>销售统计</span>
          </el-menu-item>
          <el-menu-item index="/merchant/settings">
            <el-icon><Setting /></el-icon>
            <span>店铺设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="left">
            <span class="merchant-name">{{ merchantName || '味真足商家' }}</span>
            <el-tag v-if="businessOpen" type="success" size="small">营业中</el-tag>
            <el-tag v-else type="info" size="small">休息中</el-tag>
          </div>
          <div class="right">
            <el-switch
              v-model="businessOpen"
              active-text="营业"
              inactive-text="休息"
              @change="onToggleBusiness"
            />
            <el-dropdown @command="onCommand">
              <span class="user">
                <el-avatar :size="32" :src="merchantLogo" />
                <span>{{ merchantName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="settings">店铺设置</el-dropdown-item>
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
import { useUserStore } from '@/stores/user'
import { useMerchantStore } from '@/stores/merchant'
import { getProfile, toggleBusinessStatus, logout as logoutApi } from '@/api/merchant/auth.api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const merchantStore = useMerchantStore()

const businessOpen = ref(false)
const merchantName = ref('')
const merchantLogo = ref('')

const activeMenu = computed(() => route.path)

async function loadProfile() {
  try {
    const profile = await getProfile()
    merchantName.value = profile.name
    merchantLogo.value = profile.logo
    businessOpen.value = profile.status === 1
    merchantStore.setMerchant(profile as any)
  } catch {
    // ignore
  }
}

async function onToggleBusiness(v: any) {
  try {
    await toggleBusinessStatus(v as boolean)
    ElMessage.success(v ? '已开启营业' : '已关闭营业')
  } catch {
    businessOpen.value = !v
  }
}

async function onCommand(cmd: string) {
  if (cmd === 'settings') {
    router.push('/merchant/settings')
  } else if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
      await logoutApi().catch(() => {})
      userStore.logout()
      merchantStore.clear()
      ElMessage.success('已退出登录')
      router.push('/merchant/login')
    } catch {
      // cancel
    }
  }
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.merchant-layout {
  height: 100vh;
  .container {
    height: 100%;
  }
  .aside {
    background: #001529;
    overflow-y: auto;
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
  }
  .menu {
    border-right: none;
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
      gap: 12px;
      .merchant-name {
        font-size: 16px;
        font-weight: 600;
      }
    }
    .right {
      display: flex;
      align-items: center;
      gap: 16px;
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
