<template>
  <div class="home-page">
    <!-- 顶部位置 + 搜索 -->
    <div class="header">
      <div class="location" @click="chooseLocation">
        <van-icon name="location-o" />
        <span class="text ellipsis">{{ currentAddress }}</span>
        <van-icon name="arrow-down" />
      </div>
      <div class="search" @click="goSearch">
        <van-icon name="search" />
        <span>搜索商家、菜品</span>
      </div>
    </div>

    <!-- 分类入口 -->
    <div class="categories">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="cat-item"
        @click="goCategory(cat.id)"
      >
        <van-icon :name="cat.icon || 'shop-o'" size="28" color="#FF6B35" />
        <span>{{ cat.name }}</span>
      </div>
    </div>

    <!-- 推荐商家 -->
    <div class="section">
      <div class="section-title">
        <span>附近商家</span>
        <van-icon name="arrow" size="12" />
      </div>
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
      </van-list>
      <EmptyState v-if="!loading && merchants.length === 0" description="附近暂无商家" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMerchants, getMerchantCategories, type MerchantVO, type MerchantCategoryVO } from '@/api/user/merchant.api'
import MerchantCard from '@/components/user/MerchantCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { localStore } from '@/utils/storage'

const router = useRouter()

const currentAddress = ref('点击选择地址')
const categories = ref<MerchantCategoryVO[]>([])
const merchants = ref<MerchantVO[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

async function loadCategories() {
  try {
    categories.value = await getMerchantCategories()
    if (categories.value.length === 0) {
      // 默认分类
      categories.value = [
        { id: 1, name: '美食', icon: 'shop-o' },
        { id: 2, name: '甜品', icon: 'gift-o' },
        { id: 3, name: '饮品', icon: 'coffee-o' },
        { id: 4, name: '超市', icon: 'shopping-cart-o' },
        { id: 5, name: '鲜花', icon: 'flower-o' },
        { id: 6, name: '药品', icon: 'medel-o' },
        { id: 7, name: '跑腿', icon: 'logistics' },
        { id: 8, name: '更多', icon: 'apps-o' }
      ]
    }
  } catch {
    // ignore
  }
}

async function loadMore() {
  if (finished.value) return
  try {
    const res = await getMerchants({
      current: page.value,
      size: 10
    })
    if (page.value === 1) {
      merchants.value = res.records
    } else {
      merchants.value.push(...res.records)
    }
    if (merchants.value.length >= res.total || res.records.length === 0) {
      finished.value = true
    } else {
      page.value++
    }
  } catch {
    finished.value = true
  } finally {
    loading.value = false
  }
}

function chooseLocation() {
  router.push('/user/address')
}

function goSearch() {
  router.push('/user/search')
}

function goCategory(id: number) {
  router.push({ path: '/user/search/result', query: { categoryId: id } })
}

function goMerchant(id: number) {
  router.push(`/user/merchant/${id}`)
}

onMounted(() => {
  const loc = localStore.get<{ address: string }>('location')
  if (loc?.address) currentAddress.value = loc.address
  loadCategories()
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.header {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  padding: 12px 16px 16px;
  color: #fff;
  .location {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
    .text {
      max-width: 200px;
    }
  }
  .search {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border-radius: 20px;
    padding: 8px 16px;
    color: #999;
    font-size: 13px;
  }
}
.categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 0;
  padding: 16px;
  background: #fff;
  margin-bottom: 10px;
  .cat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    span {
      font-size: 12px;
      color: #333;
    }
  }
}
.section {
  padding: 12px;
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    span {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
}
</style>
