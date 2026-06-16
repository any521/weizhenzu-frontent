<template>
  <div class="admin-dashboard">
    <h2 class="page-title">数据大盘</h2>
    <el-row :gutter="16">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="36" :color="stat.color">
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

    <el-row :gutter="16" class="mt-16">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>近7日订单趋势</span>
          </template>
          <div ref="chartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>商家类目分布</span>
          </template>
          <div ref="pieRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-16">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待审核商家</span>
              <el-button type="primary" link @click="goAudit">去审核</el-button>
            </div>
          </template>
          <el-empty v-if="pendingMerchants === 0" description="暂无待审核" />
          <div v-else class="pending-info">有 {{ pendingMerchants }} 个商家待审核</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待处理退款</span>
              <el-button type="primary" link @click="goRefund">去处理</el-button>
            </div>
          </template>
          <el-empty v-if="pendingRefunds === 0" description="暂无待处理" />
          <div v-else class="pending-info">有 {{ pendingRefunds }} 笔退款待处理</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { User, Shop, Bicycle, ShoppingCart, Money } from '@element-plus/icons-vue'
import { getDashboard } from '@/api/admin/manage.api'

const router = useRouter()
const chartRef = ref<HTMLElement>()
const pieRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const stats = ref([
  { label: '注册用户', value: 0, icon: User, color: '#2196F3' },
  { label: '入驻商家', value: 0, icon: Shop, color: '#FF6B35' },
  { label: '在线骑手', value: 0, icon: Bicycle, color: '#4CAF50' },
  { label: '今日订单', value: 0, icon: ShoppingCart, color: '#FFC107' }
])
const pendingMerchants = ref(0)
const pendingRefunds = ref(0)

async function loadData() {
  try {
    const data = await getDashboard()
    stats.value[0].value = data.userCount
    stats.value[1].value = data.merchantCount
    stats.value[2].value = data.riderCount
    stats.value[3].value = data.todayOrderCount
    pendingMerchants.value = data.pendingMerchantCount
    pendingRefunds.value = data.pendingRefundCount
    initCharts(data)
  } catch {
    // ignore
  }
}

function initCharts(data: any) {
  nextTick(() => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['订单数', '收入(元)'] },
        xAxis: {
          type: 'category',
          data: data.weeklyStats?.map((s: any) => s.date) || []
        },
        yAxis: [
          { type: 'value', name: '订单数' },
          { type: 'value', name: '收入' }
        ],
        series: [
          {
            name: '订单数',
            type: 'bar',
            data: data.weeklyStats?.map((s: any) => s.orders) || [],
            itemStyle: { color: '#FF6B35' }
          },
          {
            name: '收入(元)',
            type: 'line',
            yAxisIndex: 1,
            data: data.weeklyStats?.map((s: any) => s.revenue) || [],
            itemStyle: { color: '#4CAF50' }
          }
        ]
      })
    }
    if (pieRef.value) {
      pieChart = echarts.init(pieRef.value)
      pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: data.categoryDistribution || []
          }
        ]
      })
    }
  })
}

function goAudit() {
  router.push('/admin/merchants/audit')
}
function goRefund() {
  router.push('/admin/refunds')
}

function onResize() {
  chart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  .info {
    .value {
      font-size: 24px;
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
.pending-info {
  padding: 20px 0;
  text-align: center;
  color: #ff6b35;
  font-size: 16px;
}
</style>
