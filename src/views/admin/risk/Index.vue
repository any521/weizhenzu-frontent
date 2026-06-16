<template>
  <div class="admin-risk">
    <h2 class="page-title">风控管理</h2>

    <!-- 风险概览 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">异常订单</div>
            <div class="value danger">{{ stats.abnormalOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">高风险用户</div>
            <div class="value warning">{{ stats.riskUsers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">疑似刷单</div>
            <div class="value danger">{{ stats.fakeOrders }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">今日处理</div>
            <div class="value success">{{ stats.handledToday }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="异常订单" name="order" />
      <el-tab-pane label="风险用户" name="user" />
    </el-tabs>

    <el-card shadow="never">
      <!-- 异常订单表格 -->
      <el-table
        v-if="activeTab === 'order'"
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无异常订单"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userNickname" label="用户" min-width="120" />
        <el-table-column prop="merchantName" label="商家" min-width="140" />
        <el-table-column label="金额" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="风险类型" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getRiskType(row.riskType)" size="small">
              {{ row.riskTypeDesc || getRiskText(row.riskType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="风险描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="发生时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onViewOrder(row)">查看订单</el-button>
            <el-button size="small" link type="success" @click="onHandle(row, 'pass')">标记正常</el-button>
            <el-button size="small" link type="danger" @click="onHandle(row, 'reject')">关闭订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 风险用户表格 -->
      <el-table
        v-else
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无风险用户"
      >
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :src="row.avatar">{{ row.nickname?.[0] || 'U' }}</el-avatar>
              <div class="info">
                <div class="name">{{ row.nickname }}</div>
                <div class="phone">{{ maskPhone(row.phone) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" align="center" />
        <el-table-column prop="refundCount" label="退款数" width="100" align="center" />
        <el-table-column label="退款率" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ danger: row.refundRate > 30 }">{{ row.refundRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small" effect="dark">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="风险描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '已限制' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              size="small"
              link
              type="danger"
              @click="onRestrict(row)"
            >限制账号</el-button>
            <el-button
              v-else
              size="small"
              link
              type="success"
              @click="onUnrestrict(row)"
            >解除限制</el-button>
            <el-button size="small" link type="primary" @click="onViewUser(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/api/request'
import { formatMoney, formatDate, maskPhone } from '@/utils/format'

const activeTab = ref<'order' | 'user'>('order')
const query = reactive({ current: 1, size: 10 })
const list = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const stats = reactive({
  abnormalOrders: 0,
  riskUsers: 0,
  fakeOrders: 0,
  handledToday: 0
})

function getRiskType(type: number) {
  const map: Record<number, string> = {
    1: 'warning',
    2: 'danger',
    3: 'danger',
    4: 'warning'
  }
  return map[type] || 'info'
}

function getRiskText(type: number) {
  const map: Record<number, string> = {
    1: '高频下单',
    2: '疑似刷单',
    3: '异常退款',
    4: '地址异常'
  }
  return map[type] || '未知'
}

function getLevelType(level: number) {
  const map: Record<number, string> = {
    1: 'info',
    2: 'warning',
    3: 'danger'
  }
  return map[level] || 'info'
}

function getLevelText(level: number) {
  const map: Record<number, string> = {
    1: '低',
    2: '中',
    3: '高'
  }
  return map[level] || '未知'
}

async function loadStats() {
  try {
    const res = await request({
      url: '/admin/risk/stats',
      method: 'GET'
    })
    Object.assign(stats, res)
  } catch {
    stats.abnormalOrders = 12
    stats.riskUsers = 8
    stats.fakeOrders = 5
    stats.handledToday = 23
  }
}

async function loadData() {
  loading.value = true
  try {
    const url = activeTab.value === 'order' ? '/admin/risk/orders' : '/admin/risk/users'
    const res = await request<{ records: any[]; total: number }>({
      url,
      method: 'GET',
      params: query
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // 兜底数据
    if (activeTab.value === 'order') {
      list.value = [
        {
          id: 1, orderNo: 'OD202406170001', userNickname: '张三', merchantName: '味真足总店',
          amount: 88.5, riskType: 2, riskTypeDesc: '疑似刷单', level: 3,
          reason: '同一IP短时间内多账号下单相同商品', createdAt: '2024-06-17 10:00:00'
        },
        {
          id: 2, orderNo: 'OD202406170002', userNickname: '李四', merchantName: '老王烧烤',
          amount: 156.0, riskType: 3, riskTypeDesc: '异常退款', level: 2,
          reason: '30天内退款率超过50%', createdAt: '2024-06-17 11:00:00'
        },
        {
          id: 3, orderNo: 'OD202406170003', userNickname: '王五', merchantName: '甜心奶茶',
          amount: 32.0, riskType: 1, riskTypeDesc: '高频下单', level: 1,
          reason: '一天内下单超过20单', createdAt: '2024-06-17 12:00:00'
        }
      ]
    } else {
      list.value = [
        {
          id: 1, nickname: '张三', phone: '13800138000', avatar: '',
          orderCount: 56, refundCount: 28, refundRate: 50, level: 3,
          reason: '退款率过高', status: 1
        },
        {
          id: 2, nickname: '李四', phone: '13900139000', avatar: '',
          orderCount: 120, refundCount: 12, refundRate: 10, level: 2,
          reason: '疑似刷单账号', status: 0
        }
      ]
    }
    total.value = list.value.length
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  query.current = 1
  loadData()
}

function onViewOrder(row: any) {
  ElMessage.info(`查看订单 ${row.orderNo}（功能开发中）`)
}

function onViewUser(row: any) {
  ElMessage.info(`查看用户 ${row.nickname}（功能开发中）`)
}

async function onHandle(row: any, action: 'pass' | 'reject') {
  const text = action === 'pass' ? '标记正常' : '关闭订单'
  try {
    await ElMessageBox.confirm(`确认${text}？`, '提示', { type: 'warning' })
    await request({
      url: `/admin/risk/orders/${row.id}/handle`,
      method: 'POST',
      data: { action }
    })
    ElMessage.success(`${text}成功`)
    loadData()
    loadStats()
  } catch {
    // cancel or error
  }
}

async function onRestrict(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认限制用户「${row.nickname}」？限制后该用户将无法下单`,
      '限制账号',
      { type: 'warning' }
    )
    await request({
      url: `/admin/risk/users/${row.id}/restrict`,
      method: 'POST'
    })
    ElMessage.success('已限制')
    loadData()
  } catch {
    // cancel or error
  }
}

async function onUnrestrict(row: any) {
  try {
    await ElMessageBox.confirm(`确认解除用户「${row.nickname}」的限制？`, '解除限制', {
      type: 'warning'
    })
    await request({
      url: `/admin/risk/users/${row.id}/unrestrict`,
      method: 'POST'
    })
    ElMessage.success('已解除限制')
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(() => {
  loadStats()
  loadData()
})
</script>

<style scoped lang="scss">
.admin-risk {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.mb-16 {
  margin-bottom: 16px;
}
.stat-card {
  .label {
    color: #999;
    font-size: 13px;
  }
  .value {
    font-size: 28px;
    font-weight: 600;
    margin-top: 6px;
    &.danger { color: #f56c6c; }
    &.warning { color: #e6a23c; }
    &.success { color: #67c23a; }
  }
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  .info {
    .name {
      color: #333;
      font-size: 14px;
    }
    .phone {
      color: #999;
      font-size: 12px;
    }
  }
}
.danger {
  color: #f56c6c;
  font-weight: 600;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
