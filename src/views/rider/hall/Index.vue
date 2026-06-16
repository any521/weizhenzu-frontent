<template>
  <div class="rider-hall">
    <AppHeader title="接单大厅" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadMore">
        <div v-for="task in list" :key="task.id" class="task-card">
          <div class="header">
            <span class="order-no">{{ task.orderNo }}</span>
            <span class="fee">¥{{ task.deliveryFee }}</span>
          </div>
          <div class="route">
            <div class="point">
              <van-icon name="shop-o" color="#FF6B35" />
              <div class="info">
                <div class="name ellipsis">{{ task.merchantName }}</div>
                <div class="addr ellipsis">{{ task.merchantAddress }}</div>
              </div>
            </div>
            <div class="line"></div>
            <div class="point">
              <van-icon name="location-o" color="#4CAF50" />
              <div class="info">
                <div class="name ellipsis">{{ task.userNickname }}</div>
                <div class="addr ellipsis">{{ task.userAddress }}</div>
              </div>
            </div>
          </div>
          <div class="meta">
            <span>距离 {{ formatDistance(task.distance) }}</span>
            <span>预计 {{ task.estimatedTime }}分钟</span>
          </div>
          <van-button type="primary" block round :loading="grabbingId === task.id" @click="onGrab(task)">
            立即抢单
          </van-button>
        </div>
        <EmptyState v-if="!loading && list.length === 0" description="暂无可接订单" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getHallTasks, grabTask, type DeliveryTaskVO } from '@/api/rider/order.api'
import { formatDistance } from '@/utils/format'

const router = useRouter()
const list = ref<DeliveryTaskVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const grabbingId = ref<number | null>(null)
const page = ref(1)

async function loadMore() {
  if (finished.value) return
  try {
    const res = await getHallTasks({ current: page.value, size: 10 })
    if (page.value === 1) list.value = res.records
    else list.value.push(...res.records)
    if (list.value.length >= res.total) finished.value = true
    else page.value++
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  page.value = 1
  finished.value = false
  loadMore()
}

async function onGrab(task: DeliveryTaskVO) {
  grabbingId.value = task.id
  try {
    await grabTask(task.id)
    showSuccessToast('抢单成功')
    router.push('/rider/tasks')
  } catch {
    showFailToast('抢单失败')
  } finally {
    grabbingId.value = null
  }
}
</script>

<style scoped lang="scss">
.rider-hall {
  min-height: 100vh;
  background: #f5f5f5;
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
      font-size: 13px;
      color: #666;
    }
    .fee {
      color: #ff6b35;
      font-size: 18px;
      font-weight: 600;
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
        }
      }
    }
    .line {
      width: 1px;
      height: 16px;
      background: #ddd;
      margin-left: 11px;
      margin: 4px 0 4px 11px;
    }
  }
  .meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #666;
    margin-bottom: 12px;
    padding: 8px 0;
    border-top: 1px dashed #eee;
    border-bottom: 1px dashed #eee;
  }
}
</style>
