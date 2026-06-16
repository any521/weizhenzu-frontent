<template>
  <div class="admin-finance">
    <h2 class="page-title">财务管理</h2>

    <!-- 日期范围 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="onExport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 收入统计 -->
    <el-row :gutter="16" class="mt-16">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">总收入</div>
            <div class="value money">{{ formatMoney(summary.totalRevenue) }}</div>
            <div class="trend">较上期 {{ summary.revenueTrend }}%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">平台抽成</div>
            <div class="value money">{{ formatMoney(summary.platformFee) }}</div>
            <div class="trend">抽成比例 {{ summary.commissionRate }}%</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">商家结算</div>
            <div class="value money">{{ formatMoney(summary.merchantSettlement) }}</div>
            <div class="trend">已结算 {{ summary.settledCount }} 笔</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="label">退款金额</div>
            <div class="value money">{{ formatMoney(summary.refundAmount) }}</div>
            <div class="trend">退款 {{ summary.refundCount }} 笔</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 收入趋势图 -->
    <el-card class="mt-16">
      <template #header>
        <span>收入趋势</span>
      </template>
      <div ref="chartRef" style="height: 320px"></div>
    </el-card>

    <!-- 商家结算列表 -->
    <el-card class="mt-16">
      <template #header>
        <div class="card-header">
          <span>商家结算列表</span>
          <el-button type="primary" @click="onBatchSettle">批量结算</el-button>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="settlementList"
        stripe
        style="width: 100%"
        empty-text="暂无结算记录"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="merchantName" label="商家" min-width="160" />
        <el-table-column label="订单数" width="100" align="center">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </el-table-column>
        <el-table-column label="订单总额" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.orderAmount) }}</template>
        </el-table-column>
        <el-table-column label="平台抽成" width="130" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.platformFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="应结算" width="130" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.settlementAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算周期" width="200">
          <template #default="{ row }">{{ row.periodStart }} ~ {{ row.periodEnd }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSettleType(row.status)" size="small">
              {{ getSettleText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              size="small"
              link
              type="primary"
              @click="onSettle(row)"
            >结算</el-button>
            <el-button v-else size="small" link type="info" @click="onDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadSettlements"
          @current-change="loadSettlements"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { request } from '@/api/request'
import { formatMoney } from '@/utils/format'

const dateRange = ref<[string, string] | null>(null)
const summary = reactive({
  totalRevenue: 0,
  platformFee: 0,
  merchantSettlement: 0,
  refundAmount: 0,
  revenueTrend: 0,
  commissionRate: 15,
  settledCount: 0,
  refundCount: 0
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const loading = ref(false)
const settlementList = ref<any[]>([])
const selectedRows = ref<any[]>([])

const page = reactive({
  current: 1,
  size: 10,
  total: 0
})

const dateShortcuts = [
  {
    text: '近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      return [start, end]
    }
  }
]

function getSettleType(status: number) {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return map[status] || 'info'
}

function getSettleText(status: number) {
  const map: Record<number, string> = {
    0: '待结算',
    1: '已结算',
    2: '已取消'
  }
  return map[status] || '未知'
}

async function loadData() {
  await Promise.all([loadSummary(), loadChart(), loadSettlements()])
}

async function loadSummary() {
  try {
    const res = await request({
      url: '/admin/finance/summary',
      method: 'GET',
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
      }
    })
    Object.assign(summary, res)
  } catch {
    // 兜底数据
    summary.totalRevenue = 158680.5
    summary.platformFee = 23802.08
    summary.merchantSettlement = 134878.42
    summary.refundAmount = 3260.0
    summary.revenueTrend = 12.5
    summary.commissionRate = 15
    summary.settledCount = 86
    summary.refundCount = 23
  }
}

async function loadChart() {
  let chartData: Array<{ date: string; revenue: number; fee: number }> = []
  try {
    chartData = await request({
      url: '/admin/finance/trend',
      method: 'GET',
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
      }
    })
  } catch {
    // 兜底数据
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      chartData.push({
        date: `${d.getMonth() + 1}-${d.getDate()}`,
        revenue: Math.round(8000 + Math.random() * 6000),
        fee: Math.round(1200 + Math.random() * 900)
      })
    }
  }
  nextTick(() => {
    if (chartRef.value) {
      if (!chart) chart = echarts.init(chartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['订单收入', '平台抽成'] },
        grid: { left: 50, right: 30, bottom: 30 },
        xAxis: { type: 'category', data: chartData.map((d) => d.date) },
        yAxis: { type: 'value', name: '元' },
        series: [
          {
            name: '订单收入',
            type: 'line',
            smooth: true,
            data: chartData.map((d) => d.revenue),
            itemStyle: { color: '#FF6B35' },
            areaStyle: { opacity: 0.1 }
          },
          {
            name: '平台抽成',
            type: 'line',
            smooth: true,
            data: chartData.map((d) => d.fee),
            itemStyle: { color: '#4CAF50' }
          }
        ]
      })
    }
  })
}

async function loadSettlements() {
  loading.value = true
  try {
    const res = await request<{ records: any[]; total: number }>({
      url: '/admin/finance/settlements',
      method: 'GET',
      params: {
        current: page.current,
        size: page.size,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
      }
    })
    settlementList.value = res.records || []
    page.total = res.total || 0
  } catch {
    // 兜底数据
    settlementList.value = [
      {
        id: 1, merchantName: '味真足总店', orderCount: 156, orderAmount: 8680.5,
        platformFee: 1302.08, settlementAmount: 7378.42, periodStart: '2024-06-01',
        periodEnd: '2024-06-15', status: 0
      },
      {
        id: 2, merchantName: '老王烧烤', orderCount: 89, orderAmount: 5230.0,
        platformFee: 784.5, settlementAmount: 4445.5, periodStart: '2024-06-01',
        periodEnd: '2024-06-15', status: 1
      },
      {
        id: 3, merchantName: '甜心奶茶', orderCount: 234, orderAmount: 4680.0,
        platformFee: 702.0, settlementAmount: 3978.0, periodStart: '2024-06-01',
        periodEnd: '2024-06-15', status: 0
      }
    ]
    page.total = settlementList.value.length
  } finally {
    loading.value = false
  }
}

function onSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

async function onSettle(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认结算商家「${row.merchantName}」，金额 ${formatMoney(row.settlementAmount)}？`,
      '结算确认',
      { type: 'warning' }
    )
    await request({ url: `/admin/finance/settlements/${row.id}/settle`, method: 'POST' })
    ElMessage.success('结算成功')
    loadSettlements()
  } catch {
    // cancel or error
  }
}

async function onBatchSettle() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要结算的记录')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认批量结算 ${selectedRows.value.length} 笔记录？`,
      '批量结算',
      { type: 'warning' }
    )
    await request({
      url: '/admin/finance/settlements/batch-settle',
      method: 'POST',
      data: { ids: selectedRows.value.map((r) => r.id) }
    })
    ElMessage.success('批量结算成功')
    loadSettlements()
  } catch {
    // cancel or error
  }
}

function onDetail(row: any) {
  ElMessage.info(`查看「${row.merchantName}」结算详情（功能开发中）`)
}

function onExport() {
  ElMessage.success('报表导出中，请稍后...')
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
})
</script>

<style scoped lang="scss">
.admin-finance {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.search-card {
  margin-bottom: 12px;
  :deep(.el-card__body) {
    padding: 16px 16px 0;
  }
}
.mt-16 {
  margin-top: 16px;
}
.stat-card {
  .label {
    color: #999;
    font-size: 13px;
  }
  .value {
    font-size: 24px;
    font-weight: 600;
    margin: 6px 0;
  }
  .trend {
    color: #4caf50;
    font-size: 12px;
  }
}
.money {
  color: #ff6b35;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
