<template>
  <div class="order-card" @click="onClick">
    <div class="header">
      <div class="merchant">
        <van-image :src="order.merchantLogo" width="24" height="24" radius="4" fit="cover" />
        <span class="name ellipsis">{{ order.merchantName }}</span>
        <van-icon name="arrow" size="12" />
      </div>
      <OrderStatusTag :status="order.status" :desc="order.statusDesc" />
    </div>
    <div class="body">
      <van-image
        v-for="(item, idx) in order.items.slice(0, 3)"
        :key="idx"
        :src="item.dishImage"
        width="60"
        height="60"
        radius="6"
        fit="cover"
      />
      <div v-if="order.items.length > 3" class="more">+{{ order.items.length - 3 }}</div>
      <div class="amount">
        <div class="total">¥{{ order.payAmount }}</div>
        <div class="count">共{{ order.itemCount }}件</div>
      </div>
    </div>
    <div class="footer">
      <span class="time">{{ formatDate(order.createdAt) }}</span>
      <div class="actions">
        <van-button
          v-for="action in actions"
          :key="action.text"
          size="small"
          :type="action.type"
          :plain="action.plain"
          round
          @click.stop="action.onClick"
        >{{ action.text }}</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/format'
import OrderStatusTag from './OrderStatusTag.vue'
import type { OrderListItemVO } from '@/api/user/order.api'
import { ORDER_STATUS } from '@/utils/constants'

interface Action {
  text: string
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  plain?: boolean
  onClick: () => void
}

const props = defineProps<{
  order: OrderListItemVO
  actions?: Action[]
}>()

const emit = defineEmits<{
  click: [order: OrderListItemVO]
}>()

const actions = computed(() => props.actions || [])

function onClick() {
  emit('click', props.order)
}
</script>

<style scoped lang="scss">
.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  &:active {
    background: #fafafa;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .merchant {
    display: flex;
    align-items: center;
    gap: 6px;
    .name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      max-width: 200px;
    }
  }
  .body {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    .more {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 6px;
      color: #666;
      font-size: 14px;
    }
    .amount {
      margin-left: auto;
      text-align: right;
    }
    .total {
      font-size: 18px;
      font-weight: 600;
      color: #ff6b35;
    }
    .count {
      font-size: 12px;
      color: #999;
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #f5f5f5;
    padding-top: 10px;
    .time {
      font-size: 12px;
      color: #999;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
