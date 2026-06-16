<template>
  <div class="profile-page">
    <AppHeader title="我的" />
    <div class="user-card">
      <van-image
        :src="userStore.userInfo?.avatar || defaultAvatar"
        width="64"
        height="64"
        round
        fit="cover"
      />
      <div class="info">
        <h2 class="name">{{ userStore.nickname }}</h2>
        <p class="phone" v-if="userStore.userInfo?.phone">
          {{ maskPhone(userStore.userInfo.phone) }}
        </p>
        <van-button v-else size="mini" type="primary" @click="goLogin">去登录</van-button>
      </div>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title="我的订单" is-link @click="goOrders" icon="orders-o" />
      <van-cell title="地址管理" is-link @click="goAddress" icon="location-o" />
      <van-cell title="我的卡券" is-link @click="goCoupons" icon="coupon-o" />
      <van-cell title="我的收藏" is-link @click="goFavorites" icon="like-o" />
      <van-cell title="消息中心" is-link @click="goMessages" icon="chat-o" />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="客服中心" is-link @click="goService" icon="service-o" />
      <van-cell title="设置" is-link @click="goSettings" icon="setting-o" />
      <van-cell v-if="userStore.isLogin" title="退出登录" is-link @click="onLogout" icon="cross" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import { useUserStore } from '@/stores/user'
import { maskPhone } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f5f5f5"/><circle cx="32" cy="24" r="10" fill="%23ccc"/><path d="M16 56 Q16 40 32 40 Q48 40 48 56" fill="%23ccc"/></svg>'

function goLogin() {
  router.push('/login')
}
function goOrders() {
  router.push('/user/orders')
}
function goAddress() {
  router.push('/user/address')
}
function goCoupons() {
  router.push('/user/coupons')
}
function goFavorites() {
  router.push('/user/favorites')
}
function goMessages() {
  router.push('/user/messages')
}
function goService() {
  router.push('/user/service')
}
function goSettings() {
  router.push('/user/settings')
}

async function onLogout() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定要退出登录吗？' })
    userStore.logout()
    showSuccessToast('已退出登录')
    router.push('/login')
  } catch {
    // 取消
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 16px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  .info {
    flex: 1;
  }
  .name {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
  }
  .phone {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
  }
}
.menu-group {
  margin-top: 12px;
}
</style>
