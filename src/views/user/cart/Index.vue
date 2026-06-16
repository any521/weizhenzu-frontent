<template>
  <div class="cart-page">
    <AppHeader title="购物车" show-back>
      <template #right>
        <span v-if="cartStore.items.length" class="edit-btn" @click="editing = !editing">
          {{ editing ? '完成' : '编辑' }}
        </span>
      </template>
    </AppHeader>

    <EmptyState
      v-if="!cartStore.items.length"
      description="购物车空空如也"
      image="default"
    >
      <template #action>
        <van-button type="primary" round size="small" @click="goHome">去逛逛</van-button>
      </template>
    </EmptyState>

    <template v-else>
      <div class="merchant-section" v-for="[merchantId, items] in merchantList" :key="merchantId">
        <div class="merchant-head">
          <van-icon name="shop-o" />
          <span class="name ellipsis">{{ items[0].merchantName }}</span>
          <van-icon name="arrow" size="12" />
        </div>
        <van-swipe-cell v-for="item in items" :key="item.id">
          <div class="cart-item">
            <van-checkbox v-model="checkedMap[item.id]" @change="onCheckChange" />
            <van-image :src="item.dishImage" width="64" height="64" radius="6" fit="cover" />
            <div class="info">
              <h3 class="name ellipsis">{{ item.dishName }}</h3>
              <p v-if="item.specName" class="spec ellipsis">{{ item.specName }}</p>
              <div class="bottom">
                <span class="price">¥{{ item.unitPrice.toFixed(2) }}</span>
                <van-stepper
                  :model-value="item.quantity"
                  :min="0"
                  :max="99"
                  theme="round"
                  button-size="22"
                  @change="(v: number) => onQtyChange(item, v)"
                />
              </div>
            </div>
          </div>
          <template #right>
            <van-button square type="danger" text="删除" class="del-btn" @click="onRemove(item)" />
          </template>
        </van-swipe-cell>
      </div>

      <div class="bottom-bar">
        <van-checkbox v-model="allChecked" @change="onAllCheck">全选</van-checkbox>
        <div class="total">
          <template v-if="!editing">
            <span class="label">合计：</span>
            <span class="amount">¥{{ totalAmount.toFixed(2) }}</span>
          </template>
        </div>
        <van-button
          v-if="!editing"
          type="primary"
          round
          :disabled="checkedItems.length === 0"
          @click="onCheckout"
        >去结算({{ checkedItems.length }})</van-button>
        <van-button
          v-else
          type="danger"
          round
          :disabled="checkedItems.length === 0"
          @click="onBatchRemove"
        >删除</van-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useCartStore, type CartItem } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const editing = ref(false)
const checkedMap = reactive<Record<number, boolean>>({})

// 初始化选中状态
cartStore.items.forEach(i => {
  if (checkedMap[i.id] === undefined) checkedMap[i.id] = true
})

const merchantList = computed(() => Array.from(cartStore.groupedByMerchant.entries()))

const checkedItems = computed(() => cartStore.items.filter(i => checkedMap[i.id]))

const allChecked = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(i => checkedMap[i.id]),
  set: (val: boolean) => {
    cartStore.items.forEach(i => {
      checkedMap[i.id] = val
    })
  }
})

const totalAmount = computed(() =>
  checkedItems.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
)

function onCheckChange() {
  // 触发响应式更新
}

function onAllCheck(val: boolean) {
  cartStore.items.forEach(i => {
    checkedMap[i.id] = val
  })
}

function onQtyChange(item: CartItem, qty: number) {
  if (qty <= 0) {
    cartStore.remove(item.dishId, item.specId)
    delete checkedMap[item.id]
  } else {
    cartStore.updateQuantity(item.dishId, item.specId, qty)
  }
}

async function onRemove(item: CartItem) {
  try {
    await showConfirmDialog({ title: '提示', message: '确定删除该商品吗？' })
    cartStore.remove(item.dishId, item.specId)
    delete checkedMap[item.id]
    showSuccessToast('已删除')
  } catch {
    // 取消
  }
}

async function onBatchRemove() {
  if (checkedItems.value.length === 0) return
  try {
    await showConfirmDialog({ title: '提示', message: `确定删除选中的 ${checkedItems.value.length} 件商品吗？` })
    checkedItems.value.forEach(item => {
      cartStore.remove(item.dishId, item.specId)
      delete checkedMap[item.id]
    })
    showSuccessToast('已删除')
  } catch {
    // 取消
  }
}

function onCheckout() {
  if (checkedItems.value.length === 0) return
  router.push('/user/checkout')
}

function goHome() {
  router.push('/user/home')
}
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}
.edit-btn {
  color: #ff6b35;
  font-size: 14px;
}
.merchant-section {
  margin: 10px 12px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  .merchant-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #f5f5f5;
    .name {
      flex: 1;
    }
  }
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  .spec {
    margin: 0;
    font-size: 12px;
    color: #999;
  }
  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .price {
      color: #ff6b35;
      font-size: 16px;
      font-weight: 600;
    }
  }
}
.del-btn {
  height: 100%;
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
  padding: 0 16px;
  gap: 12px;
  z-index: 99;
  .total {
    flex: 1;
    text-align: right;
    .label {
      font-size: 13px;
      color: #666;
    }
    .amount {
      font-size: 20px;
      font-weight: 700;
      color: #ff6b35;
    }
  }
  .van-button {
    height: 40px;
    padding: 0 20px;
  }
}
</style>
