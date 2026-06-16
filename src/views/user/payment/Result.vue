<template>
  <div class="result-page">
    <div class="result-card">
      <van-icon
        :name="isSuccess ? 'checked' : 'close'"
        :color="isSuccess ? '#07c160' : '#ee0a24'"
        size="80"
      />
      <h2 class="title">{{ isSuccess ? '支付成功' : '支付失败' }}</h2>
      <p v-if="isSuccess" class="desc">订单已支付，请耐心等待商家接单</p>
      <p v-else class="desc">支付未完成，请重新支付</p>

      <div v-if="order" class="amount">
        <span class="label">支付金额</span>
        <span class="value">¥{{ order.payAmount.toFixed(2) }}</span>
      </div>
    </div>

    <div class="actions">
      <van-button
        v-if="isSuccess"
        type="primary"
        round
        block
        @click="goOrders"
      >查看订单</van-button>
      <van-button
        v-else
        type="primary"
        round
        block
        @click="goPay"
      >重新支付</van-button>
      <van-button plain round block class="mt" @click="goHome">继续点餐</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, type OrderVO } from '@/api/user/order.api'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.query.orderId)
const isSuccess = computed(() => route.query.status === 'success')
const order = ref<OrderVO | null>(null)

async function loadOrder() {
  if (!orderId) return
  try {
    order.value = await getOrderDetail(orderId)
  } catch {
    // ignore
  }
}

function goOrders() {
  router.replace('/user/orders')
}

function goHome() {
  router.replace('/user/home')
}

function goPay() {
  router.replace(`/user/payment/${orderId}`)
}

onMounted(loadOrder)
</script>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px 24px;
}
.result-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  .title {
    margin: 16px 0 8px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
  .desc {
    margin: 0 0 20px;
    font-size: 13px;
    color: #999;
  }
  .amount {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid #f5f5f5;
    .label {
      font-size: 13px;
      color: #999;
    }
    .value {
      font-size: 24px;
      font-weight: 700;
      color: #ff6b35;
    }
  }
}
.actions {
  margin-top: 24px;
  .van-button {
    height: 44px;
  }
  .mt {
    margin-top: 12px;
  }
}
</style>
