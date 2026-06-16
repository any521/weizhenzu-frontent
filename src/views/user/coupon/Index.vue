<template>
  <div class="coupon-page">
    <AppHeader title="我的卡券" show-back />

    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab v-for="t in tabs" :key="t.value" :title="t.label" :name="t.value" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="list-wrap">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <template v-if="activeTab === 'available'">
          <CouponCard
            v-for="c in availableList"
            :key="c.id"
            :coupon="c"
          >
            <template #action>
              <van-button
                size="mini"
                type="primary"
                round
                :disabled="c.received"
                :loading="receivingId === c.id"
                @click="onReceive(c)"
              >{{ c.received ? '已领取' : '立即领取' }}</van-button>
            </template>
          </CouponCard>
        </template>
        <template v-else>
          <CouponCard
            v-for="c in myList"
            :key="c.id"
            :coupon="c"
          />
        </template>

        <EmptyState v-if="!loading && currentList.length === 0" :description="emptyText" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CouponCard from '@/components/user/CouponCard.vue'
import {
  getAvailableCoupons,
  receiveCoupon,
  getMyCoupons,
  type CouponVO,
  type UserCouponVO
} from '@/api/user/coupon.api'

const tabs = [
  { label: '可领取', value: 'available' },
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' }
]

const activeTab = ref<'available' | 'unused' | 'used' | 'expired'>('available')
const availableList = ref<CouponVO[]>([])
const myList = ref<UserCouponVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const receivingId = ref<number | null>(null)
const page = ref(1)

const currentList = computed(() =>
  activeTab.value === 'available' ? availableList.value : myList.value
)

const emptyText = computed(() => {
  if (activeTab.value === 'available') return '暂无可领取的优惠券'
  if (activeTab.value === 'unused') return '暂无未使用的优惠券'
  if (activeTab.value === 'used') return '暂无已使用的优惠券'
  return '暂无已过期的优惠券'
})

async function loadMore() {
  if (finished.value) return
  try {
    if (activeTab.value === 'available') {
      availableList.value = await getAvailableCoupons()
      finished.value = true
    } else {
      const statusMap = { unused: 0, used: 1, expired: 2 }
      const res = await getMyCoupons({
        current: page.value,
        size: 10,
        status: statusMap[activeTab.value]
      })
      if (page.value === 1) myList.value = res.records
      else myList.value.push(...res.records)
      if (myList.value.length >= res.total || res.records.length === 0) {
        finished.value = true
      } else {
        page.value++
      }
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onTabChange() {
  reset()
  loadMore()
}

function onRefresh() {
  reset()
  loadMore()
}

function reset() {
  availableList.value = []
  myList.value = []
  page.value = 1
  finished.value = false
  loading.value = true
}

async function onReceive(coupon: CouponVO) {
  if (coupon.received) return
  receivingId.value = coupon.id
  try {
    await receiveCoupon(coupon.id)
    coupon.received = true
    showSuccessToast('领取成功')
  } catch (e: any) {
    showFailToast(e?.message || '领取失败')
  } finally {
    receivingId.value = null
  }
}
</script>

<style scoped lang="scss">
.coupon-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.list-wrap {
  padding: 12px;
}
</style>
