<template>
  <div class="stats-page">
    <h2 class="page-title">销售统计</h2>

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
          />
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button @click="setQuickRange(7)">近7天</el-button>
            <el-button @click="setQuickRange(30)">近30天</el-button>
            <el-button @click="setQuickRange(90)">近90天</el-button>
          </el-button-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 概览统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#FF6B35"><Money /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(stats?.totalAmount) }}</div>
              <div class="label">销售总额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#2196F3"><ShoppingCart /></el-icon>
            <div class="info">
              <div class="value">{{ stats?.totalOrders || 0 }}</div>
              <div class="label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#4CAF50"><TrendCharts /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(stats?.avgOrderAmount) }}</div>
              <div class="label">客单价</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#FFC107"><Star /></el-icon>
            <div class="info">
              <div class="value">{{ topDishSales }}</div>
              <div class="label">热销榜首销量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售额趋势</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button value="amount">销售额</el-radio-button>
                <el-radio-button value="orders">订单数</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <template #header><span>销售额占比</span></template>
          <div ref="pieChartRef" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销菜品排行 -->
    <el-card shadow="never" class="rank-card">
      <template #header><span>热销菜品排行 TOP 10</span></template>
      <el-table v-loading="loading" :data="topDishes" stripe empty-text="暂无数据">
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ $index }">
            <div class="rank" :class="{ top: $index < 3 }">{{ $index + 1 }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="dishName" label="菜品名称" min-width="180" />
        <el-table-column label="销量" width="120" align="right">
          <template #default="{ row }">
            <span class="sales">{{ row.sales }}</span> 份
          </template>
        </el-table-column>
        <el-table-column label="销售额" width="140" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售占比" min-width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="getPercent(row.sales)"
              :color="'#FF6B35'"
              :stroke-width="14"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Money, ShoppingCart, TrendCharts, Star } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getSalesStats } from '@/api/merchant/order.api'
import { formatMoney } from '@/utils/format'
import dayjs from 'dayjs'

interface SalesStats {
  totalOrders: number
  totalAmount: number
  avgOrderAmount: number
  dailyStats: Array<{ date: string; orders: number; amount: number }>
  topDishes: Array<{ dishId: number; dishName: string; sales: number; amount: number }>
}

const loading = ref(false)
const dateRange = ref<[string, string] | null>(null)
const chartType = ref<'amount' | 'orders'>('amount')
const stats = ref<SalesStats | null>(null)

const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const topDishes = computed(() => stats.value?.topDishes || [])
const topDishSales = computed(() => topDishes.value[0]?.sales || 0)

function setQuickRange(days: number) {
  const end = dayjs().format('YYYY-MM-DD')
  const start = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
  dateRange.value = [start, end]
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const [startDate, endDate] = dateRange.value || []
    stats.value = await getSalesStats({ startDate, endDate })
    await nextTick()
    renderTrendChart()
    renderPieChart()
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function getPercent(sales: number) {
  const total = topDishes.value.reduce((s, d) => s + d.sales, 0)
  return total ? Math.round((sales / total) * 100) : 0
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  const daily = stats.value?.dailyStats || []
  const dates = daily.map((d) => dayjs(d.date).format('MM-DD'))
  const values = daily.map((d) => (chartType.value === 'amount' ? d.amount : d.orders))
  const isAmount = chartType.value === 'amount'
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue}<br/>${p.marker}${p.seriesName}: ${
          isAmount ? formatMoney(p.value) : p.value
        }`
      }
    },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#ddd' } } },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => (isAmount ? `¥${v}` : `${v}`)
      }
    },
    series: [
      {
        name: isAmount ? '销售额' : '订单数',
        type: 'line',
        smooth: true,
        data: values,
        itemStyle: { color: '#FF6B35' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,53,0.3)' },
            { offset: 1, color: 'rgba(255,107,53,0.02)' }
          ])
        }
      }
    ]
  })
  trendChart.resize()
}

function renderPieChart() {
  if (!pieChartRef.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }
  const data = (stats.value?.topDishes || []).slice(0, 6).map((d) => ({
    name: d.dishName,
    value: d.amount
  }))
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        data,
        label: { show: false },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        color: ['#FF6B35', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#607D8B']
      }
    ]
  })
  pieChart.resize()
}

function onResize() {
  trendChart?.resize()
  pieChart?.resize()
}

watch(chartType, () => renderTrendChart())

onMounted(() => {
  setQuickRange(7)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped lang="scss">
.stats-page {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.search-card {
  margin-bottom: 16px;
  :deep(.el-card__body) {
    padding: 16px 16px 0;
  }
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
.chart-row {
  margin-bottom: 16px;
}
.chart {
  height: 320px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rank-card {
  .rank {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f0f0f0;
    color: #666;
    font-weight: 600;
    &.top {
      background: #ff6b35;
      color: #fff;
    }
  }
  .sales {
    color: #ff6b35;
    font-weight: 600;
  }
  .money {
    color: #333;
    font-weight: 600;
  }
}
</style>
