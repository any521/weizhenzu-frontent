<template>
  <div class="merchant-card" @click="onClick">
    <div class="logo">
      <van-image
        :src="merchant.logo || defaultLogo"
        width="80"
        height="80"
        radius="8"
        fit="cover"
      />
      <span v-if="merchant.status !== 1" class="closed-mask">休息中</span>
    </div>
    <div class="info">
      <div class="name-row">
        <h3 class="name ellipsis">{{ merchant.name }}</h3>
        <van-icon v-if="merchant.isFavorite" name="like" color="#FF6B35" size="16" />
      </div>
      <div class="meta">
        <van-rate :model-value="merchant.rating || 5" readonly size="12" allow-half />
        <span class="rating">{{ (merchant.rating || 5).toFixed(1) }}</span>
        <span class="divider">|</span>
        <span>月售{{ merchant.monthlySales || 0 }}</span>
        <span class="divider">|</span>
        <span>{{ merchant.deliveryTime || 30 }}分钟</span>
      </div>
      <div class="tags" v-if="merchant.tags?.length">
        <span v-for="tag in merchant.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="bottom">
        <span class="fee">起送 ¥{{ merchant.minOrderAmount || 0 }}</span>
        <span class="fee">配送 ¥{{ merchant.deliveryFee || 0 }}</span>
        <span v-if="merchant.distance" class="distance">{{ formatDistance(merchant.distance) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistance } from '@/utils/format'
import type { MerchantVO } from '@/api/user/merchant.api'

const props = defineProps<{
  merchant: MerchantVO
}>()

const emit = defineEmits<{
  click: [merchant: MerchantVO]
}>()

const defaultLogo = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f5f5f5"/><text x="50%25" y="50%25" font-size="14" fill="%23999" text-anchor="middle" dy=".3em">店铺</text></svg>'

function onClick() {
  emit('click', props.merchant)
}
</script>

<style scoped lang="scss">
.merchant-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:active {
    background: #fafafa;
  }
  .logo {
    position: relative;
    flex-shrink: 0;
    .closed-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 12px;
      border-radius: 8px;
    }
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
    .rating {
      color: #ff9800;
      font-weight: 600;
    }
    .divider {
      color: #ddd;
    }
  }
  .tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    .tag {
      padding: 1px 6px;
      background: #fff5ed;
      color: #ff6b35;
      font-size: 11px;
      border-radius: 4px;
    }
  }
  .bottom {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #666;
    .distance {
      margin-left: auto;
      color: #999;
    }
  }
}
</style>
