<template>
  <div class="realtime-page">
    <div class="page-header">
      <h2 class="page-title">实时订单</h2>
      <div class="header-actions">
        <el-tag :type="autoRefresh ? 'success' : 'info'" size="large">
          {{ autoRefresh ? `自动刷新中（${countdown}s）` : '已暂停' }}
        </el-tag>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text=""
          @change="onToggleAuto"
        />
        <el-button type="primary" :icon="Refresh" @click="loadData">立即刷新</el-button>
      </div>
    </div>

    <!-- 统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="28" color="#FFC107"><Bell /></el-icon>
            <div class="info">
              <div class="value">{{ summary.pending }}</div>
              <div class="label">待接单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="28" color="#2196F3"><Food /></el-icon>
            <div class="info">
              <div class="value">{{ summary.cooking }}</div>
              <div class="label">备餐中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="28" color="#4CAF50"><Bicycle /></el-icon>
            <div class="info">
              <div class="value">{{ summary.delivering }}</div>
              <div class="label">配送中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="28" color="#FF6B35"><Money /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(summary.amount) }}</div>
              <div class="label">待处理金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单卡片列表 -->
    <div v-loading="loading" class="order-grid">
      <el-empty v-if="!loading && list.length === 0" description="暂无待处理订单" />
      <el-row v-else :gutter="16">
        <el-col v-for="order in list" :key="order.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="order-card" shadow="hover">
            <div class="card-header">
              <span class="order-no">{{ order.orderNo }}</span>
              <el-tag :type="getStatusType(order.status)" size="small">{{ order.statusDesc }}</el-tag>
            </div>
            <div class="customer">
              <el-icon><User /></el-icon>
              <span class="name">{{ order.userNickname }}</span>
              <span class="phone">{{ maskPhone(order.userPhone) }}</span>
            </div>
            <div class="address">
              <el-icon><Location /></el-icon>
              <span>{{ order.address?.detail }}</span>
            </div>
            <div class="items">
              <div v-for="item in order.items.slice(0, 2)" :key="item.id" class="item">
                <span class="dish-name">{{ item.dishName }}</span>
                <span class="qty">x{{ item.quantity }}</span>
              </div>
              <div v-if="order.items.length > 2" class="more">
                ...等{{ order.items.length }}件商品
              </div>
            </div>
            <div class="remark" v-if="order.remark">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ order.remark }}</span>
            </div>
            <div class="card-footer">
              <div class="time">
                <el-icon><Clock /></el-icon>
                <span>{{ fromNow(order.createdAt) }}</span>
              </div>
              <div class="amount">{{ formatMoney(order.payAmount) }}</div>
            </div>
            <div class="actions">
              <el-button
                v-if="order.status === ORDER_STATUS.PAID"
                type="success"
                size="small"
                :loading="actionId === order.id"
                @click="onAccept(order)"
              >接单</el-button>
              <el-button
                v-if="order.status === ORDER_STATUS.PAID"
                type="danger"
                size="small"
                plain
                @click="onReject(order)"
              >拒单</el-button>
              <el-button
                v-if="order.status === ORDER_STATUS.MERCHANT_ACCEPTED"
                type="warning"
                size="small"
                :loading="actionId === order.id"
                @click="onReady(order)"
              >完成备餐</el-button>
              <el-button size="small" @click="onDetail(order)">详情</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640px">
      <template v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentOrder.statusDesc }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ currentOrder.userNickname }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ maskPhone(currentOrder.userPhone) }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">{{ formatMoney(currentOrder.payAmount) }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address?.contactName }} {{ maskPhone(currentOrder.address?.contactPhone) }}
            {{ currentOrder.address?.detail }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
        <h4 class="section-title">商品明细</h4>
        <el-table :data="currentOrder.items" border size="small">
          <el-table-column prop="dishName" label="菜品" min-width="160" />
          <el-table-column prop="specName" label="规格" width="120" />
          <el-table-column label="单价" width="100" align="right">
            <template #default="{ row }">{{ formatMoney(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column label="小计" width="100" align="right">
            <template #default="{ row }">{{ formatMoney(row.subtotal) }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>

    <!-- 拒单弹窗 -->
    <el-dialog v-model="rejectVisible" title="拒单" width="460px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒单原因">
          <el-select v-model="rejectForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="商家繁忙，无法接单" value="商家繁忙，无法接单" />
            <el-option label="菜品售罄" value="菜品售罄" />
            <el-option label="地址超范围" value="地址超范围" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmReject">确认拒单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Bell, User, Location, Clock, WarningFilled, Money, Bicycle, Food
} from '@element-plus/icons-vue'
import {
  getRealtimeOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  markReady,
  type MerchantOrderVO
} from '@/api/merchant/order.api'
import { formatMoney, formatDate, maskPhone, fromNow } from '@/utils/format'
import { ORDER_STATUS } from '@/utils/constants'

const list = ref<MerchantOrderVO[]>([])
const loading = ref(false)
const autoRefresh = ref(true)
const countdown = ref(15)
let timer: number | null = null

const detailVisible = ref(false)
const currentOrder = ref<MerchantOrderVO | null>(null)

const rejectVisible = ref(false)
const rejectForm = reactive({ reason: '' })
const rejectOrderId = ref(0)
const actionLoading = ref(false)
const actionId = ref<number>(0)

const summary = computed(() => {
  const pending = list.value.filter(o => o.status === ORDER_STATUS.PAID).length
  const cooking = list.value.filter(o => o.status === ORDER_STATUS.MERCHANT_ACCEPTED).length
  const delivering = list.value.filter(
    o => o.status === ORDER_STATUS.DELIVERING || o.status === ORDER_STATUS.PICKED_UP
  ).length
  const amount = list.value.reduce((s, o) => s + (o.payAmount || 0), 0)
  return { pending, cooking, delivering, amount }
})

function getStatusType(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PAID]: 'warning',
    [ORDER_STATUS.MERCHANT_ACCEPTED]: 'primary',
    [ORDER_STATUS.DELIVERING]: 'primary'
  }
  return map[status] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getRealtimeOrders()
    countdown.value = 15
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function startTimer() {
  stopTimer()
  timer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      loadData()
    }
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function onToggleAuto(v: any) {
  if (v) {
    startTimer()
  } else {
    stopTimer()
  }
}

async function onAccept(order: MerchantOrderVO) {
  actionId.value = order.id
  try {
    await acceptOrder(order.id)
    ElMessage.success('接单成功')
    loadData()
  } catch {
    // ignore
  } finally {
    actionId.value = 0
  }
}

function onReject(order: MerchantOrderVO) {
  rejectOrderId.value = order.id
  rejectForm.reason = ''
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒单原因')
    return
  }
  actionLoading.value = true
  try {
    await rejectOrder(rejectOrderId.value, rejectForm.reason)
    ElMessage.success('已拒单')
    rejectVisible.value = false
    loadData()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
  }
}

async function onReady(order: MerchantOrderVO) {
  actionId.value = order.id
  try {
    await markReady(order.id)
    ElMessage.success('已标记完成备餐')
    loadData()
  } catch {
    // ignore
  } finally {
    actionId.value = 0
  }
}

async function onDetail(order: MerchantOrderVO) {
  try {
    currentOrder.value = await getOrderDetail(order.id)
    detailVisible.value = true
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadData()
  if (autoRefresh.value) startTimer()
})

onUnmounted(stopTimer)
</script>

<style scoped lang="scss">
.realtime-page {
  padding: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  .page-title {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  .info {
    .value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    .label {
      font-size: 12px;
      color: #999;
    }
  }
}
.order-grid {
  min-height: 200px;
}
.order-card {
  margin-bottom: 16px;
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .order-no {
      font-size: 13px;
      color: #666;
      font-weight: 600;
    }
  }
  .customer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 13px;
    .name {
      color: #333;
      font-weight: 500;
    }
    .phone {
      color: #999;
    }
  }
  .address {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }
  .items {
    background: #fafafa;
    padding: 8px 10px;
    border-radius: 4px;
    margin-bottom: 8px;
    .item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 2px 0;
      .dish-name {
        color: #333;
      }
      .qty {
        color: #999;
      }
    }
    .more {
      font-size: 12px;
      color: #999;
      text-align: right;
      margin-top: 2px;
    }
  }
  .remark {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    color: #ff6b35;
    font-size: 12px;
    margin-bottom: 8px;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-top: 1px dashed #eee;
    .time {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #999;
      font-size: 12px;
    }
    .amount {
      color: #ff6b35;
      font-weight: 600;
      font-size: 16px;
    }
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
}
.section-title {
  margin: 16px 0 8px;
  font-size: 14px;
  color: #333;
}
</style>
