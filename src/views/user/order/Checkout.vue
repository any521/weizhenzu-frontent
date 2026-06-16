<template>
  <div class="checkout-page">
    <AppHeader title="确认订单" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else>
      <!-- 收货地址 -->
      <van-cell
        class="address-cell"
        is-link
        clickable
        @click="goSelectAddress"
      >
        <template v-if="address">
          <div class="address-info">
            <div class="contact">
              <span class="name">{{ address.contactName }}</span>
              <span class="phone">{{ address.contactPhone }}</span>
              <van-tag v-if="address.tag" plain color="#FF6B35" text-color="#FF6B35" round size="mini">
                {{ address.tag }}
              </van-tag>
            </div>
            <div class="detail">{{ address.fullAddress || address.detail }}</div>
          </div>
        </template>
        <template v-else>
          <div class="no-address">
            <van-icon name="add-o" />
            <span>请选择收货地址</span>
          </div>
        </template>
      </van-cell>

      <!-- 商家及商品 -->
      <div class="merchant-section">
        <div class="merchant-head">
          <van-icon name="shop-o" />
          <span class="name">{{ merchantName }}</span>
        </div>
        <div v-for="item in items" :key="item.id" class="order-item">
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
      </div>

      <!-- 优惠券 -->
      <van-cell-group inset class="cell-group">
        <van-cell title="优惠券" is-link clickable @click="showCouponPicker = true">
          <template #value>
            <span v-if="selectedCoupon" class="coupon-value">
              -¥{{ couponAmount.toFixed(2) }}
            </span>
            <span v-else-if="usableCoupons.length" class="coupon-tip">
              {{ usableCoupons.length }}张可用
            </span>
            <span v-else class="no-coupon">暂无可用</span>
          </template>
        </van-cell>
        <van-cell title="订单备注" is-link clickable @click="showRemarkPopup = true">
          <template #value>
            <span class="remark-text ellipsis">{{ remark || '点击添加备注' }}</span>
          </template>
        </van-cell>
        <van-cell title="配送方式">
          <template #value>
            <span>商家配送</span>
          </template>
        </van-cell>
        <van-cell title="餐具份数" is-link clickable @click="showTablewarePicker = true">
          <template #value>
            <span>{{ tablewareText }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 金额明细 -->
      <van-cell-group inset class="cell-group">
        <van-cell title="商品金额">
          <template #value>
            <span>¥{{ goodsAmount.toFixed(2) }}</span>
          </template>
        </van-cell>
        <van-cell title="配送费">
          <template #value>
            <span>¥{{ deliveryFee.toFixed(2) }}</span>
          </template>
        </van-cell>
        <van-cell title="打包费">
          <template #value>
            <span>¥{{ packingFee.toFixed(2) }}</span>
          </template>
        </van-cell>
        <van-cell v-if="couponAmount > 0" title="优惠">
          <template #value>
            <span class="discount">-¥{{ couponAmount.toFixed(2) }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 底部提交 -->
      <div class="bottom-bar">
        <div class="total">
          <span class="label">合计</span>
          <span class="amount">¥{{ payAmount.toFixed(2) }}</span>
        </div>
        <van-button
          type="primary"
          round
          :loading="submitting"
          :disabled="!address"
          @click="onSubmit"
        >提交订单</van-button>
      </div>
    </template>

    <!-- 优惠券选择 -->
    <van-popup v-model:show="showCouponPicker" position="bottom" round>
      <div class="popup-wrap">
        <div class="popup-head">
          <span class="title">选择优惠券</span>
          <van-icon name="cross" @click="showCouponPicker = false" />
        </div>
        <div class="popup-body">
          <van-cell
            title="不使用优惠券"
            clickable
            @click="onSelectCoupon(null)"
            :is-link="!selectedCoupon"
          >
            <template #right-icon>
              <van-icon v-if="!selectedCoupon" name="success" color="#FF6B35" />
            </template>
          </van-cell>
          <CouponCard
            v-for="c in usableCoupons"
            :key="c.id"
            :coupon="c"
            @click="onSelectCoupon(c)"
          >
            <template #action>
              <van-icon
                v-if="selectedCoupon?.id === c.id"
                name="success"
                color="#FF6B35"
                size="20"
              />
            </template>
          </CouponCard>
          <EmptyState v-if="usableCoupons.length === 0" description="暂无可用优惠券" />
        </div>
      </div>
    </van-popup>

    <!-- 备注弹窗 -->
    <van-popup v-model:show="showRemarkPopup" position="bottom" round>
      <div class="popup-wrap">
        <div class="popup-head">
          <span class="title">订单备注</span>
          <van-icon name="cross" @click="showRemarkPopup = false" />
        </div>
        <div class="popup-body">
          <van-field
            v-model="remarkInput"
            type="textarea"
            placeholder="请输入备注信息（口味、偏好等）"
            rows="3"
            maxlength="100"
            show-word-limit
            autosize
          />
          <div class="quick-tags">
            <van-tag
              v-for="t in quickRemarks"
              :key="t"
              plain
              round
              color="#FF6B35"
              text-color="#FF6B35"
              size="medium"
              @click="appendRemark(t)"
            >{{ t }}</van-tag>
          </div>
          <van-button type="primary" block round @click="onConfirmRemark">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 餐具选择 -->
    <van-action-sheet
      v-model:show="showTablewarePicker"
      :actions="tablewareActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectTableware"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CouponCard from '@/components/user/CouponCard.vue'
import { useCartStore } from '@/stores/cart'
import { getAddresses, type AddressVO } from '@/api/user/address.api'
import { getUsableCoupons, type UserCouponVO } from '@/api/user/coupon.api'
import { createOrder } from '@/api/user/order.api'
import { generateClientToken } from '@/utils/format'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const submitting = ref(false)
const address = ref<AddressVO | null>(null)
const usableCoupons = ref<UserCouponVO[]>([])
const selectedCoupon = ref<UserCouponVO | null>(null)
const remark = ref('')
const remarkInput = ref('')
const tablewareCount = ref(1)
const showCouponPicker = ref(false)
const showRemarkPopup = ref(false)
const showTablewarePicker = ref(false)

const quickRemarks = ['少放辣', '不要葱', '不要香菜', '多加醋', '打包', '尽快送达']
const tablewareActions = [
  { name: '不需要餐具', value: 0 },
  { name: '1份', value: 1 },
  { name: '2份', value: 2 },
  { name: '3份', value: 3 },
  { name: '4份', value: 4 }
]

const items = computed(() => cartStore.items)
const merchantName = computed(() => items.value[0]?.merchantName || '')
const merchantId = computed(() => items.value[0]?.merchantId || 0)

const goodsAmount = computed(() =>
  items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
)
const deliveryFee = computed(() => 5)
const packingFee = computed(() => items.value.length * 1)
const couponAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  const c = selectedCoupon.value.coupon
  if (c.type === 1) return c.amount
  if (c.type === 2) return goodsAmount.value * (1 - c.discount)
  return c.amount
})
const payAmount = computed(() =>
  Math.max(0, goodsAmount.value + deliveryFee.value + packingFee.value - couponAmount.value)
)

const tablewareText = computed(() =>
  tablewareCount.value === 0 ? '不需要餐具' : `${tablewareCount.value}份`
)

async function loadData() {
  loading.value = true
  if (items.value.length === 0) {
    showFailToast('购物车为空')
    router.back()
    return
  }
  try {
    const addresses = await getAddresses()
    address.value = addresses.find(a => a.isDefault === 1) || addresses[0] || null
    usableCoupons.value = await getUsableCoupons(merchantId.value, goodsAmount.value)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function goSelectAddress() {
  router.push('/user/address')
}

function onSelectCoupon(coupon: UserCouponVO | null) {
  selectedCoupon.value = coupon
  showCouponPicker.value = false
}

function appendRemark(t: string) {
  remarkInput.value = remarkInput.value ? `${remarkInput.value} ${t}` : t
}

function onConfirmRemark() {
  remark.value = remarkInput.value
  showRemarkPopup.value = false
}

function onSelectTableware(action: any) {
  tablewareCount.value = action.value
}

async function onSubmit() {
  if (!address.value) {
    showFailToast('请选择收货地址')
    return
  }
  submitting.value = true
  try {
    const order = await createOrder({
      merchantId: merchantId.value,
      addressId: address.value.id,
      items: items.value.map(i => ({
        dishId: i.dishId,
        specId: i.specId,
        quantity: i.quantity
      })),
      userCouponId: selectedCoupon.value?.id,
      remark: remark.value,
      clientToken: generateClientToken()
    })
    cartStore.clearByMerchant(merchantId.value)
    showSuccessToast('下单成功')
    router.replace(`/user/payment/${order.id}`)
  } catch (e: any) {
    showFailToast(e?.message || '下单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.address-cell {
  margin: 10px 12px;
  border-radius: 8px;
  overflow: hidden;
  .address-info {
    .contact {
      display: flex;
      align-items: center;
      gap: 8px;
      .name {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
      .phone {
        font-size: 13px;
        color: #666;
      }
    }
    .detail {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }
  }
  .no-address {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ff6b35;
    font-size: 14px;
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
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  .order-item {
    display: flex;
    gap: 10px;
    padding: 8px 0;
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
}
.cell-group {
  margin: 10px 12px;
}
.coupon-value {
  color: #ff6b35;
  font-weight: 600;
}
.coupon-tip {
  color: #ff6b35;
}
.no-coupon {
  color: #999;
}
.remark-text {
  max-width: 200px;
  color: #999;
}
.discount {
  color: #ff6b35;
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
    padding: 0 24px;
  }
}
.popup-wrap {
  background: #fff;
  border-radius: 12px 12px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  .popup-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    .title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }
  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }
}
</style>
