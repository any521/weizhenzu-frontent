<template>
  <div class="message-page">
    <AppHeader title="消息中心" show-back />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="list-wrap">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <van-swipe-cell v-for="msg in list" :key="msg.id">
          <div class="msg-card" :class="{ unread: !msg.read }" @click="onRead(msg)">
            <div class="icon-wrap" :class="msg.type">
              <van-icon :name="iconMap[msg.type] || 'bell'" />
            </div>
            <div class="content">
              <div class="head">
                <span class="title">{{ msg.title }}</span>
                <span class="time">{{ fromNow(msg.createdAt) }}</span>
              </div>
              <p class="text ellipsis-2">{{ msg.content }}</p>
            </div>
            <van-icon v-if="!msg.read" name="circle" color="#FF6B35" size="8" class="dot" />
          </div>
          <template #right>
            <van-button square type="danger" text="删除" class="del-btn" @click="onDelete(msg)" />
          </template>
        </van-swipe-cell>

        <EmptyState v-if="!loading && list.length === 0" description="暂无消息" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { fromNow } from '@/utils/format'

interface Message {
  id: number
  type: 'order' | 'promo' | 'system' | 'refund'
  title: string
  content: string
  read: boolean
  createdAt: string
}

const iconMap: Record<string, string> = {
  order: 'orders-o',
  promo: 'gift-o',
  system: 'info-o',
  refund: 'refund-o'
}

const list = ref<Message[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

async function loadMore() {
  if (finished.value) return
  try {
    // 模拟消息数据
    const mock: Message[] = [
      {
        id: 1,
        type: 'order',
        title: '订单已接单',
        content: '您的订单商家已接单，正在准备中，请耐心等待',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'promo',
        title: '优惠券到账',
        content: '您领取的满50减10优惠券已到账，快去使用吧～',
        read: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'system',
        title: '系统通知',
        content: '味真足APP已更新至最新版本，体验更多新功能',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    if (page.value === 1) list.value = mock
    finished.value = true
  } catch {
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  page.value = 1
  finished.value = false
  loadMore()
}

function onRead(msg: Message) {
  msg.read = true
}

async function onDelete(msg: Message) {
  try {
    await showConfirmDialog({ title: '提示', message: '确定删除该消息吗？' })
    list.value = list.value.filter(m => m.id !== msg.id)
    showSuccessToast('已删除')
  } catch {
    // 取消
  }
}
</script>

<style scoped lang="scss">
.message-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.list-wrap {
  padding: 12px;
}
.msg-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  position: relative;
  cursor: pointer;
  &.unread {
    .title {
      font-weight: 600;
    }
  }
  .icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: #ff6b35;
    flex-shrink: 0;
    &.order {
      background: #1890ff;
    }
    &.promo {
      background: #ff6b35;
    }
    &.system {
      background: #999;
    }
    &.refund {
      background: #ee0a24;
    }
  }
  .content {
    flex: 1;
    min-width: 0;
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      .title {
        font-size: 14px;
        color: #333;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .time {
        font-size: 11px;
        color: #999;
        flex-shrink: 0;
      }
    }
    .text {
      margin: 4px 0 0;
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }
  }
  .dot {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
.del-btn {
  height: 100%;
}
</style>
