<template>
  <div class="map-picker-page">
    <AppHeader title="选择位置" show-back />

    <div class="search-bar">
      <van-search
        v-model="keyword"
        placeholder="搜索地点"
        shape="round"
        show-action
        @search="onSearch"
      >
        <template #action>
          <span class="action-text" @click="onSearch">搜索</span>
        </template>
      </van-search>
    </div>

    <!-- 地图占位 -->
    <div class="map-container" @click="onPickCenter">
      <div class="map-bg">
        <van-icon name="location-o" size="60" color="#FF6B35" />
        <p class="map-tip">点击地图选择位置</p>
      </div>
      <div class="center-marker">
        <van-icon name="location" size="36" color="#FF6B35" />
      </div>
    </div>

    <!-- 搜索结果列表 -->
    <div class="result-list">
      <div v-if="searching" class="loading">
        <van-loading type="spinner" color="#FF6B35" size="20" />
      </div>
      <template v-else>
        <van-cell
          v-for="(item, idx) in resultList"
          :key="idx"
          clickable
          @click="onSelect(item)"
        >
          <template #icon>
            <van-icon name="location-o" color="#FF6B35" />
          </template>
          <template #title>
            <div class="name ellipsis">{{ item.name }}</div>
            <div class="addr ellipsis">{{ item.address }}</div>
          </template>
        </van-cell>
        <EmptyState v-if="searched && resultList.length === 0" description="未找到相关地点" image="search" />
      </template>
    </div>

    <div class="bottom-bar">
      <van-button type="primary" round block :disabled="!selected" @click="onConfirm">
        确认位置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()

interface PoiItem {
  name: string
  address: string
  longitude: number
  latitude: number
}

const keyword = ref('')
const searching = ref(false)
const searched = ref(false)
const resultList = ref<PoiItem[]>([])
const selected = ref<PoiItem | null>(null)

async function onSearch() {
  if (!keyword.value.trim()) return
  searching.value = true
  searched.value = true
  // 模拟搜索结果
  setTimeout(() => {
    resultList.value = [
      {
        name: keyword.value + '（示例1）',
        address: '示例地址1，XX路XX号',
        longitude: 116.397428,
        latitude: 39.90923
      },
      {
        name: keyword.value + '（示例2）',
        address: '示例地址2，XX街XX号',
        longitude: 116.407428,
        latitude: 39.91923
      }
    ]
    searching.value = false
  }, 500)
}

function onPickCenter() {
  // 模拟点击地图中心点
  selected.value = {
    name: '地图中心位置',
    address: '点击地图所选位置',
    longitude: 116.397428,
    latitude: 39.90923
  }
}

function onSelect(item: PoiItem) {
  selected.value = item
}

function onConfirm() {
  if (!selected.value) return
  // 实际项目应通过 store 或路由参数传回
  showSuccessToast('已选择位置')
  setTimeout(() => router.back(), 500)
}
</script>

<style scoped lang="scss">
.map-picker-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}
.action-text {
  color: #ff6b35;
  font-size: 14px;
}
.map-container {
  position: relative;
  height: 40vh;
  background: linear-gradient(135deg, #e8f4ff, #f0f5ff);
  overflow: hidden;
  cursor: pointer;
  .map-bg {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    .map-tip {
      margin: 12px 0 0;
      font-size: 13px;
    }
  }
  .center-marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
  }
}
.result-list {
  flex: 1;
  background: #fff;
  overflow-y: auto;
  .loading {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
  .name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  .addr {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;
  .van-button {
    height: 44px;
  }
}
</style>
