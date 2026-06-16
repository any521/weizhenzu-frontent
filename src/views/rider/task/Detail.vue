<template>
  <div class="rider-task-detail">
    <AppHeader title="任务详情" showBack />
    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35">加载中...</van-loading>
    </div>
    <template v-else-if="task">
      <!-- 状态条 -->
      <div class="status-bar">
        <div class="status-info">
          <van-tag :type="statusTagType(task.status)" round size="large">{{ task.statusDesc }}</van-tag>
          <span class="order-no">单号 {{ task.orderNo }}</span>
        </div>
        <div class="fee-box">
          <div class="label">配送费</div>
          <div class="fee">¥{{ task.deliveryFee }}</div>
        </div>
      </div>

      <!-- 路线 -->
      <div class="card route-card">
        <div class="point">
          <div class="dot merchant"></div>
          <div class="info">
            <div class="name">{{ task.merchantName }}</div>
            <div class="addr">{{ task.merchantAddress }}</div>
            <div class="extra">
              <span>距您 {{ formatDistance(task.distance) }}</span>
              <span>预计 {{ task.estimatedTime }}分钟</span>
            </div>
          </div>
        </div>
        <div class="line"></div>
        <div class="point">
          <div class="dot user"></div>
          <div class="info">
            <div class="name">{{ task.userNickname }}</div>
            <div class="addr">{{ task.userAddress }}</div>
          </div>
        </div>
      </div>

      <!-- 商家信息 -->
      <van-cell-group inset title="商家信息">
        <van-cell title="商家名称" :value="task.merchantName" />
        <van-cell title="商家电话" :value="task.merchantPhone" is-link @click="onCall(task.merchantPhone)" />
        <van-cell title="商家地址" :value="task.merchantAddress" />
      </van-cell-group>

      <!-- 用户信息 -->
      <van-cell-group inset title="用户信息">
        <van-cell title="收件人" :value="task.userNickname" />
        <van-cell title="联系电话" :value="task.userPhone" is-link @click="onCall(task.userPhone)" />
        <van-cell title="收货地址" :value="task.userAddress" />
      </van-cell-group>

      <!-- 订单商品 -->
      <van-cell-group inset title="订单商品" v-if="task.items && task.items.length">
        <van-cell
          v-for="(item, idx) in task.items"
          :key="idx"
          :title="item.dishName"
          :value="`x${item.quantity}`"
        />
      </van-cell-group>

      <!-- 时间线 -->
      <van-cell-group inset title="配送进度">
        <van-steps direction="vertical" :active="activeStep" active-color="#FF6B35">
          <van-step v-if="task.acceptedAt">
            <h4>已接单</h4>
            <p>{{ formatDate(task.acceptedAt) }}</p>
          </van-step>
          <van-step v-if="task.pickedUpAt">
            <h4>已取餐</h4>
            <p>{{ formatDate(task.pickedUpAt) }}</p>
          </van-step>
          <van-step v-if="task.deliveredAt">
            <h4>已送达</h4>
            <p>{{ formatDate(task.deliveredAt) }}</p>
          </van-step>
          <van-step>
            <h4>创建时间</h4>
            <p>{{ formatDate(task.createdAt) }}</p>
          </van-step>
        </van-steps>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button
          v-if="task.status === DELIVERY_TASK_STATUS.GRABBED"
          type="primary"
          round
          block
          :loading="acting"
          @click="onArrive"
        >
          到达商家
        </van-button>
        <van-button
          v-else-if="task.status === DELIVERY_TASK_STATUS.ARRIVED_MERCHANT"
          type="primary"
          round
          block
          :loading="acting"
          @click="onPickup"
        >
          确认取餐
        </van-button>
        <van-button
          v-else-if="task.status === DELIVERY_TASK_STATUS.PICKED_UP || task.status === DELIVERY_TASK_STATUS.DELIVERING"
          type="danger"
          round
          block
          :loading="acting"
          @click="onDeliver"
        >
          确认送达
        </van-button>
        <van-button
          v-if="!isFinished"
          type="default"
          round
          block
          @click="onNavigate"
          style="margin-top: 8px"
        >
          导航前往
        </van-button>
      </div>
    </template>
    <EmptyState v-else description="任务不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getTaskDetail,
  arriveMerchant,
  pickup,
  deliver,
  type DeliveryTaskVO
} from '@/api/rider/order.api'
import { DELIVERY_TASK_STATUS } from '@/utils/constants'
import { formatDate, formatDistance } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const task = ref<DeliveryTaskVO | null>(null)
const loading = ref(true)
const acting = ref(false)

const taskId = computed(() => Number(route.params.id))
const isFinished = computed(
  () => task.value?.status === DELIVERY_TASK_STATUS.DELIVERED ||
    task.value?.status === DELIVERY_TASK_STATUS.CANCELED
)

const activeStep = computed(() => {
  if (!task.value) return 0
  if (task.value.deliveredAt) return 3
  if (task.value.pickedUpAt) return 2
  if (task.value.acceptedAt) return 1
  return 0
})

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

function statusTagType(status: number): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case DELIVERY_TASK_STATUS.GRABBED:
      return 'primary'
    case DELIVERY_TASK_STATUS.ARRIVED_MERCHANT:
      return 'warning'
    case DELIVERY_TASK_STATUS.PICKED_UP:
      return 'warning'
    case DELIVERY_TASK_STATUS.DELIVERING:
      return 'danger'
    case DELIVERY_TASK_STATUS.DELIVERED:
      return 'success'
    default:
      return 'default'
  }
}

function onCall(phone: string) {
  if (!phone) return
  window.location.href = `tel:${phone}`
}

function onNavigate() {
  router.push(`/rider/task/${taskId.value}/navigate`)
}

async function onArrive() {
  acting.value = true
  try {
    await arriveMerchant(taskId.value)
    showSuccessToast('已到达商家')
    await loadDetail()
  } catch {
    showFailToast('操作失败')
  } finally {
    acting.value = false
  }
}

async function onPickup() {
  acting.value = true
  try {
    await pickup(taskId.value)
    showSuccessToast('取餐成功')
    await loadDetail()
  } catch {
    showFailToast('操作失败')
  } finally {
    acting.value = false
  }
}

async function onDeliver() {
  try {
    await showDialog({
      title: '确认送达',
      message: '请确认已将订单送达用户指定地点',
      showCancelButton: true,
      confirmButtonText: '已送达',
      confirmButtonColor: '#FF6B35'
    })
  } catch {
    return
  }
  acting.value = true
  try {
    await deliver(taskId.value)
    showSuccessToast('送达成功')
    await loadDetail()
  } catch {
    showFailToast('操作失败')
  } finally {
    acting.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.rider-task-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
}
.loading-wrap {
  padding: 80px 0;
  text-align: center;
}
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin: 10px 12px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border-radius: 8px;
  color: #fff;
  .status-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .order-no {
      font-size: 12px;
      opacity: 0.9;
    }
  }
  .fee-box {
    text-align: right;
    .label {
      font-size: 12px;
      opacity: 0.9;
    }
    .fee {
      font-size: 22px;
      font-weight: 700;
      margin-top: 2px;
    }
  }
}
.card {
  background: #fff;
  border-radius: 8px;
  margin: 10px 12px;
  padding: 16px 12px;
}
.route-card {
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
      .name {
        font-size: 15px;
        color: #333;
        font-weight: 600;
      }
      .addr {
        font-size: 13px;
        color: #666;
        margin-top: 4px;
        line-height: 1.4;
      }
      .extra {
        display: flex;
        gap: 12px;
        margin-top: 6px;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .line {
    width: 2px;
    height: 20px;
    background: #ddd;
    margin-left: 4px;
    margin: 4px 0 4px 4px;
  }
}
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
}
:deep(.van-cell-group--inset) {
  margin: 10px 12px;
}
:deep(.van-steps) {
  padding: 8px 0 8px 16px;
}
</style>
