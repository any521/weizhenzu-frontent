<template>
  <div class="map-page">
    <AppHeader title="地图导航" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="tracking">
      <!-- 地图占位 -->
      <div class="map-container">
        <div class="map-bg">
          <van-icon name="location-o" size="60" color="#FF6B35" />
          <p class="map-tip">地图加载中...</p>
        </div>

        <!-- 标记点 -->
        <div class="marker merchant">
          <van-icon name="shop-o" />
          <span>商家</span>
        </div>
        <div class="marker rider">
          <van-icon name="logistics" />
          <span>骑手</span>
        </div>
        <div class="marker destination">
          <van-icon name="aim" />
          <span>我的位置</span>
        </div>
      </div>

      <!-- 信息卡片 -->
      <div class="info-card">
        <div class="rider-row">
          <van-image :src="tracking.riderAvatar" width="40" height="40" round fit="cover" />
          <div class="info">
            <div class="name">{{ tracking.riderName || '骑手' }}</div>
            <div class="meta">
              <span v-if="tracking.distance">距您 {{ formatDistance(tracking.distance) }}</span>
              <span v-if="tracking.estimatedTime">预计 {{ tracking.estimatedTime }}分钟</span>
            </div>
          </div>
          <van-button
            plain
            type="primary"
            size="small"
            round
            icon="phone-o"
            @click="callRider"
          >联系</van-button>
        </div>

        <van-cell-group inset>
          <van-cell title="商家" :value="tracking.merchantName" />
          <van-cell title="商家地址" :value="tracking.merchantAddress" />
          <van-cell title="订单状态" :value="tracking.status === 6 ? '已送达' : '配送中'" />
        </van-cell-group>
      </div>
    </template>

    <EmptyState v-else description="暂无位置信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getDeliveryTracking, type DeliveryTrackingVO } from '@/api/user/order.api'
import { formatDistance } from '@/utils/format'

const route = useRoute()

const orderId = Number(route.params.id)
const tracking = ref<DeliveryTrackingVO | null>(null)
const loading = ref(true)

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

onMounted(loadTracking)
</script>

<style scoped lang="scss">
.map-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.map-container {
  position: relative;
  height: 50vh;
  background: linear-gradient(135deg, #e8f4ff, #f0f5ff);
  overflow: hidden;
  .map-bg {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    .map-tip {
      margin: 12px 0 0;
      font-size: 13px;
    }
  }
  .marker {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    background: #fff;
    border-radius: 12px;
    font-size: 11px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    &.merchant {
      top: 20%;
      left: 15%;
      color: #ff6b35;
    }
    &.rider {
      top: 50%;
      left: 45%;
      color: #1890ff;
    }
    &.destination {
      bottom: 15%;
      right: 15%;
      color: #07c160;
    }
  }
}
.info-card {
  margin-top: -16px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px 0;
  .rider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px 12px;
    border-bottom: 1px solid #f5f5f5;
    .info {
      flex: 1;
      .name {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
      .meta {
        display: flex;
        gap: 12px;
        margin-top: 4px;
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
