<template>
  <div class="refund-detail">
    <AppHeader title="退款详情" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="refund">
      <!-- 状态卡片 -->
      <div class="status-card" :class="statusClass">
        <van-icon :name="statusIcon" size="40" />
        <h2 class="status">{{ refund.statusDesc || REFUND_STATUS_DESC[refund.status] }}</h2>
        <p class="amount">退款金额 ¥{{ refund.amount.toFixed(2) }}</p>
      </div>

      <!-- 退款信息 -->
      <van-cell-group inset title="退款信息">
        <van-cell title="退款单号" :value="refund.refundNo" />
        <van-cell title="订单编号" :value="refund.orderNo" />
        <van-cell title="退款原因" :value="refund.reason" />
        <van-cell title="退款金额" :value="`¥${refund.amount.toFixed(2)}`" />
      </van-cell-group>

      <!-- 时间线 -->
      <div class="timeline-card">
        <h3 class="card-title">处理进度</h3>
        <van-steps :active="activeStep" active-color="#FF6B35">
          <van-step>
            <h4 class="step-title">提交申请</h4>
            <p v-if="refund.applyTime" class="step-time">{{ formatDate(refund.applyTime) }}</p>
          </van-step>
          <van-step>
            <h4 class="step-title">审核中</h4>
            <p v-if="refund.status >= 1 && refund.status !== 2" class="step-time">处理中</p>
          </van-step>
          <van-step v-if="refund.status === 2">
            <h4 class="step-title">已拒绝</h4>
            <p v-if="refund.rejectReason" class="step-time">{{ refund.rejectReason }}</p>
          </van-step>
          <van-step v-else>
            <h4 class="step-title">退款完成</h4>
            <p v-if="refund.refundTime" class="step-time">{{ formatDate(refund.refundTime) }}</p>
          </van-step>
        </van-steps>
      </div>

      <!-- 拒绝原因 -->
      <van-cell-group v-if="refund.status === 2 && refund.rejectReason" inset title="拒绝原因">
        <van-cell :value="refund.rejectReason" />
      </van-cell-group>

      <!-- 操作 -->
      <div v-if="actions.length" class="bottom-bar">
        <van-button
          v-for="action in actions"
          :key="action.text"
          :type="action.type"
          :plain="action.plain"
          round
          size="small"
          @click="action.onClick"
        >{{ action.text }}</van-button>
      </div>
    </template>

    <EmptyState v-else description="暂无退款信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getRefundDetail, type RefundVO } from '@/api/user/payment.api'
import { REFUND_STATUS, REFUND_STATUS_DESC } from '@/utils/constants'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const refund = ref<RefundVO | null>(null)
const loading = ref(true)

const statusClass = computed(() => {
  if (!refund.value) return ''
  if (refund.value.status === REFUND_STATUS.REFUNDED) return 'success'
  if (refund.value.status === REFUND_STATUS.REJECTED) return 'danger'
  return 'pending'
})

const statusIcon = computed(() => {
  if (!refund.value) return 'clock-o'
  if (refund.value.status === REFUND_STATUS.REFUNDED) return 'checked'
  if (refund.value.status === REFUND_STATUS.REJECTED) return 'close'
  return 'clock-o'
})

const activeStep = computed(() => {
  if (!refund.value) return 0
  const s = refund.value.status
  if (s === REFUND_STATUS.PENDING) return 1
  if (s === REFUND_STATUS.APPROVED) return 2
  if (s === REFUND_STATUS.REFUNDED) return 3
  if (s === REFUND_STATUS.REJECTED) return 2
  return 0
})

interface Action {
  text: string
  type?: 'default' | 'primary'
  plain?: boolean
  onClick: () => void
}

const actions = computed<Action[]>(() => {
  if (!refund.value) return []
  const list: Action[] = []
  if (refund.value.status === REFUND_STATUS.PENDING) {
    list.push({ text: '撤销申请', plain: true, onClick: goOrder })
  }
  if (refund.value.status === REFUND_STATUS.REJECTED) {
    list.push({ text: '重新申请', type: 'primary', onClick: goReapply })
  }
  list.push({ text: '查看订单', plain: true, onClick: goOrder })
  return list
})

async function loadRefund() {
  loading.value = true
  try {
    refund.value = await getRefundDetail(orderId)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function goOrder() {
  router.replace(`/user/order/${orderId}`)
}

function goReapply() {
  router.replace(`/user/order/${orderId}/refund`)
}

onMounted(loadRefund)
</script>

<style scoped lang="scss">
.refund-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.status-card {
  padding: 32px 16px;
  text-align: center;
  color: #fff;
  background: linear-gradient(135deg, #ff9800, #ffb74d);
  &.success {
    background: linear-gradient(135deg, #07c160, #4caf50);
  }
  &.danger {
    background: linear-gradient(135deg, #ee0a24, #ff5252);
  }
  .status {
    margin: 12px 0 8px;
    font-size: 20px;
    font-weight: 600;
  }
  .amount {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}
.timeline-card {
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
  .step-time {
    margin: 4px 0 0;
    font-size: 11px;
    color: #999;
  }
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 16px;
  z-index: 99;
}
</style>
