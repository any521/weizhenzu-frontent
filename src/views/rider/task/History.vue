<template>
  <div class="rider-history">
    <AppHeader title="历史订单" showBack />

    <!-- 日期筛选 -->
    <div class="filter-bar">
      <van-cell
        title="开始日期"
        :value="startDate || '全部'"
        is-link
        @click="onPickDate('start')"
      />
      <van-cell
        title="结束日期"
        :value="endDate || '全部'"
        is-link
        @click="onPickDate('end')"
      />
      <van-button
        v-if="startDate || endDate"
        size="small"
        plain
        type="primary"
        class="reset-btn"
        @click="onReset"
      >
        重置
      </van-button>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadMore">
        <div v-for="task in list" :key="task.id" class="task-card" @click="goDetail(task)">
          <div class="header">
            <span class="order-no">单号 {{ task.orderNo }}</span>
            <van-tag :type="statusTagType(task.status)" round>{{ task.statusDesc }}</van-tag>
          </div>
          <div class="route">
            <div class="point">
              <van-icon name="shop-o" color="#FF6B35" size="14" />
              <div class="name ellipsis">{{ task.merchantName }}</div>
            </div>
            <div class="line"></div>
            <div class="point">
              <van-icon name="location-o" color="#4CAF50" size="14" />
              <div class="name ellipsis">{{ task.userNickname }}</div>
            </div>
          </div>
          <div class="meta">
            <span>完成 {{ formatDate(task.deliveredAt || task.createdAt) }}</span>
            <span>距离 {{ formatDistance(task.distance) }}</span>
            <span class="fee">配送费 ¥{{ task.deliveryFee }}</span>
          </div>
        </div>
        <EmptyState v-if="!loading && list.length === 0" description="暂无历史订单" />
      </van-list>
    </van-pull-refresh>

    <!-- 日期选择 -->
    <van-popup v-model:show="datePickerShow" position="bottom" round>
      <van-date-picker
        v-model="datePickerValue"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="datePickerShow = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getHistoryTasks, type DeliveryTaskVO } from '@/api/rider/order.api'
import { DELIVERY_TASK_STATUS } from '@/utils/constants'
import { formatDate, formatDistance } from '@/utils/format'

const router = useRouter()
const list = ref<DeliveryTaskVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const startDate = ref('')
const endDate = ref('')

const datePickerShow = ref(false)
const datePickerValue = ref<string[]>([])
const datePickerTarget = ref<'start' | 'end'>('start')
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

async function loadMore() {
  if (finished.value) return
  try {
    const res = await getHistoryTasks({
      current: page.value,
      size: pageSize,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined
    })
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
  list.value = []
  loadMore()
}

function onPickDate(target: 'start' | 'end') {
  datePickerTarget.value = target
  const current = target === 'start' ? startDate.value : endDate.value
  if (current) {
    const d = new Date(current)
    datePickerValue.value = [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ]
  } else {
    const d = new Date()
    datePickerValue.value = [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ]
  }
  datePickerShow.value = true
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  const dateStr = selectedValues.join('-')
  if (datePickerTarget.value === 'start') {
    startDate.value = dateStr
    if (endDate.value && endDate.value < dateStr) {
      endDate.value = dateStr
    }
  } else {
    endDate.value = dateStr
    if (startDate.value && startDate.value > dateStr) {
      startDate.value = dateStr
    }
  }
  datePickerShow.value = false
  onRefresh()
}

function onReset() {
  startDate.value = ''
  endDate.value = ''
  onRefresh()
}

function statusTagType(status: number): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case DELIVERY_TASK_STATUS.DELIVERED:
      return 'success'
    case DELIVERY_TASK_STATUS.CANCELED:
      return 'default'
    default:
      return 'primary'
  }
}

function goDetail(task: DeliveryTaskVO) {
  router.push(`/rider/task/${task.id}`)
}

onMounted(() => {
  // van-list 会自动触发首次 loadMore
})
</script>

<style scoped lang="scss">
.rider-history {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 16px;
}
.filter-bar {
  position: relative;
  background: #fff;
  margin: 10px 12px;
  border-radius: 8px;
  overflow: hidden;
  :deep(.van-cell) {
    padding: 10px 16px;
  }
  .reset-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.task-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 12px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .order-no {
      font-size: 12px;
      color: #999;
    }
  }
  .route {
    margin-bottom: 10px;
    .point {
      display: flex;
      align-items: center;
      gap: 6px;
      .name {
        flex: 1;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
    .line {
      width: 1px;
      height: 12px;
      background: #ddd;
      margin: 2px 0 2px 6px;
    }
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #666;
    padding-top: 8px;
    border-top: 1px dashed #eee;
    .fee {
      color: #ff6b35;
      font-weight: 600;
    }
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
