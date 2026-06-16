<template>
  <div class="coupon-card" :class="{ disabled: coupon.status !== undefined && coupon.status !== 0 }">
    <div class="left" :class="typeClass">
      <div class="amount">
        <span class="symbol" v-if="coupon.type === 1 || coupon.type === 3">¥</span>
        <span class="number">{{ displayAmount }}</span>
        <span class="symbol" v-if="coupon.type === 2">折</span>
      </div>
      <div class="threshold">{{ thresholdText }}</div>
    </div>
    <div class="right">
      <div class="name">{{ coupon.name || coupon.coupon?.name }}</div>
      <div class="scope">{{ scopeText }}</div>
      <div class="validity">{{ validityText }}</div>
      <div v-if="coupon.statusDesc" class="status">{{ coupon.statusDesc }}</div>
    </div>
    <div v-if="$slots.action" class="action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/format'
import type { CouponVO, UserCouponVO } from '@/api/user/coupon.api'

const props = defineProps<{
  coupon: CouponVO | UserCouponVO
}>()

const isUserCoupon = computed(() => 'coupon' in props.coupon)
const couponInfo = computed<CouponVO>(() =>
  isUserCoupon.value ? (props.coupon as UserCouponVO).coupon : (props.coupon as CouponVO)
)

const typeClass = computed(() => {
  const t = couponInfo.value.type
  if (t === 1) return 'type-full'
  if (t === 2) return 'type-discount'
  return 'type-cash'
})

const displayAmount = computed(() => {
  const c = couponInfo.value
  if (c.type === 2) return (c.discount * 10).toFixed(1)
  return c.amount.toFixed(0)
})

const thresholdText = computed(() => {
  const c = couponInfo.value
  if (c.type === 1) return `满${c.threshold}元可用`
  if (c.type === 2) return `无门槛`
  return `无门槛`
})

const scopeText = computed(() => {
  const c = couponInfo.value
  if (c.scope === 1) return '全场通用'
  if (c.scope === 2) return '指定商家'
  if (c.scope === 3) return '指定分类'
  return c.scopeDesc || '全场通用'
})

const validityText = computed(() => {
  if (isUserCoupon.value) {
    const uc = props.coupon as UserCouponVO
    return `有效期至 ${formatDate(uc.expiredTime, 'YYYY-MM-DD')}`
  }
  const c = couponInfo.value
  if (c.validType === 1) {
    return `${formatDate(c.validStartTime, 'YYYY-MM-DD')} - ${formatDate(c.validEndTime, 'YYYY-MM-DD')}`
  }
  return `领取后${c.validDays}天内有效`
})
</script>

<style scoped lang="scss">
.coupon-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
  &.disabled {
    opacity: 0.5;
  }
  .left {
    width: 100px;
    padding: 16px 8px;
    color: #fff;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: linear-gradient(135deg, #ff6b35, #ff8c42);
    &.type-discount {
      background: linear-gradient(135deg, #7232dd, #8a4ee8);
    }
    &.type-cash {
      background: linear-gradient(135deg, #2196f3, #42a5f5);
    }
    .amount {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 2px;
      .symbol {
        font-size: 14px;
      }
      .number {
        font-size: 28px;
        font-weight: 700;
      }
    }
    .threshold {
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.9;
    }
  }
  .right {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-width: 0;
    .name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .scope,
    .validity {
      font-size: 11px;
      color: #999;
    }
    .status {
      font-size: 11px;
      color: #ff6b35;
    }
  }
  .action {
    display: flex;
    align-items: center;
    padding-right: 12px;
  }
}
</style>
