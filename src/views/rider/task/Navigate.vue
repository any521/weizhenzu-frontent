<template>
  <div class="rider-navigate">
    <AppHeader title="路线导航" showBack />
    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35">加载中...</van-loading>
    </div>
    <template v-else-if="task">
      <!-- 地图占位 -->
      <div class="map-placeholder">
        <van-icon name="location-o" size="60" color="#FF6B35" />
        <div class="map-tip">地图加载中...</div>
        <div class="map-mask"></div>
      </div>

      <!-- 当前阶段 -->
      <div class="stage-card">
        <div class="stage-title">
          <van-icon :name="stageIcon" color="#FF6B35" size="20" />
          <span>{{ stageTitle }}</span>
        </div>
        <div class="stage-desc">{{ stageDesc }}</div>
      </div>

      <!-- 路线信息 -->
      <div class="route-info">
        <div class="point">
          <div class="dot merchant"></div>
          <div class="info">
            <div class="label">商家</div>
            <div class="name">{{ task.merchantName }}</div>
            <div class="addr">{{ task.merchantAddress }}</div>
            <div class="phone" @click="onCall(task.merchantPhone)">
              <van-icon name="phone-o" color="#FF6B35" />
              {{ task.merchantPhone }}
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="point">
          <div class="dot user"></div>
          <div class="info">
            <div class="label">用户</div>
            <div class="name">{{ task.userNickname }}</div>
            <div class="addr">{{ task.userAddress }}</div>
            <div class="phone" @click="onCall(task.userPhone)">
              <van-icon name="phone-o" color="#4CAF50" />
              {{ task.userPhone }}
            </div>
          </div>
        </div>
      </div>

      <!-- 路线数据 -->
      <div class="data-card">
        <div class="data-item">
          <div class="value">{{ formatDistance(task.distance) }}</div>
          <div class="label">总距离</div>
        </div>
        <div class="divider"></div>
        <div class="data-item">
          <div class="value">{{ task.estimatedTime }}分钟</div>
          <div class="label">预计时长</div>
        </div>
        <div class="divider"></div>
        <div class="data-item">
          <div class="value">¥{{ task.deliveryFee }}</div>
          <div class="label">配送费</div>
        </div>
      </div>

      <!-- 操作 -->
      <div class="action-bar">
        <van-button
          type="default"
          round
          icon="phone-o"
          @click="onCall(currentTargetPhone)"
        >
          联系{{ currentTargetLabel }}
        </van-button>
        <van-button
          type="primary"
          round
          icon="guide-o"
          block
          @click="onStartNavigate"
        >
          开始导航
        </van-button>
      </div>
    </template>
    <EmptyState v-else description="任务不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getTaskDetail, type DeliveryTaskVO } from '@/api/rider/order.api'
import { DELIVERY_TASK_STATUS } from '@/utils/constants'
import { formatDistance } from '@/utils/format'

const route = useRoute()
const task = ref<DeliveryTaskVO | null>(null)
const loading = ref(true)

const taskId = computed(() => Number(route.params.id))

/** 当前阶段：前往商家 / 前往用户 */
const goingToUser = computed(() => {
  if (!task.value) return false
  return (
    task.value.status === DELIVERY_TASK_STATUS.PICKED_UP ||
    task.value.status === DELIVERY_TASK_STATUS.DELIVERING
  )
})

const stageTitle = computed(() => (goingToUser.value ? '前往用户收货地址' : '前往商家取餐'))
const stageDesc = computed(() =>
  goingToUser.value
    ? '请尽快将订单送达用户指定地点'
    : '请前往商家取餐，到达后点击"到达商家"'
)
const stageIcon = computed(() => (goingToUser.value ? 'location-o' : 'shop-o'))
const currentTargetLabel = computed(() => (goingToUser.value ? '用户' : '商家'))
const currentTargetPhone = computed(() =>
  goingToUser.value ? task.value?.userPhone || '' : task.value?.merchantPhone || ''
)

async function loadDetail() {
  loading.value = true
  try {
    task.value = await getTaskDetail(taskId.value)
  } catch {
    task.value = null
  } finally {
    loading.value = false
  }
}

function onCall(phone: string) {
  if (!phone) {
    showFailToast('暂无联系电话')
    return
  }
  window.location.href = `tel:${phone}`
}

function onStartNavigate() {
  if (!task.value) return
  // 实际项目中可调用高德/百度地图 SDK 进行导航
  showSuccessToast('正在调起地图导航')
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.rider-navigate {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}
.loading-wrap {
  padding: 80px 0;
  text-align: center;
}
.map-placeholder {
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f7ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  .map-tip {
    margin-top: 8px;
    font-size: 13px;
  }
  .map-mask {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 107, 53, 0.04),
      rgba(255, 107, 53, 0.04) 10px,
      transparent 10px,
      transparent 20px
    );
    pointer-events: none;
  }
}
.stage-card {
  margin: 10px 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
  .stage-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  .stage-desc {
    margin-top: 8px;
    font-size: 13px;
    color: #666;
  }
}
.route-info {
  margin: 10px 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  .point {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
      &.merchant {
        background: #ff6b35;
      }
      &.user {
        background: #4caf50;
      }
    }
    .info {
      flex: 1;
      min-width: 0;
      .label {
        font-size: 12px;
        color: #999;
      }
      .name {
        font-size: 15px;
        color: #333;
        font-weight: 600;
        margin-top: 2px;
      }
      .addr {
        font-size: 13px;
        color: #666;
        margin-top: 4px;
        line-height: 1.4;
      }
      .phone {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        font-size: 13px;
        color: #ff6b35;
      }
    }
  }
  .line {
    width: 2px;
    height: 24px;
    background: #ddd;
    margin: 4px 0 4px 4px;
  }
}
.data-card {
  display: flex;
  align-items: center;
  margin: 10px 12px;
  padding: 16px 0;
  background: #fff;
  border-radius: 8px;
  .data-item {
    flex: 1;
    text-align: center;
    .value {
      font-size: 18px;
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
    height: 24px;
    background: #eee;
  }
}
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 12px 16px env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
  .van-button--default {
    flex: 0 0 130px;
  }
}
</style>
