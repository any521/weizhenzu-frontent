<template>
  <div class="finance-page">
    <h2 class="page-title">财务对账</h2>

    <!-- 日期选择 -->
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
            <el-button @click="setQuickRange(1)">今日</el-button>
            <el-button @click="setQuickRange(7)">近7天</el-button>
            <el-button @click="setQuickRange(30)">近30天</el-button>
            <el-button @click="setQuickRange(90)">近90天</el-button>
          </el-button-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button :icon="Download" @click="onExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 收入统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#FF6B35"><Money /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(summary.totalAmount) }}</div>
              <div class="label">营业总额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#4CAF50"><Wallet /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(summary.income) }}</div>
              <div class="label">实际收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#2196F3"><ShoppingCart /></el-icon>
            <div class="info">
              <div class="value">{{ summary.orderCount }}</div>
              <div class="label">订单数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="32" color="#FFC107"><TrendCharts /></el-icon>
            <div class="info">
              <div class="value">{{ formatMoney(summary.avgAmount) }}</div>
              <div class="label">客单价</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 收支明细 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="mini-stat">
            <div class="label">优惠减免</div>
            <div class="value discount">-{{ formatMoney(summary.discountAmount) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="mini-stat">
            <div class="label">退款金额</div>
            <div class="value refund">-{{ formatMoney(summary.refundAmount) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单明细 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>订单明细</span>
          <el-radio-group v-model="orderStatus" size="small" @change="loadData">
            <el-radio-button :value="-1">全部</el-radio-button>
            <el-radio-button :value="7">已完成</el-radio-button>
            <el-radio-button :value="10">已退款</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无订单数据"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userNickname" label="客户" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 7 ? 'success' : 'info'" size="small">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商品总额" width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column label="优惠" width="100" align="right">
          <template #default="{ row }">
            <span class="discount">-{{ formatMoney(row.couponAmount, false) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实付" width="120" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.payAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Money, Wallet, ShoppingCart, TrendCharts } from '@element-plus/icons-vue'
import { getOrders, type MerchantOrderVO } from '@/api/merchant/order.api'
import { formatMoney, formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const dateRange = ref<[string, string] | null>(null)
const orderStatus = ref(-1)

const list = ref<MerchantOrderVO[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  current: 1,
  size: 20
})

const summary = computed(() => {
  const completed = list.value.filter((o) => o.status === 7)
  const refunded = list.value.filter((o) => o.status === 10)
  const totalAmount = completed.reduce((s, o) => s + (o.totalAmount || 0), 0)
  const income = completed.reduce((s, o) => s + (o.payAmount || 0), 0)
  const discountAmount = completed.reduce((s, o) => s + (o.couponAmount || 0), 0)
  const refundAmount = refunded.reduce((s, o) => s + (o.payAmount || 0), 0)
  const orderCount = completed.length
  const avgAmount = orderCount ? income / orderCount : 0
  return { totalAmount, income, orderCount, avgAmount, discountAmount, refundAmount }
})

function setQuickRange(days: number) {
  const end = dayjs().format('YYYY-MM-DD')
  const start = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
  dateRange.value = [start, end]
  query.current = 1
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const [startDate, endDate] = dateRange.value || []
    const res = await getOrders({
      current: query.current,
      size: query.size,
      status: orderStatus.value === -1 ? undefined : orderStatus.value,
      startDate,
      endDate
    })
    list.value = res.records
    total.value = res.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onExport() {
  if (!list.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  // 生成 CSV
  const headers = ['订单号', '客户', '状态', '商品总额', '优惠', '实付', '下单时间']
  const rows = list.value.map((o) => [
    o.orderNo,
    o.userNickname,
    o.statusDesc,
    o.totalAmount,
    o.couponAmount,
    o.payAmount,
    formatDate(o.createdAt)
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(','))
    .join('\n')
  // 加 BOM 头避免中文乱码
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `财务对账_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  setQuickRange(7)
})
</script>

<style scoped lang="scss">
.finance-page {
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
.mini-stat {
  text-align: center;
  padding: 8px 0;
  .label {
    color: #999;
    font-size: 13px;
    margin-bottom: 6px;
  }
  .value {
    font-size: 20px;
    font-weight: 600;
    &.discount {
      color: #ff9800;
    }
    &.refund {
      color: #f56c6c;
    }
  }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.discount {
  color: #ff9800;
}
.money {
  color: #ff6b35;
  font-weight: 600;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
