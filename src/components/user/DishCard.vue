<template>
  <div class="dish-card" @click="onClick">
    <van-image
      :src="dish.image || defaultImage"
      width="90"
      height="90"
      radius="8"
      fit="cover"
    />
    <div class="info">
      <h3 class="name ellipsis-2">{{ dish.name }}</h3>
      <p v-if="dish.description" class="desc ellipsis">{{ dish.description }}</p>
      <div class="meta">
        <span class="sales">月售{{ dish.sales || 0 }}</span>
        <span v-if="dish.rating" class="rating">好评 {{ dish.rating.toFixed(1) }}</span>
      </div>
      <div class="bottom">
        <div class="price-row">
          <span class="price">¥{{ dish.price }}</span>
          <span v-if="dish.originalPrice && dish.originalPrice > dish.price" class="original">
            ¥{{ dish.originalPrice }}
          </span>
        </div>
        <van-stepper
          v-if="showStepper"
          :model-value="quantity"
          :min="0"
          :max="dish.stock"
          theme="round"
          button-size="22"
          @change="onStepperChange"
        >
          <template v-if="quantity === 0" #input>
            <van-icon name="add" color="#fff" size="14" />
          </template>
        </van-stepper>
        <van-button
          v-else-if="showAddBtn"
          size="mini"
          type="primary"
          round
          :disabled="dish.stock <= 0"
          @click.stop="onAdd"
        >
          <van-icon name="cart-o" />
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DishVO } from '@/api/user/dish.api'

const props = withDefaults(
  defineProps<{
    dish: DishVO
    quantity?: number
    showStepper?: boolean
    showAddBtn?: boolean
  }>(),
  {
    quantity: 0,
    showStepper: false,
    showAddBtn: true
  }
)

const emit = defineEmits<{
  click: [dish: DishVO]
  add: [dish: DishVO]
  change: [dish: DishVO, qty: number]
}>()

const defaultImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><rect width="90" height="90" fill="%23f5f5f5"/><text x="50%25" y="50%25" font-size="12" fill="%23999" text-anchor="middle" dy=".3em">菜品</text></svg>'

function onClick() {
  emit('click', props.dish)
}

function onAdd() {
  emit('add', props.dish)
}

function onStepperChange(qty: number) {
  emit('change', props.dish, qty)
}
</script>

<style scoped lang="scss">
.dish-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  &:active {
    background: #fafafa;
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
  }
  .desc {
    margin: 0;
    font-size: 12px;
    color: #999;
  }
  .meta {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: #999;
  }
  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .price-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .price {
    color: #ff6b35;
    font-size: 16px;
    font-weight: 600;
  }
  .original {
    color: #999;
    font-size: 12px;
    text-decoration: line-through;
  }
}
</style>
