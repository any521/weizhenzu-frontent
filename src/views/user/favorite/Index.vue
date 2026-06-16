<template>
  <div class="favorite-page">
    <AppHeader title="我的收藏" show-back />

    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="商家" name="merchant" />
      <van-tab title="菜品" name="dish" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="list-wrap">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <template v-if="activeTab === 'merchant'">
          <MerchantCard
            v-for="m in merchants"
            :key="m.id"
            :merchant="m"
            @click="goMerchant(m.id)"
          />
        </template>
        <template v-else>
          <DishCard
            v-for="d in dishes"
            :key="d.id"
            :dish="d"
            :show-add-btn="false"
            @click="goDish(d.id)"
          />
        </template>

        <EmptyState
          v-if="!loading && currentList.length === 0"
          :description="activeTab === 'merchant' ? '暂无收藏的商家' : '暂无收藏的菜品'"
          image="default"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import MerchantCard from '@/components/user/MerchantCard.vue'
import DishCard from '@/components/user/DishCard.vue'
import { getFavoriteMerchants, type MerchantVO } from '@/api/user/merchant.api'
import { getRecommendDishes, type DishVO } from '@/api/user/dish.api'

const router = useRouter()

const activeTab = ref<'merchant' | 'dish'>('merchant')
const merchants = ref<MerchantVO[]>([])
const dishes = ref<DishVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const currentList = computed(() =>
  activeTab.value === 'merchant' ? merchants.value : dishes.value
)

async function loadMore() {
  if (finished.value) return
  try {
    if (activeTab.value === 'merchant') {
      const res = await getFavoriteMerchants({ current: page.value, size: 10 })
      if (page.value === 1) merchants.value = res.records
      else merchants.value.push(...res.records)
      if (merchants.value.length >= res.total || res.records.length === 0) {
        finished.value = true
      } else {
        page.value++
      }
    } else {
      // 菜品收藏列表暂用推荐接口占位
      dishes.value = await getRecommendDishes()
      finished.value = true
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
  merchants.value = []
  dishes.value = []
  page.value = 1
  finished.value = false
  loading.value = true
}

function goMerchant(id: number) {
  router.push(`/user/merchant/${id}`)
}

function goDish(id: number) {
  router.push(`/user/dish/${id}`)
}
</script>

<style scoped lang="scss">
.favorite-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.list-wrap {
  padding: 12px;
}
</style>
