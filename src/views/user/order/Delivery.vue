<template>
  <div class="delivery-page">
    <AppHeader title="配送跟踪" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="tracking">
      <!-- 地图占位 -->
      <div class="map-placeholder" @click="goMap">
        <van-icon name="location-o" size="40" color="#FF6B35" />
        <p>点击查看地图导航</p>
        <div class="eta" v-if="tracking.estimatedTime">
          预计 {{ tracking.estimatedTime }} 分钟送达
        </div>
      </div>

      <!-- 骑手信息 -->
      <div class="rider-card">
        <van-image
          :src="tracking.riderAvatar"
          width="48"
          height="48"
          round
          fit="cover"
        />
        <div class="info">
          <div class="name">{{ tracking.riderName || '骑手' }}</div>
          <div class="distance" v-if="tracking.distance">
            距您 {{ formatDistance(tracking.distance) }}
          </div>
        </div>
        <van-button
          plain
          type="primary"
          size="small"
          round
          icon="phone-o"
          @click="callRider"
        >联系骑手</van-button>
      </div>

      <!-- 步骤条 -->
      <div class="steps-card">
        <h3 class="card-title">配送进度</h3>
        <van-steps :active="activeStep" active-color="#FF6B35">
          <van-step v-for="(step, idx) in tracking.steps" :key="idx">
            <h4 class="step-title">{{ step.title }}</h4>
            <p class="step-desc">{{ step.desc }}</p>
            <p v-if="step.time" class="step-time">{{ formatDate(step.time) }}</p>
          </van-step>
        </van-steps>
      </div>

      <!-- 订单信息 -->
      <van-cell-group inset title="订单信息">
        <van-cell title="商家" :value="tracking.merchantName" />
        <van-cell title="商家地址" :value="tracking.merchantAddress" />
      </van-cell-group>
    </template>

    <EmptyState v-else description="暂无配送信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getDeliveryTracking, type DeliveryTrackingVO } from '@/api/user/order.api'
import { formatDistance, formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const tracking = ref<DeliveryTrackingVO | null>(null)
const loading = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

const activeStep = computed(() => {
  if (!tracking.value?.steps) return 0
  const idx = tracking.value.steps.findIndex(s => !s.done)
  return idx === -1 ? tracking.value.steps.length : idx
})

async function loadTracking() {
  try {
    tracking.value = await getDeliveryTracking(orderId)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function callRider() {
  if (tracking.value?.riderPhone) {
    window.location.href = `tel:${tracking.value.riderPhone}`
  }
}

function goMap() {
  router.push(`/user/order/${orderId}/map`)
}

onMounted(() => {
  loadTracking()
  // 每 15 秒刷新一次
  timer = setInterval(loadTracking, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.delivery-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.map-placeholder {
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  p {
    margin: 8px 0 0;
    font-size: 13px;
  }
  .eta {
    margin-top: 8px;
    padding: 4px 12px;
    background: #ff6b35;
    color: #fff;
    border-radius: 12px;
    font-size: 12px;
  }
}
.rider-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  .info {
    flex: 1;
    .name {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
    .distance {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }
  }
}
.steps-card {
  margin: 10px 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  .card-title {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }
  .step-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }
  .step-desc {
    margin: 4px 0 0;
    font-size: 12px;
    color: #999;
  }
  .step-time {
    margin: 4px 0 0;
    font-size: 11px;
    color: #ccc;
  }
}
</style>
