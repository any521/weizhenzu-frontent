<template>
  <div class="rider-active">
    <AppHeader title="进行中任务" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="loading && list.length === 0" class="loading-wrap">
        <van-loading type="spinner" color="#FF6B35">加载中...</van-loading>
      </div>
      <template v-else>
        <div v-for="task in list" :key="task.id" class="task-card" @click="goDetail(task)">
          <div class="header">
            <span class="order-no">单号 {{ task.orderNo }}</span>
            <van-tag :type="statusTagType(task.status)" round>{{ task.statusDesc }}</van-tag>
          </div>
          <div class="route">
            <div class="point">
              <van-icon name="shop-o" color="#FF6B35" size="16" />
              <div class="info">
                <div class="name ellipsis">{{ task.merchantName }}</div>
                <div class="addr ellipsis">{{ task.merchantAddress }}</div>
              </div>
            </div>
            <div class="line"></div>
            <div class="point">
              <van-icon name="location-o" color="#4CAF50" size="16" />
              <div class="info">
                <div class="name ellipsis">{{ task.userNickname }}</div>
                <div class="addr ellipsis">{{ task.userAddress }}</div>
              </div>
            </div>
          </div>
          <div class="meta">
            <span>距离 {{ formatDistance(task.distance) }}</span>
            <span>配送费 <em class="fee">¥{{ task.deliveryFee }}</em></span>
            <span>接单 {{ fromNow(task.acceptedAt) }}</span>
          </div>
          <div class="actions" @click.stop>
            <van-button
              v-if="task.status === DELIVERY_TASK_STATUS.GRABBED"
              type="primary"
              size="small"
              round
              :loading="actingId === task.id"
              @click="onArrive(task)"
            >
              到达商家
            </van-button>
            <van-button
              v-else-if="task.status === DELIVERY_TASK_STATUS.ARRIVED_MERCHANT"
              type="primary"
              size="small"
              round
              :loading="actingId === task.id"
              @click="onPickup(task)"
            >
              确认取餐
            </van-button>
            <van-button
              v-else-if="task.status === DELIVERY_TASK_STATUS.PICKED_UP || task.status === DELIVERY_TASK_STATUS.DELIVERING"
              type="danger"
              size="small"
              round
              :loading="actingId === task.id"
              @click="onDeliver(task)"
            >
              确认送达
            </van-button>
            <van-button
              type="default"
              size="small"
              round
              @click="goNavigate(task)"
            >
              导航
            </van-button>
          </div>
        </div>
        <EmptyState v-if="list.length === 0" description="暂无进行中任务，去大厅看看吧" />
      </template>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getActiveTasks,
  arriveMerchant,
  pickup,
  deliver,
  type DeliveryTaskVO
} from '@/api/rider/order.api'
import { DELIVERY_TASK_STATUS } from '@/utils/constants'
import { formatDistance, fromNow } from '@/utils/format'

const router = useRouter()
const list = ref<DeliveryTaskVO[]>([])
const loading = ref(false)
const refreshing = ref(false)
const actingId = ref<number | null>(null)

async function loadList() {
  loading.value = true
  try {
    list.value = await getActiveTasks()
  } catch {
    list.value = []
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  loadList()
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
    default:
      return 'default'
  }
}

function goDetail(task: DeliveryTaskVO) {
  router.push(`/rider/task/${task.id}`)
}

function goNavigate(task: DeliveryTaskVO) {
  router.push(`/rider/task/${task.id}/navigate`)
}

async function onArrive(task: DeliveryTaskVO) {
  actingId.value = task.id
  try {
    await arriveMerchant(task.id)
    showSuccessToast('已到达商家')
    await loadList()
  } catch {
    showFailToast('操作失败')
  } finally {
    actingId.value = null
  }
}

async function onPickup(task: DeliveryTaskVO) {
  actingId.value = task.id
  try {
    await pickup(task.id)
    showSuccessToast('取餐成功')
    await loadList()
  } catch {
    showFailToast('操作失败')
  } finally {
    actingId.value = null
  }
}

async function onDeliver(task: DeliveryTaskVO) {
  actingId.value = task.id
  try {
    await deliver(task.id)
    showSuccessToast('送达成功')
    await loadList()
  } catch {
    showFailToast('操作失败')
  } finally {
    actingId.value = null
  }
}

onMounted(loadList)
onActivated(loadList)
</script>

<style scoped lang="scss">
.rider-active {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 16px;
}
.loading-wrap {
  padding: 60px 0;
  text-align: center;
}
.task-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin: 10px 12px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .order-no {
      font-size: 12px;
      color: #999;
    }
  }
  .route {
    margin-bottom: 12px;
    .point {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      .info {
        flex: 1;
        min-width: 0;
        .name {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        .addr {
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }
    }
    .line {
      width: 1px;
      height: 14px;
      background: #ddd;
      margin: 4px 0 4px 7px;
    }
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #666;
    padding: 8px 0;
    border-top: 1px dashed #eee;
    border-bottom: 1px dashed #eee;
    .fee {
      color: #ff6b35;
      font-style: normal;
      font-weight: 600;
    }
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
