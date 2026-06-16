<template>
  <div class="refund-apply">
    <AppHeader title="申请退款" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="order">
      <!-- 退款金额 -->
      <div class="amount-card">
        <div class="label">退款金额</div>
        <div class="amount">¥{{ refundAmount.toFixed(2) }}</div>
        <div class="hint">最多可退 ¥{{ order.payAmount.toFixed(2) }}</div>
      </div>

      <van-cell-group inset title="退款原因">
        <van-radio-group v-model="form.reason">
          <van-cell
            v-for="r in reasons"
            :key="r"
            :title="r"
            clickable
            @click="form.reason = r"
          >
            <template #right-icon>
              <van-radio :name="r" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <van-cell-group inset title="退款金额（可选）">
        <van-field
          v-model="amountInput"
          type="number"
          label="退款金额"
          placeholder="不填则全额退款"
        >
          <template #button>元</template>
        </van-field>
      </van-cell-group>

      <van-cell-group inset title="补充说明">
        <van-field
          v-model="form.description"
          type="textarea"
          placeholder="请描述具体问题，便于商家处理"
          rows="3"
          maxlength="200"
          show-word-limit
          autosize
        />
      </van-cell-group>

      <div class="tips">
        <van-icon name="info-o" />
        <div>
          <p>1. 商家接单前可全额退款</p>
          <p>2. 商家接单后需协商处理</p>
          <p>3. 退款一般 1-3 个工作日到账</p>
        </div>
      </div>

      <div class="bottom-bar">
        <van-button
          type="primary"
          round
          block
          :loading="submitting"
          :disabled="!form.reason"
          @click="onSubmit"
        >提交申请</van-button>
      </div>
    </template>

    <EmptyState v-else description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getOrderDetail, applyRefund, type OrderVO } from '@/api/user/order.api'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const order = ref<OrderVO | null>(null)
const loading = ref(true)
const submitting = ref(false)
const amountInput = ref('')

const reasons = [
  '不想要了',
  '商家未接单',
  '商家沟通态度差',
  '商品与描述不符',
  '商品质量问题',
  '配送太慢',
  '配送员态度差',
  '其他原因'
]

const form = reactive({
  reason: '',
  description: ''
})

const refundAmount = computed(() => {
  if (!order.value) return 0
  if (amountInput.value) {
    const n = parseFloat(amountInput.value)
    if (!isNaN(n) && n > 0 && n <= order.value.payAmount) return n
  }
  return order.value.payAmount
})

async function loadOrder() {
  loading.value = true
  try {
    order.value = await getOrderDetail(orderId)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!form.reason) {
    showFailToast('请选择退款原因')
    return
  }
  submitting.value = true
  try {
    const reason = form.description
      ? `${form.reason}：${form.description}`
      : form.reason
    await applyRefund(orderId, {
      reason,
      amount: refundAmount.value
    })
    showSuccessToast('已提交申请')
    setTimeout(() => router.replace(`/user/refund/${orderId}`), 500)
  } catch (e: any) {
    showFailToast(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrder)
</script>

<style scoped lang="scss">
.refund-apply {
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
  padding: 24px 16px;
  text-align: center;
  .label {
    font-size: 13px;
    opacity: 0.9;
  }
  .amount {
    font-size: 32px;
    font-weight: 700;
    margin: 8px 0;
  }
  .hint {
    font-size: 12px;
    opacity: 0.8;
  }
}
.tips {
  display: flex;
  gap: 8px;
  padding: 16px;
  font-size: 12px;
  color: #999;
  p {
    margin: 0;
    line-height: 1.8;
  }
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
