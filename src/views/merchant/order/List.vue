<template>
  <div class="order-list">
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

    <!-- 状态筛选 Tab -->
    <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="onTabChange">
      <el-tab-pane
        v-for="t in statusTabs"
        :key="t.value"
        :label="t.label"
        :name="t.value"
      />
    </el-tabs>

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
        <el-table-column label="客户" min-width="140">
          <template #default="{ row }">
            <div class="customer">
              <span class="name">{{ row.userNickname }}</span>
              <span class="phone">{{ maskPhone(row.userPhone) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="110" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.payAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="商品数" width="90" align="center" />
        <el-table-column label="下单时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === ORDER_STATUS.PAID"
              size="small"
              link
              type="success"
              @click="onAccept(row)"
            >接单</el-button>
            <el-button
              v-if="row.status === ORDER_STATUS.PAID"
              size="small"
              link
              type="danger"
              @click="onReject(row)"
            >拒单</el-button>
            <el-button
              v-if="row.status === ORDER_STATUS.MERCHANT_ACCEPTED"
              size="small"
              link
              type="warning"
              @click="onReady(row)"
            >完成备餐</el-button>
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
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="720px"
      destroy-on-close
    >
      <div v-loading="detailLoading">
        <template v-if="currentOrder">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(currentOrder.status)" size="small">
                {{ currentOrder.statusDesc }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户">{{ currentOrder.userNickname }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ maskPhone(currentOrder.userPhone) }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="期望送达">{{ currentOrder.expectedTime || '尽快送达' }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ currentOrder.address?.contactName }} {{ maskPhone(currentOrder.address?.contactPhone) }}
              {{ currentOrder.address?.detail }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ currentOrder.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>

          <h4 class="section-title">商品明细</h4>
          <el-table :data="currentOrder.items" border size="small">
            <el-table-column label="图片" width="70">
              <template #default="{ row }">
                <el-image
                  :src="row.dishImage"
                  style="width: 40px; height: 40px"
                  fit="cover"
                />
              </template>
            </el-table-column>
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

          <div class="amount-summary">
            <div class="line">
              <span>商品总额</span><span>{{ formatMoney(currentOrder.totalAmount) }}</span>
            </div>
            <div class="line">
              <span>包装费</span><span>{{ formatMoney(currentOrder.packingFee) }}</span>
            </div>
            <div class="line">
              <span>配送费</span><span>{{ formatMoney(currentOrder.deliveryFee) }}</span>
            </div>
            <div class="line">
              <span>优惠金额</span><span>-{{ formatMoney(currentOrder.couponAmount) }}</span>
            </div>
            <div class="line total">
              <span>实付金额</span><span class="money">{{ formatMoney(currentOrder.payAmount) }}</span>
            </div>
          </div>
        </template>
      </div>
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
        <el-form-item label="备注">
          <el-input
            v-model="rejectForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入详细原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="confirmReject">确认拒单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  markReady,
  type MerchantOrderVO
} from '@/api/merchant/order.api'
import { formatMoney, formatDate, maskPhone } from '@/utils/format'
import { ORDER_STATUS } from '@/utils/constants'

const route = useRoute()

const statusTabs = [
  { label: '全部', value: -1 },
  { label: '待接单', value: ORDER_STATUS.PAID },
  { label: '已接单', value: ORDER_STATUS.MERCHANT_ACCEPTED },
  { label: '配送中', value: ORDER_STATUS.DELIVERING },
  { label: '已完成', value: ORDER_STATUS.COMPLETED },
  { label: '已取消', value: ORDER_STATUS.CANCELED }
]

const activeStatus = ref(-1)
const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

const list = ref<MerchantOrderVO[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentOrder = ref<MerchantOrderVO | null>(null)

const rejectVisible = ref(false)
const rejectForm = reactive({ reason: '', remark: '' })
const rejectOrderId = ref<number>(0)
const actionLoading = ref(false)

function getStatusTagType(status: number) {
  const map: Record<number, string> = {
    [ORDER_STATUS.PAID]: 'warning',
    [ORDER_STATUS.MERCHANT_ACCEPTED]: 'primary',
    [ORDER_STATUS.DELIVERING]: 'primary',
    [ORDER_STATUS.DELIVERED]: 'success',
    [ORDER_STATUS.COMPLETED]: 'success',
    [ORDER_STATUS.CANCELED]: 'info',
    [ORDER_STATUS.REFUNDED]: 'info'
  }
  return map[status] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    query.status = activeStatus.value === -1 ? undefined : activeStatus.value
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
      startDate: query.startDate,
      endDate: query.endDate
    })
    list.value = res.records
    total.value = res.total
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
  dateRange.value = null
  query.current = 1
  loadData()
}

function onTabChange() {
  query.current = 1
  loadData()
}

async function onDetail(row: MerchantOrderVO) {
  detailVisible.value = true
  detailLoading.value = true
  currentOrder.value = null
  try {
    currentOrder.value = await getOrderDetail(row.id)
  } catch {
    // ignore
  } finally {
    detailLoading.value = false
  }
}

async function onAccept(row: MerchantOrderVO) {
  try {
    await ElMessageBox.confirm(`确认接单 ${row.orderNo} 吗？`, '接单', { type: 'warning' })
    await acceptOrder(row.id)
    ElMessage.success('接单成功')
    loadData()
  } catch {
    // cancel or error
  }
}

function onReject(row: MerchantOrderVO) {
  rejectOrderId.value = row.id
  rejectForm.reason = ''
  rejectForm.remark = ''
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒单原因')
    return
  }
  const reason = rejectForm.remark
    ? `${rejectForm.reason}：${rejectForm.remark}`
    : rejectForm.reason
  actionLoading.value = true
  try {
    await rejectOrder(rejectOrderId.value, reason)
    ElMessage.success('已拒单')
    rejectVisible.value = false
    loadData()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
  }
}

async function onReady(row: MerchantOrderVO) {
  try {
    await ElMessageBox.confirm('确认完成备餐吗？', '提示', { type: 'warning' })
    await markReady(row.id)
    ElMessage.success('已标记完成备餐')
    loadData()
  } catch {
    // cancel
  }
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    // 从其他页面跳转过来，打开详情
    onDetail({ id: Number(id) } as MerchantOrderVO)
  }
  loadData()
})
</script>

<style scoped lang="scss">
.order-list {
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
.status-tabs {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.customer {
  display: flex;
  flex-direction: column;
  .name {
    color: #333;
    font-size: 13px;
  }
  .phone {
    color: #999;
    font-size: 12px;
  }
}
.money {
  color: #ff6b35;
  font-weight: 600;
}
.section-title {
  margin: 20px 0 10px;
  font-size: 14px;
  color: #333;
}
.amount-summary {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 4px;
  .line {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    color: #666;
    font-size: 13px;
    &.total {
      border-top: 1px solid #eee;
      margin-top: 4px;
      padding-top: 8px;
      color: #333;
      font-weight: 600;
      .money {
        font-size: 16px;
      }
    }
  }
}
</style>
