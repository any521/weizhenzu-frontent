<template>
  <div class="admin-order">
    <h2 class="page-title">订单管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="订单号">
          <el-input
            v-model="query.keyword"
            placeholder="请输入订单号"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option
              v-for="(label, value) in ORDER_STATUS_DESC"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="query.payStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="未支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已退款" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无订单数据"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userNickname" label="用户" min-width="120" />
        <el-table-column prop="merchantName" label="商家" min-width="140" />
        <el-table-column prop="riderName" label="骑手" width="100">
          <template #default="{ row }">{{ row.riderName || '-' }}</template>
        </el-table-column>
        <el-table-column label="金额" width="110" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.payAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.statusDesc || ORDER_STATUS_DESC[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPayTagType(row.payStatus)" size="small" effect="plain">
              {{ getPayText(row.payStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">详情</el-button>
            <el-button
              v-if="canClose(row.status)"
              size="small"
              link
              type="danger"
              @click="onClose(row)"
            >关闭订单</el-button>
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="720px" destroy-on-close>
      <div v-loading="detailLoading">
        <template v-if="currentOrder">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusTagType(currentOrder.status)" size="small">
                {{ currentOrder.statusDesc || ORDER_STATUS_DESC[currentOrder.status] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户">{{ currentOrder.userNickname }}</el-descriptions-item>
            <el-descriptions-item label="商家">{{ currentOrder.merchantName }}</el-descriptions-item>
            <el-descriptions-item label="骑手">{{ currentOrder.riderName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="getPayTagType(currentOrder.payStatus)" size="small" effect="plain">
                {{ getPayText(currentOrder.payStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付金额">
              <span class="money">{{ formatMoney(currentOrder.payAmount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">
              {{ PAY_TYPE_DESC[currentOrder.payType] || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ formatDate(currentOrder.paidTime) || '-' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间" :span="2">{{ formatDate(currentOrder.completeTime) || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentOrder && canClose(currentOrder.status)"
          type="danger"
          @click="onClose(currentOrder)"
        >关闭订单</el-button>
      </template>
    </el-dialog>

    <!-- 关闭订单弹窗 -->
    <el-dialog v-model="closeVisible" title="关闭订单" width="460px">
      <el-form :model="closeForm" label-width="80px">
        <el-form-item label="关闭原因">
          <el-select v-model="closeForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="用户取消" value="用户取消" />
            <el-option label="商家无法接单" value="商家无法接单" />
            <el-option label="系统异常" value="系统异常" />
            <el-option label="违规订单" value="违规订单" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="closeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入详细原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmClose">确认关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getOrders,
  getOrderDetail,
  closeOrder,
  type AdminOrderVO
} from '@/api/admin/manage.api'
import { formatMoney, formatDate } from '@/utils/format'
import { ORDER_STATUS, ORDER_STATUS_DESC, PAY_TYPE_DESC } from '@/utils/constants'

const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined,
  payStatus: undefined as number | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

const list = ref<AdminOrderVO[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentOrder = ref<AdminOrderVO | null>(null)

const closeVisible = ref(false)
const closeForm = reactive({ reason: '', remark: '' })
const closeId = ref<number>(0)
const actionLoading = ref(false)

function getStatusTagType(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PENDING_PAY]: 'info',
    [ORDER_STATUS.PAID]: 'warning',
    [ORDER_STATUS.MERCHANT_ACCEPTED]: 'primary',
    [ORDER_STATUS.RIDER_TAKEN]: 'primary',
    [ORDER_STATUS.PICKED_UP]: 'primary',
    [ORDER_STATUS.DELIVERING]: 'primary',
    [ORDER_STATUS.DELIVERED]: 'success',
    [ORDER_STATUS.COMPLETED]: 'success',
    [ORDER_STATUS.CANCELED]: 'info',
    [ORDER_STATUS.REFUNDING]: 'warning',
    [ORDER_STATUS.REFUNDED]: 'info'
  }
  return map[status] || 'info'
}

function getPayTagType(payStatus: number) {
  const map: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return map[payStatus] || 'info'
}

function getPayText(payStatus: number) {
  const map: Record<number, string> = {
    0: '未支付',
    1: '已支付',
    2: '已退款'
  }
  return map[payStatus] || '未知'
}

function canClose(status: number) {
  return [
    ORDER_STATUS.PENDING_PAY,
    ORDER_STATUS.PAID,
    ORDER_STATUS.MERCHANT_ACCEPTED,
    ORDER_STATUS.RIDER_TAKEN
  ].includes(status as any)
}

async function loadData() {
  loading.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      query.startDate = dateRange.value[0]
      query.endDate = dateRange.value[1]
    } else {
      query.startDate = undefined
      query.endDate = undefined
    }
    const res = await getOrders({
      current: query.current,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status,
      payStatus: query.payStatus,
      startDate: query.startDate,
      endDate: query.endDate
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.current = 1
  loadData()
}

function onReset() {
  query.keyword = ''
  query.status = undefined
  query.payStatus = undefined
  dateRange.value = null
  query.current = 1
  loadData()
}

async function onDetail(row: AdminOrderVO) {
  detailVisible.value = true
  detailLoading.value = true
  currentOrder.value = null
  try {
    currentOrder.value = await getOrderDetail(row.id)
  } catch {
    currentOrder.value = row
  } finally {
    detailLoading.value = false
  }
}

function onClose(row: AdminOrderVO) {
  closeId.value = row.id
  closeForm.reason = ''
  closeForm.remark = ''
  closeVisible.value = true
}

async function confirmClose() {
  if (!closeForm.reason) {
    ElMessage.warning('请选择关闭原因')
    return
  }
  const reason = closeForm.remark
    ? `${closeForm.reason}：${closeForm.remark}`
    : closeForm.reason
  actionLoading.value = true
  try {
    await closeOrder(closeId.value, reason)
    ElMessage.success('订单已关闭')
    closeVisible.value = false
    detailVisible.value = false
    loadData()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-order {
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
