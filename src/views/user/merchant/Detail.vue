<template>
  <div class="merchant-detail">
    <AppHeader :title="merchant?.name || '商家详情'" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="merchant">
      <!-- 商家信息 -->
      <div class="merchant-info">
        <van-image
          :src="merchant.coverImage || merchant.logo"
          width="100%"
          height="160"
          fit="cover"
        />
        <div class="info-card">
          <div class="name-row">
            <h2 class="name">{{ merchant.name }}</h2>
            <van-icon
              :name="isFavorite ? 'like' : 'like-o'"
              :color="isFavorite ? '#FF6B35' : '#999'"
              size="22"
              @click="onToggleFavorite"
            />
          </div>
          <div class="meta">
            <van-rate :model-value="merchant.rating || 5" readonly size="12" allow-half />
            <span class="rating">{{ (merchant.rating || 5).toFixed(1) }}</span>
            <span class="divider">|</span>
            <span>月售{{ merchant.monthlySales || 0 }}</span>
            <span class="divider">|</span>
            <span>{{ merchant.deliveryTime || 30 }}分钟送达</span>
          </div>
          <div v-if="merchant.notice" class="notice">
            <van-icon name="volume-o" />
            <span class="ellipsis">{{ merchant.notice }}</span>
          </div>
          <div class="fees">
            <span>起送 ¥{{ merchant.minOrderAmount || 0 }}</span>
            <span>配送 ¥{{ merchant.deliveryFee || 0 }}</span>
            <span>打包 ¥{{ merchant.packingFee || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 菜单 -->
      <div class="menu-wrap">
        <van-sidebar v-model="activeCategoryIndex" class="cat-side">
          <van-sidebar-item
            v-for="cat in categories"
            :key="cat.id"
            :title="`${cat.name} ${cat.dishCount || ''}`"
          />
        </van-sidebar>

        <div class="dish-list">
          <template v-if="currentDishes.length">
            <DishCard
              v-for="dish in currentDishes"
              :key="dish.id"
              :dish="dish"
              :quantity="getQty(dish)"
              show-stepper
              @click="goDish(dish.id)"
              @change="onDishChange"
            />
          </template>
          <EmptyState v-else description="该分类下暂无菜品" />
        </div>
      </div>

      <!-- 购物车悬浮条 -->
      <div v-if="cartStore.totalCount > 0" class="cart-bar">
        <div class="left">
          <van-badge :content="cartStore.totalCount" max="99">
            <van-icon name="shopping-cart" size="28" color="#FF6B35" />
          </van-badge>
          <div class="amount">
            <div class="total">¥{{ cartStore.totalPrice.toFixed(2) }}</div>
            <div class="hint">另需配送 ¥{{ merchant.deliveryFee || 0 }}</div>
          </div>
        </div>
        <van-button
          type="primary"
          round
          :disabled="cartStore.totalPrice < (merchant.minOrderAmount || 0)"
          @click="goCheckout"
        >去结算</van-button>
      </div>
    </template>

    <EmptyState v-else description="商家不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import DishCard from '@/components/user/DishCard.vue'
import {
  getMerchantDetail,
  favoriteMerchant,
  unfavoriteMerchant,
  type MerchantVO
} from '@/api/user/merchant.api'
import {
  getMerchantMenu,
  type DishVO,
  type DishCategoryVO
} from '@/api/user/dish.api'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const merchantId = Number(route.params.id)
const merchant = ref<MerchantVO | null>(null)
const categories = ref<DishCategoryVO[]>([])
const dishes = ref<DishVO[]>([])
const activeCategoryIndex = ref(0)
const loading = ref(true)
const isFavorite = ref(false)

const currentDishes = computed(() => {
  const cat = categories.value[activeCategoryIndex.value]
  if (!cat) return []
  return dishes.value.filter(d => d.categoryId === cat.id)
})

async function loadData() {
  loading.value = true
  try {
    const [m, menu] = await Promise.all([
      getMerchantDetail(merchantId),
      getMerchantMenu(merchantId)
    ])
    merchant.value = m
    isFavorite.value = (m as any).isFavorite || false
    categories.value = menu.categories
    dishes.value = menu.dishes
    cartStore.currentMerchantId = merchantId
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function getQty(dish: DishVO): number {
  const item = cartStore.items.find(i => i.dishId === dish.id && !i.specId)
  return item?.quantity || 0
}

async function onDishChange(dish: DishVO, qty: number) {
  if (!merchant.value) return
  try {
    if (qty === 0) {
      cartStore.remove(dish.id, undefined)
    } else {
      const exist = cartStore.items.find(i => i.dishId === dish.id && !i.specId)
      if (exist) {
        cartStore.updateQuantity(dish.id, undefined, qty)
      } else {
        await cartStore.add({
          id: Date.now(),
          merchantId,
          merchantName: merchant.value.name,
          dishId: dish.id,
          dishName: dish.name,
          dishImage: dish.image,
          unitPrice: dish.price,
          quantity: qty
        })
      }
    }
  } catch (e: any) {
    if (e?.message !== '用户取消') {
      showFailToast('添加失败')
    }
  }
}

async function onToggleFavorite() {
  if (!merchant.value) return
  try {
    if (isFavorite.value) {
      await unfavoriteMerchant(merchantId)
      isFavorite.value = false
      showSuccessToast('已取消收藏')
    } else {
      await favoriteMerchant(merchantId)
      isFavorite.value = true
      showSuccessToast('收藏成功')
    }
  } catch {
    showFailToast('操作失败')
  }
}

function goDish(id: number) {
  router.push(`/user/dish/${id}`)
}

function goCheckout() {
  if (!merchant.value) return
  if (cartStore.totalPrice < (merchant.value.minOrderAmount || 0)) {
    showFailToast(`起送价 ¥${merchant.value.minOrderAmount}`)
    return
  }
  router.push('/user/checkout')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.merchant-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.merchant-info {
  background: #fff;
  .info-card {
    padding: 12px 16px;
  }
  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .name {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
    margin-top: 6px;
    .rating {
      color: #ff9800;
      font-weight: 600;
    }
    .divider {
      color: #ddd;
    }
  }
  .notice {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 6px 8px;
    background: #fff5ed;
    color: #ff6b35;
    font-size: 12px;
    border-radius: 4px;
    span {
      flex: 1;
    }
  }
  .fees {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}
.menu-wrap {
  display: flex;
  margin-top: 10px;
  min-height: 60vh;
  .cat-side {
    width: 90px;
    flex-shrink: 0;
  }
  .dish-list {
    flex: 1;
    padding: 8px;
    background: #fff;
    min-width: 0;
  }
}
.cart-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  height: 56px;
  background: #2a2a2a;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 16px;
  z-index: 99;
  .left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
  }
  .amount {
    .total {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    .hint {
      font-size: 11px;
      color: #999;
    }
  }
  .van-button {
    height: 40px;
    padding: 0 20px;
  }
}
</style>
