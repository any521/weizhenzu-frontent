<template>
  <div class="order-detail">
    <AppHeader title="订单详情" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="order">
      <!-- 状态 -->
      <div class="status-card">
        <h2 class="status">{{ order.statusDesc || ORDER_STATUS_DESC[order.status] }}</h2>
        <p v-if="order.expectedTime" class="expected">预计 {{ formatTime(order.expectedTime) }} 送达</p>
        <div v-if="showDeliveryEntry" class="delivery-entry" @click="goDelivery">
          <van-icon name="logistics" />
          <span>查看配送进度</span>
          <van-icon name="arrow" size="12" />
        </div>
      </div>

      <!-- 商家及商品 -->
      <div class="merchant-section">
        <div class="merchant-head" @click="goMerchant">
          <van-image :src="order.merchantLogo" width="32" height="32" radius="4" fit="cover" />
          <span class="name ellipsis">{{ order.merchantName }}</span>
          <van-icon name="arrow" size="12" />
        </div>
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <van-image :src="item.dishImage" width="60" height="60" radius="6" fit="cover" />
          <div class="info">
            <h3 class="name ellipsis">{{ item.dishName }}</h3>
            <p v-if="item.specName" class="spec">{{ item.specName }}</p>
          </div>
          <div class="right">
            <div class="price">¥{{ item.unitPrice.toFixed(2) }}</div>
            <div class="qty">x{{ item.quantity }}</div>
          </div>
        </div>
        <div class="total-row">
          <span>共 {{ order.itemCount }} 件商品</span>
          <span class="total">实付 <em>¥{{ order.payAmount.toFixed(2) }}</em></span>
        </div>
      </div>

      <!-- 配送地址 -->
      <div v-if="order.address" class="address-section">
        <div class="addr-head">
          <van-icon name="location-o" color="#FF6B35" />
          <span class="contact">{{ order.address.contactName }} {{ order.address.contactPhone }}</span>
        </div>
        <div class="addr-detail">{{ order.address.fullAddress || order.address.detail }}</div>
      </div>

      <!-- 订单信息 -->
      <van-cell-group inset title="订单信息">
        <van-cell title="订单编号">
          <template #value>
            <span class="mono">{{ order.orderNo }}</span>
            <van-icon name="description" @click="copyOrderNo" />
          </template>
        </van-cell>
        <van-cell title="下单时间" :value="formatDate(order.createdAt)" />
        <van-cell v-if="order.payTime" title="支付时间" :value="formatDate(order.payTime)" />
        <van-cell v-if="order.completeTime" title="完成时间" :value="formatDate(order.completeTime)" />
        <van-cell v-if="order.payType" title="支付方式" :value="PAY_TYPE_DESC[order.payType]" />
        <van-cell v-if="order.remark" title="备注" :value="order.remark" />
      </van-cell-group>

      <!-- 金额明细 -->
      <van-cell-group inset title="金额明细">
        <van-cell title="商品金额" :value="`¥${order.totalAmount.toFixed(2)}`" />
        <van-cell title="配送费" :value="`¥${order.deliveryFee.toFixed(2)}`" />
        <van-cell title="打包费" :value="`¥${order.packingFee.toFixed(2)}`" />
        <van-cell v-if="order.couponAmount > 0" title="优惠">
          <template #value>
            <span class="discount">-¥{{ order.couponAmount.toFixed(2) }}</span>
          </template>
        </van-cell>
        <van-cell title="实付金额">
          <template #value>
            <span class="pay-amount">¥{{ order.payAmount.toFixed(2) }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 底部操作 -->
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

    <EmptyState v-else description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getOrderDetail,
  cancelOrder,
  confirmReceived,
  type OrderVO
} from '@/api/user/order.api'
import { ORDER_STATUS, ORDER_STATUS_DESC, PAY_TYPE_DESC } from '@/utils/constants'
import { formatDate, formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const order = ref<OrderVO | null>(null)
const loading = ref(true)

const showDeliveryEntry = computed(() => {
  if (!order.value) return false
  return [ORDER_STATUS.RIDER_TAKEN, ORDER_STATUS.PICKED_UP, ORDER_STATUS.DELIVERING, ORDER_STATUS.DELIVERED]
    .includes(order.value.status)
})

interface Action {
  text: string
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  plain?: boolean
  onClick: () => void
}

const actions = computed<Action[]>(() => {
  if (!order.value) return []
  const s = order.value.status
  const list: Action[] = []
  if (s === ORDER_STATUS.PENDING_PAY) {
    list.push({ text: '取消订单', plain: true, onClick: onCancel })
    list.push({ text: '去支付', type: 'primary', onClick: goPay })
  } else if (s === ORDER_STATUS.PAID || s === ORDER_STATUS.MERCHANT_ACCEPTED) {
    list.push({ text: '申请退款', plain: true, onClick: goRefund })
  } else if (s === ORDER_STATUS.DELIVERED) {
    list.push({ text: '确认收货', type: 'primary', onClick: onConfirm })
  } else if (s === ORDER_STATUS.COMPLETED) {
    list.push({ text: '再来一单', plain: true, onClick: goMerchant })
    list.push({ text: '去评价', type: 'primary', onClick: goRating })
  }
  return list
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

function copyOrderNo() {
  if (!order.value) return
  navigator.clipboard?.writeText(order.value.orderNo).then(() => {
    showSuccessToast('已复制')
  }).catch(() => {
    showFailToast('复制失败')
  })
}

function goPay() {
  router.push(`/user/payment/${orderId}`)
}

function goMerchant() {
  if (order.value) router.push(`/user/merchant/${order.value.merchantId}`)
}

function goDelivery() {
  router.push(`/user/order/${orderId}/delivery`)
}

function goRating() {
  router.push(`/user/order/${orderId}/rating`)
}

function goRefund() {
  router.push(`/user/order/${orderId}/refund`)
}

async function onCancel() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定取消该订单吗？' })
    await cancelOrder(orderId, '用户取消')
    showSuccessToast('已取消')
    loadOrder()
  } catch {
    // 取消
  }
}

async function onConfirm() {
  try {
    await showConfirmDialog({ title: '提示', message: '确认已收到餐品吗？' })
    await confirmReceived(orderId)
    showSuccessToast('已确认收货')
    loadOrder()
  } catch {
    // 取消
  }
}

onMounted(loadOrder)
</script>

<style scoped lang="scss">
.order-detail {
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
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #fff;
  padding: 24px 16px;
  .status {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }
  .expected {
    margin: 8px 0 0;
    font-size: 13px;
    opacity: 0.9;
  }
  .delivery-entry {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    font-size: 12px;
    cursor: pointer;
  }
}
.merchant-section {
  margin: 10px 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  .merchant-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f5f5;
    .name {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }
  .order-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    .info {
      flex: 1;
      min-width: 0;
      .name {
        margin: 0;
        font-size: 14px;
        color: #333;
      }
      .spec {
        margin: 4px 0 0;
        font-size: 12px;
        color: #999;
      }
    }
    .right {
      text-align: right;
      .price {
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }
      .qty {
        font-size: 12px;
        color: #999;
      }
    }
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #f5f5f5;
    font-size: 13px;
    color: #666;
    .total em {
      color: #ff6b35;
      font-size: 16px;
      font-weight: 700;
      font-style: normal;
    }
  }
}
.address-section {
  margin: 10px 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  .addr-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  .addr-detail {
    margin-top: 6px;
    font-size: 12px;
    color: #999;
  }
}
.mono {
  font-family: monospace;
  margin-right: 6px;
}
.discount {
  color: #ff6b35;
}
.pay-amount {
  color: #ff6b35;
  font-weight: 700;
  font-size: 16px;
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
