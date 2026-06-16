<template>
  <div class="rider-layout">
    <div class="header">
      <div class="user-info">
        <van-image :src="riderInfo?.avatar" round width="40" height="40" fit="cover" />
        <div class="info">
          <div class="name">{{ riderInfo?.name || '骑手' }}</div>
          <div class="status">
            <van-tag :type="online ? 'success' : 'default'">{{ online ? '在线' : '离线' }}</van-tag>
          </div>
        </div>
      </div>
      <van-switch v-model="online" @change="onToggleOnline" />
    </div>

    <router-view />

    <van-tabbar v-model="active" route safe-area-inset-bottom>
      <van-tabbar-item to="/rider/hall" icon="shop-o">接单大厅</van-tabbar-item>
      <van-tabbar-item to="/rider/tasks" icon="todo-list-o">进行中</van-tabbar-item>
      <van-tabbar-item to="/rider/income" icon="balance-o">收入</van-tabbar-item>
      <van-tabbar-item to="/rider/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showSuccessToast, showFailToast } from 'vant'
import { useRiderStore } from '@/stores/rider'
import { getProfile, toggleOnline } from '@/api/rider/auth.api'

const riderStore = useRiderStore()
const active = ref(0)
const online = ref(false)
const riderInfo = ref<any>(null)

async function loadProfile() {
  try {
    const profile = await getProfile()
    riderInfo.value = profile
    online.value = profile.online
    riderStore.setRiderInfo(profile)
  } catch {
    // ignore
  }
}

async function onToggleOnline(v: any) {
  try {
    await toggleOnline(v as boolean)
    riderStore.setOnline(v as boolean)
    showSuccessToast(v ? '已上线' : '已下线')
  } catch {
    online.value = !v
    showFailToast('操作失败')
  }
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.rider-layout {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .info {
    .name {
      font-size: 16px;
      font-weight: 600;
    }
    .status {
      margin-top: 2px;
    }
  }
}
</style>
