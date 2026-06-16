<template>
  <div class="search-page">
    <AppHeader title="搜索" show-back>
      <template #left>
        <van-icon name="arrow-left" size="18" @click="$router.back()" />
      </template>
    </AppHeader>

    <div class="search-bar">
      <van-search
        v-model="keyword"
        placeholder="搜索商家、菜品"
        show-action
        shape="round"
        autofocus
        @search="onSearch"
      >
        <template #action>
          <span class="action-text" @click="onSearch">搜索</span>
        </template>
      </van-search>
    </div>

    <div v-if="!searched" class="content">
      <div v-if="historyList.length" class="section">
        <div class="section-head">
          <span class="title">历史搜索</span>
          <van-icon name="delete-o" @click="clearHistory" />
        </div>
        <div class="tag-wrap">
          <van-tag
            v-for="(h, idx) in historyList"
            :key="idx"
            plain
            round
            color="#FF6B35"
            text-color="#FF6B35"
            size="medium"
            @click="onTagClick(h)"
          >{{ h }}</van-tag>
        </div>
      </div>

      <div class="section">
        <div class="section-head">
          <span class="title">热门搜索</span>
        </div>
        <div class="tag-wrap">
          <van-tag
            v-for="(h, idx) in hotList"
            :key="idx"
            :plain="idx !== 0"
            round
            :color="idx === 0 ? '#FF6B35' : '#fff5ed'"
            :text-color="idx === 0 ? '#fff' : '#FF6B35'"
            size="medium"
            @click="onTagClick(h)"
          >{{ h }}</van-tag>
        </div>
      </div>
    </div>

    <div v-else class="result-wrap">
      <van-empty v-if="!loading && merchants.length === 0" description="暂无搜索结果" />
      <van-list
        v-else
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import MerchantCard from '@/components/user/MerchantCard.vue'
import { searchMerchants, type MerchantVO } from '@/api/user/merchant.api'
import { localStore } from '@/utils/storage'

const router = useRouter()

const HISTORY_KEY = 'search-history'

const keyword = ref('')
const searched = ref(false)
const merchants = ref<MerchantVO[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const historyList = ref<string[]>(localStore.get<string[]>(HISTORY_KEY) || [])
const hotList = ref<string[]>(['麻辣烫', '奶茶', '炸鸡', '汉堡', '咖啡', '盖饭', '寿司', '沙拉'])

function saveHistory(kw: string) {
  if (!kw) return
  const list = historyList.value.filter(h => h !== kw)
  list.unshift(kw)
  historyList.value = list.slice(0, 10)
  localStore.set(HISTORY_KEY, historyList.value)
}

function onSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  saveHistory(kw)
  searched.value = true
  merchants.value = []
  page.value = 1
  finished.value = false
  loading.value = true
  loadMore()
}

function onTagClick(kw: string) {
  keyword.value = kw
  onSearch()
}

async function clearHistory() {
  try {
    await showConfirmDialog({ title: '提示', message: '确定清空搜索历史吗？' })
    historyList.value = []
    localStore.remove(HISTORY_KEY)
  } catch {
    // 取消
  }
}

async function loadMore() {
  if (finished.value) return
  try {
    const res = await searchMerchants(keyword.value.trim(), undefined, undefined)
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
  }
}

function goMerchant(id: number) {
  router.push(`/user/merchant/${id}`)
}
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.search-bar {
  background: #fff;
  .action-text {
    color: #ff6b35;
    font-size: 14px;
  }
}
.content {
  padding: 16px;
}
.section {
  margin-bottom: 24px;
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }
  .tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
.result-wrap {
  padding: 12px;
}
</style>
