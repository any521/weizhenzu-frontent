<template>
  <span class="status-tag" :class="statusClass">{{ statusDesc }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ORDER_STATUS_DESC } from '@/utils/constants'

const props = defineProps<{ status: number; desc?: string }>()

const STATUS_CLASS: Record<number, string> = {
  0: 'warning', // 待支付
  1: 'primary', // 待接单
  2: 'primary', // 商家已接单
  3: 'primary', // 骑手已接单
  4: 'primary', // 已取餐
  5: 'primary', // 配送中
  6: 'success', // 已送达
  7: 'success', // 已完成
  8: 'gray', // 已取消
  9: 'danger', // 退款中
  10: 'gray' // 已退款
}

const statusDesc = computed(() => props.desc || ORDER_STATUS_DESC[props.status] || '未知')
const statusClass = computed(() => STATUS_CLASS[props.status] || 'gray')
</script>

<style scoped lang="scss">
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  &.warning {
    background: #fff7e6;
    color: #fa8c16;
  }
  &.primary {
    background: #e6f7ff;
    color: #1890ff;
  }
  &.success {
    background: #f6ffed;
    color: #52c41a;
  }
  &.danger {
    background: #fff1f0;
    color: #f5222d;
  }
  &.gray {
    background: #f5f5f5;
    color: #999;
  }
}
</style>
