<template>
  <div class="rider-profile">
    <AppHeader title="个人中心" />

    <!-- 用户信息 -->
    <div class="profile-header">
      <van-image :src="profile?.avatar" round width="60" height="60" fit="cover">
        <template #error>
          <van-icon name="user-o" size="30" color="#fff" />
        </template>
      </van-image>
      <div class="info">
        <div class="name">{{ profile?.name || '骑手' }}</div>
        <div class="meta">
          <van-tag :type="profile?.online ? 'success' : 'default'" round>
            {{ profile?.online ? '在线中' : '已离线' }}
          </van-tag>
          <van-tag type="warning" round v-if="profile?.rating">
            <van-icon name="star-o" /> {{ profile.rating }}
          </van-tag>
        </div>
        <div class="phone">{{ profile?.phone }}</div>
      </div>
    </div>

    <!-- 今日数据 -->
    <div class="stat-card">
      <div class="stat-item">
        <div class="value">{{ profile?.todayOrders || 0 }}</div>
        <div class="label">今日单量</div>
      </div>
      <div class="divider"></div>
      <div class="stat-item">
        <div class="value">¥{{ formatAmount(profile?.todayIncome) }}</div>
        <div class="label">今日收入</div>
      </div>
      <div class="divider"></div>
      <div class="stat-item">
        <div class="value">{{ profile?.totalOrders || 0 }}</div>
        <div class="label">累计单量</div>
      </div>
    </div>

    <!-- 在线开关 -->
    <van-cell-group inset>
      <van-cell title="接单状态" center>
        <template #right-icon>
          <van-switch
            :model-value="!!profile?.online"
            @update:model-value="onToggleOnline"
            :loading="toggling"
          />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 菜单 -->
    <van-cell-group inset title="常用功能">
      <van-cell
        title="我的钱包"
        icon="balance-o"
        is-link
        :value="`¥${formatAmount(profile?.balance)}`"
        @click="onMenu('wallet')"
      />
      <van-cell
        title="历史订单"
        icon="orders-o"
        is-link
        @click="onMenu('history')"
      />
      <van-cell
        title="我的评价"
        icon="comment-o"
        is-link
        :value="profile?.rating ? `${profile.rating}分` : ''"
        @click="onMenu('rating')"
      />
      <van-cell
        title="修改密码"
        icon="lock"
        is-link
        @click="onMenu('password')"
      />
      <van-cell
        title="设置"
        icon="setting-o"
        is-link
        @click="onMenu('setting')"
      />
    </van-cell-group>

    <van-cell-group inset>
      <van-cell
        title="退出登录"
        icon="logout"
        is-link
        title-class="logout-text"
        @click="onLogout"
      />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog, showToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import { getProfile, logout as logoutApi, toggleOnline, type RiderProfileVO } from '@/api/rider/auth.api'
import { useRiderStore } from '@/stores/rider'
import { useUserStore } from '@/stores/user'
import { formatAmount } from '@/utils/format'

const router = useRouter()
const riderStore = useRiderStore()
const userStore = useUserStore()
const profile = ref<RiderProfileVO | null>(null)
const toggling = ref(false)

async function loadProfile() {
  try {
    const data = await getProfile()
    profile.value = data
    riderStore.setRiderInfo({
      id: data.id,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      status: data.status
    })
    riderStore.setOnline(data.online)
  } catch {
    // ignore
  }
}

async function onToggleOnline(v: boolean) {
  toggling.value = true
  try {
    await toggleOnline(v)
    if (profile.value) profile.value.online = v
    riderStore.setOnline(v)
    showSuccessToast(v ? '已上线' : '已下线')
  } catch {
    showFailToast('操作失败')
  } finally {
    toggling.value = false
  }
}

function onMenu(type: string) {
  switch (type) {
    case 'wallet':
      showToast('钱包功能开发中')
      break
    case 'history':
      router.push('/rider/history')
      break
    case 'rating':
      showToast('评价功能开发中')
      break
    case 'password':
      showToast('修改密码功能开发中')
      break
    case 'setting':
      showToast('设置功能开发中')
      break
  }
}

async function onLogout() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      confirmButtonColor: '#FF6B35'
    })
  } catch {
    return
  }
  try {
    await logoutApi()
  } catch {
    // ignore
  }
  riderStore.clear()
  userStore.logout()
  showSuccessToast('已退出登录')
  router.replace('/rider/login')
}

onMounted(loadProfile)
onActivated(loadProfile)
</script>

<style scoped lang="scss">
.rider-profile {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 16px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  margin: 10px 12px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border-radius: 8px;
  color: #fff;
  .info {
    flex: 1;
    min-width: 0;
    .name {
      font-size: 18px;
      font-weight: 700;
    }
    .meta {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .phone {
      margin-top: 6px;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}
.stat-card {
  display: flex;
  align-items: center;
  margin: 10px 12px;
  padding: 18px 0;
  background: #fff;
  border-radius: 8px;
  .stat-item {
    flex: 1;
    text-align: center;
    .value {
      font-size: 20px;
      font-weight: 700;
      color: #ff6b35;
    }
    .label {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }
  }
  .divider {
    width: 1px;
    height: 30px;
    background: #eee;
  }
}
:deep(.van-cell-group--inset) {
  margin: 10px 12px;
}
:deep(.logout-text) {
  color: #ee0a24;
}
</style>
