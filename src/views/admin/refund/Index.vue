<template>
  <div class="admin-refund">
    <h2 class="page-title">退款审核</h2>

    <!-- 状态 Tab -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="待审核" :name="0" />
      <el-tab-pane label="已通过" :name="1" />
      <el-tab-pane label="已拒绝" :name="2" />
      <el-tab-pane label="已退款" :name="3" />
      <el-tab-pane label="全部" :name="-1" />
    </el-tabs>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无退款记录"
      >
        <el-table-column prop="refundNo" label="退款单号" width="200" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="userNickname" label="用户" min-width="120" />
        <el-table-column prop="merchantName" label="商家" min-width="140" />
        <el-table-column label="退款金额" width="120" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusDesc || REFUND_STATUS_DESC[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">{{ formatDate(row.applyTime) }}</template>
        </el-table-column>
        <el-table-column label="处理时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.approveTime) || formatDate(row.refundTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">详情</el-button>
            <template v-if="row.status === 0">
              <el-button size="small" link type="success" @click="onApprove(row)">通过</el-button>
              <el-button size="small" link type="danger" @click="onReject(row)">拒绝</el-button>
            </template>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="退款详情" width="640px" destroy-on-close>
      <el-descriptions v-if="current" :column="2" border>
        <el-descriptions-item label="退款单号">{{ current.refundNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ current.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ current.userNickname }}</el-descriptions-item>
        <el-descriptions-item label="商家">{{ current.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">
          <span class="money">{{ formatMoney(current.amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(current.status)" size="small">
            {{ current.statusDesc || REFUND_STATUS_DESC[current.status] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="退款原因" :span="2">{{ current.reason }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDate(current.applyTime) }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">
          {{ formatDate(current.approveTime) || formatDate(current.refundTime) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item v-if="current.rejectReason" label="拒绝原因" :span="2">
          {{ current.rejectReason }}
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="current && current.status === 0" #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="onApprove(current)">审核通过</el-button>
        <el-button type="danger" @click="onReject(current)">审核拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectVisible" title="退款拒绝" width="460px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-select v-model="rejectForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="不符合退款规则" value="不符合退款规则" />
            <el-option label="订单已配送完成" value="订单已配送完成" />
            <el-option label="证据不足" value="证据不足" />
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
        <el-button type="danger" :loading="actionLoading" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRefunds, approveRefund, type AdminRefundVO } from '@/api/admin/manage.api'
import { formatMoney, formatDate } from '@/utils/format'
import { REFUND_STATUS, REFUND_STATUS_DESC } from '@/utils/constants'

const activeTab = ref(0)
const query = reactive({
  current: 1,
  size: 10
})

const list = ref<AdminRefundVO[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const current = ref<AdminRefundVO | null>(null)

const rejectVisible = ref(false)
const rejectForm = reactive({ reason: '', remark: '' })
const rejectId = ref<number>(0)
const actionLoading = ref(false)

function getStatusType(status: number) {
  const map: Record<number, string> = {
    [REFUND_STATUS.PENDING]: 'warning',
    [REFUND_STATUS.APPROVED]: 'primary',
    [REFUND_STATUS.REJECTED]: 'danger',
    [REFUND_STATUS.REFUNDED]: 'success'
  }
  return map[status] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getRefunds({
      current: query.current,
      size: query.size,
      status: activeTab.value === -1 ? undefined : activeTab.value
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  query.current = 1
  loadData()
}

function onDetail(row: AdminRefundVO) {
  current.value = row
  detailVisible.value = true
}

async function onApprove(row: AdminRefundVO) {
  try {
    await ElMessageBox.confirm(
      `确认通过退款「${row.refundNo}」吗？退款金额 ${formatMoney(row.amount)}`,
      '审核通过',
      { type: 'success' }
    )
    await approveRefund(row.id, { approved: true })
    ElMessage.success('审核通过')
    detailVisible.value = false
    loadData()
  } catch {
    // cancel or error
  }
}

function onReject(row: AdminRefundVO) {
  rejectId.value = row.id
  rejectForm.reason = ''
  rejectForm.remark = ''
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }
  const reason = rejectForm.remark
    ? `${rejectForm.reason}：${rejectForm.remark}`
    : rejectForm.reason
  actionLoading.value = true
  try {
    await approveRefund(rejectId.value, { approved: false, reason })
    ElMessage.success('已拒绝')
    rejectVisible.value = false
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
.admin-refund {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
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
