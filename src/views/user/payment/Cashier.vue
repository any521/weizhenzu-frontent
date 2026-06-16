<template>
  <div class="cashier-page">
    <AppHeader title="收银台" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="order">
      <div class="amount-card">
        <div class="label">支付金额</div>
        <div class="amount">¥{{ order.payAmount.toFixed(2) }}</div>
        <div class="order-no">订单号：{{ order.orderNo }}</div>
        <div v-if="countdownText" class="countdown">
          <van-icon name="clock-o" />
          <span>{{ countdownText }}</span>
        </div>
      </div>

      <van-cell-group inset title="选择支付方式">
        <van-cell
          v-for="m in payMethods"
          :key="m.value"
          clickable
          @click="payType = m.value"
        >
          <template #icon>
            <van-icon :name="m.icon" :color="m.color" size="24" />
          </template>
          <template #title>
            <span class="pay-name">{{ m.label }}</span>
          </template>
          <template #right-icon>
            <van-radio :model-value="payType" :name="m.value" />
          </template>
        </van-cell>
      </van-cell-group>

      <div class="tips">
        <van-icon name="info-o" />
        <span>支付即表示同意《味真足支付服务协议》</span>
      </div>

      <div class="bottom-bar">
        <van-button
          type="primary"
          round
          block
          :loading="paying"
          @click="onPay"
        >确认支付 ¥{{ order.payAmount.toFixed(2) }}</van-button>
      </div>
    </template>

    <EmptyState v-else description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getOrderDetail, type OrderVO } from '@/api/user/order.api'
import { createPayment } from '@/api/user/payment.api'
import { PAY_TYPE } from '@/utils/constants'
import { generateClientToken } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.orderId)
const order = ref<OrderVO | null>(null)
const loading = ref(true)
const paying = ref(false)
const payType = ref<number>(PAY_TYPE.WECHAT)
const countdownSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const payMethods = [
  { label: '微信支付', value: PAY_TYPE.WECHAT, icon: 'wechat-pay', color: '#07c160' },
  { label: '支付宝', value: PAY_TYPE.ALIPAY, icon: 'alipay', color: '#1677ff' },
  { label: '余额支付', value: PAY_TYPE.BALANCE, icon: 'gold-coin-o', color: '#ff9800' }
]

const countdownText = computed(() => {
  if (countdownSeconds.value <= 0) return ''
  const m = Math.floor(countdownSeconds.value / 60)
  const s = countdownSeconds.value % 60
  return `支付剩余 ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

async function loadOrder() {
  loading.value = true
  try {
    order.value = await getOrderDetail(orderId)
    // 假设15分钟内需支付
    if (order.value.status === 0) {
      const created = new Date(order.value.createdAt).getTime()
      const elapsed = Math.floor((Date.now() - created) / 1000)
      countdownSeconds.value = Math.max(0, 15 * 60 - elapsed)
      timer = setInterval(() => {
        countdownSeconds.value--
        if (countdownSeconds.value <= 0) {
          clearInterval(timer!)
          showFailToast('订单已超时')
          router.replace(`/user/order/${orderId}`)
        }
      }, 1000)
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function onPay() {
  if (!order.value) return
  paying.value = true
  try {
    await createPayment({
      orderId,
      payType: payType.value,
      clientToken: generateClientToken()
    })
    showSuccessToast('支付成功')
    setTimeout(() => {
      router.replace({
        path: '/user/payment/result',
        query: { orderId, status: 'success' }
      })
    }, 500)
  } catch (e: any) {
    showFailToast(e?.message || '支付失败')
    setTimeout(() => {
      router.replace({
        path: '/user/payment/result',
        query: { orderId, status: 'fail' }
      })
    }, 500)
  } finally {
    paying.value = false
  }
}

onMounted(loadOrder)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped lang="scss">
.cashier-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.amount-card {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  padding: 32px 16px;
  text-align: center;
  .label {
    font-size: 13px;
    opacity: 0.9;
  }
  .amount {
    font-size: 36px;
    font-weight: 700;
    margin: 8px 0;
  }
  .order-no {
    font-size: 12px;
    opacity: 0.8;
  }
  .countdown {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 12px;
  }
}
.pay-name {
  font-size: 14px;
  color: #333;
  margin-left: 10px;
}
.tips {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  font-size: 12px;
  color: #999;
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;
  .van-button {
    height: 44px;
  }
}
</style>
