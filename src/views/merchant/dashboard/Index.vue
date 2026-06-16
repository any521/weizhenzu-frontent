<template>
  <div class="merchant-dashboard">
    <h2 class="page-title">工作台</h2>
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" :color="stat.color">
              <component :is="stat.icon" />
            </el-icon>
            <div class="info">
              <div class="value">{{ stat.value }}</div>
              <div class="label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-16">
      <template #header>
        <div class="card-header">
          <span>待处理订单</span>
          <el-button type="primary" link @click="goRealtime">查看全部</el-button>
        </div>
      </template>
      <el-table :data="pendingOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userNickname" label="客户" />
        <el-table-column prop="payAmount" label="金额">
          <template #default="{ row }">¥{{ row.payAmount }}</template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="状态" />
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="acceptOrder(row.id)">接单</el-button>
            <el-button size="small" @click="goOrderDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Money, Timer, User } from '@element-plus/icons-vue'
import { getRealtimeOrders, acceptOrder, type MerchantOrderVO } from '@/api/merchant/order.api'

const router = useRouter()

const stats = ref([
  { label: '今日订单', value: 0, icon: ShoppingCart, color: '#FF6B35' },
  { label: '今日收入', value: '¥0', icon: Money, color: '#4CAF50' },
  { label: '待处理', value: 0, icon: Timer, color: '#FFC107' },
  { label: '今日新客', value: 0, icon: User, color: '#2196F3' }
])

const pendingOrders = ref<MerchantOrderVO[]>([])

async function loadData() {
  try {
    const orders = await getRealtimeOrders()
    pendingOrders.value = orders.slice(0, 5)
    stats.value[0].value = orders.length
    stats.value[2].value = orders.filter(o => o.status === 1).length
    stats.value[1].value = `¥${orders.reduce((s, o) => s + (o.payAmount || 0), 0).toFixed(2)}`
  } catch {
    // ignore
  }
}

async function acceptOrder(id: number) {
  try {
    await acceptOrder(id)
    ElMessage.success('接单成功')
    loadData()
  } catch {
    // ignore
  }
}

function goRealtime() {
  router.push('/merchant/orders/realtime')
}

function goOrderDetail(id: number) {
  router.push(`/merchant/orders?id=${id}`)
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.merchant-dashboard {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  .info {
    .value {
      font-size: 22px;
      font-weight: 600;
      color: #333;
    }
    .label {
      font-size: 13px;
      color: #999;
    }
  }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mt-16 {
  margin-top: 16px;
}
</style>
