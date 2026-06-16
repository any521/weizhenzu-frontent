<template>
  <div class="orders-page">
    <AppHeader title="我的订单" show-back />
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
        <OrderCard
          v-for="order in list"
          :key="order.id"
          :order="order"
          :actions="getActions(order)"
          @click="goDetail(order.id)"
        />
        <EmptyState v-if="!loading && list.length === 0" description="暂无订单" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import OrderCard from '@/components/user/OrderCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getMyOrders, type OrderListItemVO } from '@/api/user/order.api'
import { ORDER_STATUS } from '@/utils/constants'

const router = useRouter()

const tabs = [
  { label: '全部', value: -1 },
  { label: '待支付', value: ORDER_STATUS.PENDING_PAY },
  { label: '待接单', value: ORDER_STATUS.PAID },
  { label: '配送中', value: ORDER_STATUS.DELIVERING },
  { label: '已完成', value: ORDER_STATUS.COMPLETED }
]

const activeTab = ref(-1)
const list = ref<OrderListItemVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

async function loadMore() {
  if (finished.value) return
  try {
    const res = await getMyOrders({
      current: page.value,
      size: 10,
      status: activeTab.value === -1 ? undefined : activeTab.value
    })
    if (page.value === 1) list.value = res.records
    else list.value.push(...res.records)
    if (list.value.length >= res.total || res.records.length === 0) {
      finished.value = true
    } else {
      page.value++
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onTabChange() {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = true
  loadMore()
}

function onRefresh() {
  page.value = 1
  finished.value = false
  loadMore()
}

function goDetail(id: number) {
  router.push(`/user/order/${id}`)
}

function getActions(order: OrderListItemVO) {
  const actions: any[] = []
  if (order.status === ORDER_STATUS.PENDING_PAY) {
    actions.push({
      text: '去支付',
      type: 'primary',
      onClick: () => router.push(`/user/payment/${order.id}`)
    })
    actions.push({
      text: '取消',
      type: 'default',
      plain: true,
      onClick: () => router.push(`/user/order/${order.id}`)
    })
  } else if (order.status === ORDER_STATUS.DELIVERED) {
    actions.push({
      text: '确认收货',
      type: 'primary',
      onClick: () => router.push(`/user/order/${order.id}`)
    })
  } else if (order.status === ORDER_STATUS.COMPLETED) {
    actions.push({
      text: '评价',
      type: 'primary',
      onClick: () => router.push(`/user/order/${order.id}/rating`)
    })
    actions.push({
      text: '再来一单',
      type: 'default',
      plain: true,
      onClick: () => router.push(`/user/merchant/${order.merchantId}`)
    })
  } else if (order.status === ORDER_STATUS.PAID || order.status === ORDER_STATUS.MERCHANT_ACCEPTED) {
    actions.push({
      text: '申请退款',
      type: 'default',
      plain: true,
      onClick: () => router.push(`/user/order/${order.id}/refund`)
    })
  }
  return actions
}
</script>

<style scoped lang="scss">
.orders-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.list-wrap {
  padding: 12px;
}
</style>
