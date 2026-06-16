<template>
  <div class="settings-page">
    <AppHeader title="设置" show-back />

    <!-- 账号信息 -->
    <van-cell-group inset title="账号">
      <van-cell title="个人资料" is-link @click="goProfile" />
      <van-cell title="修改昵称" is-link @click="onEditNickname" :value="userStore.nickname" />
      <van-cell title="修改头像" is-link @click="onEditAvatar" />
      <van-cell title="修改性别" is-link @click="onEditGender" />
      <van-cell title="修改密码" is-link @click="onEditPassword" />
    </van-cell-group>

    <!-- 通知设置 -->
    <van-cell-group inset title="通知设置">
      <van-cell title="订单消息通知">
        <template #right-icon>
          <van-switch v-model="notifySettings.order" size="22" active-color="#FF6B35" />
        </template>
      </van-cell>
      <van-cell title="优惠活动通知">
        <template #right-icon>
          <van-switch v-model="notifySettings.promo" size="22" active-color="#FF6B35" />
        </template>
      </van-cell>
      <van-cell title="系统消息通知">
        <template #right-icon>
          <van-switch v-model="notifySettings.system" size="22" active-color="#FF6B35" />
        </template>
      </van-cell>
      <van-cell title="声音提醒">
        <template #right-icon>
          <van-switch v-model="notifySettings.sound" size="22" active-color="#FF6B35" />
        </template>
      </van-cell>
      <van-cell title="震动提醒">
        <template #right-icon>
          <van-switch v-model="notifySettings.vibrate" size="22" active-color="#FF6B35" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 通用 -->
    <van-cell-group inset title="通用">
      <van-cell title="清除缓存" is-link :value="cacheSize" @click="onClearCache" />
      <van-cell title="检查更新" is-link value="v1.0.0" @click="onCheckUpdate" />
      <van-cell title="语言" is-link value="简体中文" />
      <van-cell title="字体大小" is-link value="标准" @click="onFontSize" />
    </van-cell-group>

    <!-- 隐私 -->
    <van-cell-group inset title="隐私">
      <van-cell title="隐私协议" is-link @click="onPrivacy" />
      <van-cell title="用户协议" is-link @click="onUserAgreement" />
      <van-cell title="注销账号" is-link @click="onDeleteAccount" />
    </van-cell-group>

    <!-- 关于 -->
    <van-cell-group inset title="关于我们">
      <van-cell title="关于味真足" is-link @click="onAbout" />
      <van-cell title="联系我们" is-link @click="onContact" />
      <van-cell title="给我们评分" is-link @click="onRate" />
      <van-cell title="当前版本" value="v1.0.0" />
    </van-cell-group>

    <div v-if="userStore.isLogin" class="logout-wrap">
      <van-button plain block round type="danger" @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  showConfirmDialog,
  showSuccessToast,
  showFailToast,
  showToast
} from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import { useUserStore } from '@/stores/user'
import { localStore } from '@/utils/storage'

const router = useRouter()
const userStore = useUserStore()

const cacheSize = ref('12.5 MB')

const notifySettings = reactive({
  order: true,
  promo: true,
  system: true,
  sound: true,
  vibrate: false
})

function goProfile() {
  router.push('/user/profile')
}

function onEditNickname() {
  showToast('修改昵称功能开发中')
}

function onEditAvatar() {
  showToast('修改头像功能开发中')
}

function onEditGender() {
  showToast('修改性别功能开发中')
}

function onEditPassword() {
  showToast('修改密码功能开发中')
}

async function onClearCache() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定清除缓存吗？' })
    localStore.clear()
    cacheSize.value = '0 MB'
    showSuccessToast('已清除')
  } catch {
    // 取消
  }
}

function onCheckUpdate() {
  showToast('当前已是最新版本')
}

function onFontSize() {
  showToast('字体大小功能开发中')
}

function onPrivacy() {
  showToast('隐私协议')
}

function onUserAgreement() {
  showToast('用户协议')
}

async function onDeleteAccount() {
  try {
    await showConfirmDialog({
      title: '危险操作',
      message: '注销账号将永久删除您的所有数据，且不可恢复，确定继续吗？'
    })
    showSuccessToast('已提交注销申请')
  } catch {
    // 取消
  }
}

function onAbout() {
  showToast('味真足 v1.0.0')
}

function onContact() {
  showToast('客服热线：400-888-8888')
}

function onRate() {
  showToast('感谢您的支持')
}

async function onLogout() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定要退出登录吗？' })
    userStore.logout()
    showSuccessToast('已退出登录')
    router.replace('/login')
  } catch {
    // 取消
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}
.logout-wrap {
  padding: 24px 16px;
}
</style>
