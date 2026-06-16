<template>
  <div class="result-page">
    <AppHeader title="搜索结果" show-back />

    <van-search
      v-model="keyword"
      placeholder="搜索商家、菜品"
      shape="round"
      show-action
      @search="onSearch"
    >
      <template #action>
        <span class="action-text" @click="onSearch">搜索</span>
      </template>
    </van-search>

    <van-tabs v-model:active="activeCategoryId" sticky @change="onCategoryChange">
      <van-tab :name="0" title="全部" />
      <van-tab
        v-for="cat in categories"
        :key="cat.id"
        :name="cat.id"
        :title="cat.name"
      />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="list-wrap">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <MerchantCard
          v-for="m in merchants"
          :key="m.id"
          :merchant="m"
          @click="goMerchant(m.id)"
        />
        <EmptyState v-if="!loading && merchants.length === 0" description="暂无商家" image="search" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import MerchantCard from '@/components/user/MerchantCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getMerchants,
  getMerchantCategories,
  type MerchantVO,
  type MerchantCategoryVO
} from '@/api/user/merchant.api'

const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
const activeCategoryId = ref<number>(Number(route.query.categoryId) || 0)
const categories = ref<MerchantCategoryVO[]>([])
const merchants = ref<MerchantVO[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

async function loadCategories() {
  try {
    categories.value = await getMerchantCategories()
  } catch {
    // ignore
  }
}

async function loadMore() {
  if (finished.value) return
  try {
    const res = await getMerchants({
      current: page.value,
      size: 10,
      categoryId: activeCategoryId.value === 0 ? undefined : activeCategoryId.value
    })
    if (page.value === 1) merchants.value = res.records
    else merchants.value.push(...res.records)
    if (merchants.value.length >= res.total || res.records.length === 0) {
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

function onSearch() {
  reset()
  loadMore()
}

function onCategoryChange() {
  reset()
  loadMore()
}

function onRefresh() {
  reset()
  loadMore()
}

function reset() {
  merchants.value = []
  page.value = 1
  finished.value = false
  loading.value = true
}

function goMerchant(id: number) {
  router.push(`/user/merchant/${id}`)
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.action-text {
  color: #ff6b35;
  font-size: 14px;
}
.list-wrap {
  padding: 12px;
}
</style>
