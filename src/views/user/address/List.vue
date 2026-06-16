<template>
  <div class="address-list-page">
    <AppHeader title="地址管理" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="loadAddresses" class="list-wrap">
        <div v-for="addr in addresses" :key="addr.id" class="address-card">
          <div class="card-content" @click="onSelect(addr)">
            <div class="head">
              <span class="name">{{ addr.contactName }}</span>
              <span class="phone">{{ addr.contactPhone }}</span>
              <van-tag v-if="addr.isDefault === 1" type="primary" color="#FF6B35" round size="mini">
                默认
              </van-tag>
              <van-tag v-if="addr.tag" plain color="#FF6B35" text-color="#FF6B35" round size="mini">
                {{ addr.tag }}
              </van-tag>
            </div>
            <div class="detail">{{ addr.fullAddress || addr.detail }}</div>
          </div>
          <div class="card-footer">
            <van-checkbox
              :model-value="addr.isDefault === 1"
              @click.stop="onSetDefault(addr)"
            >设为默认</van-checkbox>
            <div class="actions">
              <span @click.stop="onEdit(addr)">
                <van-icon name="edit" /> 编辑
              </span>
              <span class="del" @click.stop="onDelete(addr)">
                <van-icon name="delete-o" /> 删除
              </span>
            </div>
          </div>
        </div>

        <EmptyState v-if="addresses.length === 0" description="暂无收货地址">
          <template #action>
            <van-button type="primary" round size="small" @click="onAdd">新增地址</van-button>
          </template>
        </EmptyState>
      </van-pull-refresh>

      <div class="bottom-bar">
        <van-button type="primary" round block icon="plus" @click="onAdd">新增地址</van-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  type AddressVO
} from '@/api/user/address.api'

const route = useRoute()
const router = useRouter()

const addresses = ref<AddressVO[]>([])
const loading = ref(true)
const refreshing = ref(false)

const selectMode = computed(() => route.query.from === 'checkout')

async function loadAddresses() {
  try {
    addresses.value = await getAddresses()
  } catch {
    // ignore
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function onAdd() {
  router.push('/user/address/edit')
}

function onEdit(addr: AddressVO) {
  router.push(`/user/address/edit/${addr.id}`)
}

async function onDelete(addr: AddressVO) {
  try {
    await showConfirmDialog({ title: '提示', message: '确定删除该地址吗？' })
    await deleteAddress(addr.id)
    showSuccessToast('已删除')
    loadAddresses()
  } catch {
    // 取消
  }
}

async function onSetDefault(addr: AddressVO) {
  if (addr.isDefault === 1) return
  try {
    await setDefaultAddress(addr.id)
    showSuccessToast('已设为默认')
    loadAddresses()
  } catch {
    showFailToast('操作失败')
  }
}

function onSelect(addr: AddressVO) {
  if (!selectMode.value) return
  // 通过 query 传回 checkout 页
  router.back()
}

onMounted(loadAddresses)
onActivated(loadAddresses)
</script>

<style scoped lang="scss">
.address-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.list-wrap {
  padding: 12px;
}
.address-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  .card-content {
    cursor: pointer;
  }
  .head {
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
    margin-top: 6px;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f5f5f5;
    .actions {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
      span {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }
      .del {
        color: #ee0a24;
      }
    }
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
