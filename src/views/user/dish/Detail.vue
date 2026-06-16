<template>
  <div class="dish-detail">
    <AppHeader :title="dish?.name || '菜品详情'" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="dish">
      <van-swipe class="image-swipe" :autoplay="0" v-if="dish.images?.length">
        <van-swipe-item v-for="(img, idx) in dish.images" :key="idx">
          <van-image :src="img" width="100%" height="280" fit="cover" />
        </van-swipe-item>
      </van-swipe>
      <van-image v-else :src="dish.image" width="100%" height="280" fit="cover" />

      <div class="info-card">
        <div class="name-row">
          <h2 class="name">{{ dish.name }}</h2>
          <van-icon
            :name="dish.isFavorite ? 'like' : 'like-o'"
            :color="dish.isFavorite ? '#FF6B35' : '#999'"
            size="22"
            @click="onToggleFavorite"
          />
        </div>
        <div class="meta">
          <span class="sales">月售 {{ dish.sales || 0 }}</span>
          <span class="divider">|</span>
          <span>好评 {{ (dish.rating || 5).toFixed(1) }}</span>
          <span class="divider">|</span>
          <span>打包 ¥{{ dish.boxPrice || 0 }}</span>
        </div>
        <div class="price-row">
          <span class="price">¥{{ currentPrice.toFixed(2) }}</span>
          <span v-if="dish.originalPrice && dish.originalPrice > currentPrice" class="original">
            ¥{{ dish.originalPrice.toFixed(2) }}
          </span>
        </div>
        <p v-if="dish.description" class="desc">{{ dish.description }}</p>
        <div v-if="dish.tags?.length" class="tags">
          <van-tag
            v-for="t in dish.tags"
            :key="t"
            plain
            color="#FF6B35"
            text-color="#FF6B35"
            round
            size="medium"
          >{{ t }}</van-tag>
        </div>
      </div>

      <van-cell-group inset title="规格" v-if="dish.specs?.length">
        <van-cell
          v-for="spec in dish.specs"
          :key="spec.id"
          :title="spec.name"
          :label="`库存 ${spec.stock}`"
          clickable
          @click="onSelectSpec(spec)"
        >
          <template #right-icon>
            <div class="spec-right">
              <span class="spec-price">¥{{ spec.price.toFixed(2) }}</span>
              <van-icon v-if="selectedSpec?.id === spec.id" name="success" color="#FF6B35" />
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="购买数量">
        <van-cell title="数量" center>
          <template #right-icon>
            <van-stepper
              v-model="quantity"
              :min="1"
              :max="dish.stock || 99"
              theme="round"
              button-size="24"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </template>

    <EmptyState v-else description="菜品不存在" />

    <!-- 底部购买栏 -->
    <div v-if="dish" class="bottom-bar">
      <div class="left">
        <van-icon name="cart-o" size="24" @click="goCart" />
        <van-badge v-if="cartStore.totalCount > 0" :content="cartStore.totalCount" max="99" />
      </div>
      <div class="total">
        <span class="label">合计</span>
        <span class="amount">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button
        type="primary"
        round
        :disabled="(selectedSpec?.stock ?? dish.stock) <= 0"
        @click="onAddToCart"
      >加入购物车</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getDishDetail,
  favoriteDish,
  unfavoriteDish,
  type DishVO,
  type DishSpecVO
} from '@/api/user/dish.api'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const dishId = Number(route.params.id)
const dish = ref<DishVO | null>(null)
const loading = ref(true)
const quantity = ref(1)
const selectedSpec = ref<DishSpecVO | null>(null)

const currentPrice = computed(() => {
  if (!dish.value) return 0
  return selectedSpec.value?.price ?? dish.value.price
})

const totalPrice = computed(() => currentPrice.value * quantity.value)

async function loadData() {
  loading.value = true
  try {
    dish.value = await getDishDetail(dishId)
    if (dish.value.specs?.length) {
      selectedSpec.value = dish.value.specs[0]
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onSelectSpec(spec: DishSpecVO) {
  selectedSpec.value = spec
}

async function onAddToCart() {
  if (!dish.value) return
  const stock = selectedSpec.value?.stock ?? dish.value.stock
  if (stock <= 0) {
    showFailToast('库存不足')
    return
  }
  try {
    await cartStore.add({
      id: Date.now(),
      merchantId: dish.value.merchantId,
      merchantName: dish.value.merchantName,
      dishId: dish.value.id,
      dishName: dish.value.name,
      dishImage: dish.value.image,
      specId: selectedSpec.value?.id,
      specName: selectedSpec.value?.name,
      unitPrice: currentPrice.value,
      quantity: quantity.value
    })
    showSuccessToast('已加入购物车')
  } catch (e: any) {
    if (e?.message !== '用户取消') {
      showFailToast('添加失败')
    }
  }
}

async function onToggleFavorite() {
  if (!dish.value) return
  try {
    if (dish.value.isFavorite) {
      await unfavoriteDish(dishId)
      dish.value.isFavorite = false
      showSuccessToast('已取消收藏')
    } else {
      await favoriteDish(dishId)
      dish.value.isFavorite = true
      showSuccessToast('收藏成功')
    }
  } catch {
    showFailToast('操作失败')
  }
}

function goCart() {
  router.push('/user/cart')
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.dish-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.image-swipe {
  background: #fff;
}
.info-card {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
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
    gap: 6px;
    font-size: 12px;
    color: #999;
    margin-top: 6px;
    .divider {
      color: #ddd;
    }
  }
  .price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 10px;
    .price {
      font-size: 22px;
      font-weight: 700;
      color: #ff6b35;
    }
    .original {
      font-size: 14px;
      color: #999;
      text-decoration: line-through;
    }
  }
  .desc {
    margin: 10px 0 0;
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
}
.spec-right {
  display: flex;
  align-items: center;
  gap: 8px;
  .spec-price {
    color: #ff6b35;
    font-weight: 600;
  }
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
  .left {
    position: relative;
    display: flex;
    align-items: center;
  }
  .total {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 4px;
    .label {
      font-size: 12px;
      color: #999;
    }
    .amount {
      font-size: 20px;
      font-weight: 700;
      color: #ff6b35;
    }
  }
  .van-button {
    height: 40px;
    padding: 0 24px;
  }
}
</style>
