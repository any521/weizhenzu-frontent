<template>
  <div class="rider-income">
    <AppHeader title="收入明细" />

    <!-- 统计卡 -->
    <div class="stat-card">
      <div class="stat-item">
        <div class="value">¥{{ formatAmount(todayIncome) }}</div>
        <div class="label">今日收入</div>
        <div class="sub">今日 {{ todayOrders }} 单</div>
      </div>
      <div class="divider"></div>
      <div class="stat-item">
        <div class="value">¥{{ formatAmount(monthIncome) }}</div>
        <div class="label">本月收入</div>
        <div class="sub">累计 {{ totalOrders }} 单</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <van-tabs v-model:active="activeTab" color="#FF6B35" title-active-color="#FF6B35" @change="onTabChange">
        <van-tab title="今日" name="today" />
        <van-tab title="本月" name="month" />
        <van-tab title="自定义" name="custom" />
      </van-tabs>
      <div v-if="activeTab === 'custom'" class="custom-range">
        <van-cell
          title="开始日期"
          :value="startDate || '请选择'"
          is-link
          @click="onPickDate('start')"
        />
        <van-cell
          title="结束日期"
          :value="endDate || '请选择'"
          is-link
          @click="onPickDate('end')"
        />
      </div>
    </div>

    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadMore">
        <div v-for="item in list" :key="item.id" class="income-item">
          <div class="left">
            <van-icon name="balance-o" color="#FF6B35" size="20" />
            <div class="info">
              <div class="title">{{ item.typeDesc }}</div>
              <div class="order-no ellipsis">单号 {{ item.orderNo }}</div>
              <div class="time">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
          <div class="amount">+¥{{ formatAmount(item.amount) }}</div>
        </div>
        <EmptyState v-if="!loading && list.length === 0" description="暂无收入记录" />
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
import { ref, computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getIncomeRecords } from '@/api/rider/order.api'
import { getProfile } from '@/api/rider/auth.api'
import { formatDate, formatAmount } from '@/utils/format'

interface IncomeRecord {
  id: number
  orderId: number
  orderNo: string
  amount: number
  type: number
  typeDesc: string
  createdAt: string
}

const todayIncome = ref(0)
const monthIncome = ref(0)
const todayOrders = ref(0)
const totalOrders = ref(0)

const list = ref<IncomeRecord[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const activeTab = ref<'today' | 'month' | 'custom'>('today')
const startDate = ref('')
const endDate = ref('')

const datePickerShow = ref(false)
const datePickerValue = ref<string[]>([])
const datePickerTarget = ref<'start' | 'end'>('start')
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

function todayStr(): string {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

function monthStartStr(): string {
  const d = new Date()
  return formatDate(new Date(d.getFullYear(), d.getMonth(), 1), 'YYYY-MM-DD')
}

function currentRange(): { startDate?: string; endDate?: string } {
  if (activeTab.value === 'today') {
    const t = todayStr()
    return { startDate: t, endDate: t }
  }
  if (activeTab.value === 'month') {
    return { startDate: monthStartStr(), endDate: todayStr() }
  }
  return {
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined
  }
}

async function loadProfile() {
  try {
    const profile = await getProfile()
    todayIncome.value = profile.todayIncome || 0
    monthIncome.value = profile.monthIncome || 0
    todayOrders.value = profile.todayOrders || 0
    totalOrders.value = profile.totalOrders || 0
  } catch {
    // ignore
  }
}

async function loadMore() {
  if (finished.value) return
  if (activeTab.value === 'custom' && (!startDate.value || !endDate.value)) {
    finished.value = true
    loading.value = false
    return
  }
  try {
    const range = currentRange()
    const res = await getIncomeRecords({
      current: page.value,
      size: pageSize,
      startDate: range.startDate,
      endDate: range.endDate
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
  loadProfile()
  loadMore()
}

function onTabChange() {
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
  onTabChange()
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="scss">
.rider-income {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  margin: 10px 12px;
  padding: 20px 0;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border-radius: 8px;
  color: #fff;
  .stat-item {
    flex: 1;
    text-align: center;
    .value {
      font-size: 22px;
      font-weight: 700;
    }
    .label {
      margin-top: 4px;
      font-size: 13px;
      opacity: 0.9;
    }
    .sub {
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.8;
    }
  }
  .divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
  }
}
.filter-bar {
  background: #fff;
  margin: 0 12px;
  border-radius: 8px;
  overflow: hidden;
  .custom-range {
    padding-bottom: 4px;
    :deep(.van-cell) {
      padding: 8px 16px;
    }
  }
}
.income-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px;
  margin: 8px 12px;
  border-radius: 8px;
  .left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    .info {
      flex: 1;
      min-width: 0;
      .title {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
      .order-no {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
      .time {
        font-size: 11px;
        color: #bbb;
        margin-top: 2px;
      }
    }
  }
  .amount {
    font-size: 16px;
    font-weight: 700;
    color: #ff6b35;
  }
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
