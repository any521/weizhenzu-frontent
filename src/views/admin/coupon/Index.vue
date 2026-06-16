<template>
  <div class="admin-coupon">
    <h2 class="page-title">优惠券管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="优惠券名称">
          <el-input
            v-model="query.keyword"
            placeholder="请输入名称"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.type" placeholder="全部类型" clearable style="width: 140px">
            <el-option
              v-for="(label, value) in COUPON_TYPE_DESC"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="进行中" :value="1" />
            <el-option label="未开始" :value="0" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" :icon="Plus" @click="onAdd">新建优惠券</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 优惠券表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无优惠券"
      >
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ COUPON_TYPE_DESC[row.type] || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="面额/折扣" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.type === 1" class="money">满{{ row.threshold }}减{{ row.amount }}</span>
            <span v-else-if="row.type === 2" class="money">{{ row.discount }}折</span>
            <span v-else class="money">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="发行总量" width="100" align="center" />
        <el-table-column prop="received" label="已领取" width="100" align="center" />
        <el-table-column prop="used" label="已使用" width="100" align="center" />
        <el-table-column label="有效期" min-width="200">
          <template #default="{ row }">
            {{ formatDate(row.startTime, 'YYYY-MM-DD') }} ~ {{ formatDate(row.endTime, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="small" link type="info" @click="onRecords(row)">领取记录</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              link
              type="warning"
              @click="onStop(row)"
            >停止</el-button>
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

    <!-- 新建/编辑弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="formTitle"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">满减券</el-radio>
            <el-radio :value="2">折扣券</el-radio>
            <el-radio :value="3">现金券</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.type === 1">
          <el-form-item label="使用门槛" prop="threshold">
            <el-input-number v-model="form.threshold" :min="0" :precision="2" />
            <span class="ml-8">元</span>
          </el-form-item>
          <el-form-item label="减免金额" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :precision="2" />
            <span class="ml-8">元</span>
          </el-form-item>
        </template>
        <template v-else-if="form.type === 2">
          <el-form-item label="折扣" prop="discount">
            <el-input-number v-model="form.discount" :min="0.1" :max="9.9" :precision="1" />
            <span class="ml-8">折</span>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="面额" prop="amount">
            <el-input-number v-model="form.amount" :min="0" :precision="2" />
            <span class="ml-8">元</span>
          </el-form-item>
        </template>
        <el-form-item label="发行总量" prop="total">
          <el-input-number v-model="form.total" :min="1" :max="100000" />
          <span class="ml-8">张</span>
        </el-form-item>
        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每人限领">
          <el-input-number v-model="form.limitPerUser" :min="1" :max="10" />
          <span class="ml-8">张</span>
        </el-form-item>
        <el-form-item label="适用范围">
          <el-radio-group v-model="form.scope">
            <el-radio :value="1">全场通用</el-radio>
            <el-radio :value="2">指定商家</el-radio>
            <el-radio :value="3">指定类目</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="选填"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { request } from '@/api/request'
import { formatMoney, formatDate } from '@/utils/format'
import { COUPON_TYPE_DESC } from '@/utils/constants'

interface Coupon {
  id: number
  name: string
  type: number
  threshold: number
  amount: number
  discount: number
  total: number
  received: number
  used: number
  startTime: string
  endTime: string
  status: number
  limitPerUser: number
  scope: number
  remark: string
}

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined
})

const list = ref<Coupon[]>([])
const total = ref(0)
const loading = ref(false)

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: 0,
  name: '',
  type: 1,
  threshold: 0,
  amount: 0,
  discount: 9.5,
  total: 100,
  dateRange: [] as string[],
  limitPerUser: 1,
  scope: 1,
  remark: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const formTitle = computed(() => (isEdit.value ? '编辑优惠券' : '新建优惠券'))

function getStatusType(status: number) {
  const map: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return map[status] || 'info'
}

function getStatusText(status: number) {
  const map: Record<number, string> = {
    0: '未开始',
    1: '进行中',
    2: '已结束'
  }
  return map[status] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const res = await request<{ records: Coupon[]; total: number }>({
      url: '/admin/coupons',
      method: 'GET',
      params: query
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // 接口未实现时使用兜底数据
    list.value = [
      {
        id: 1, name: '新人立减券', type: 1, threshold: 20, amount: 5, discount: 0,
        total: 1000, received: 580, used: 320, startTime: '2024-06-01 00:00:00',
        endTime: '2024-12-31 23:59:59', status: 1, limitPerUser: 1, scope: 1, remark: ''
      },
      {
        id: 2, name: '满50减8', type: 1, threshold: 50, amount: 8, discount: 0,
        total: 500, received: 200, used: 80, startTime: '2024-06-01 00:00:00',
        endTime: '2024-06-30 23:59:59', status: 1, limitPerUser: 2, scope: 1, remark: ''
      },
      {
        id: 3, name: '美食8.5折', type: 2, threshold: 0, amount: 0, discount: 8.5,
        total: 200, received: 100, used: 30, startTime: '2024-06-10 00:00:00',
        endTime: '2024-07-10 23:59:59', status: 1, limitPerUser: 1, scope: 3, remark: '仅限美食类目'
      }
    ]
    total.value = list.value.length
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
  query.type = undefined
  query.status = undefined
  query.current = 1
  loadData()
}

function resetForm() {
  form.id = 0
  form.name = ''
  form.type = 1
  form.threshold = 0
  form.amount = 0
  form.discount = 9.5
  form.total = 100
  form.dateRange = []
  form.limitPerUser = 1
  form.scope = 1
  form.remark = ''
}

function onAdd() {
  isEdit.value = false
  resetForm()
  formVisible.value = true
}

function onEdit(row: Coupon) {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.threshold = row.threshold
  form.amount = row.amount
  form.discount = row.discount
  form.total = row.total
  form.dateRange = [row.startTime, row.endTime]
  form.limitPerUser = row.limitPerUser
  form.scope = row.scope
  form.remark = row.remark
  formVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!form.dateRange || form.dateRange.length !== 2) {
      ElMessage.warning('请选择有效期')
      return
    }
    submitLoading.value = true
    try {
      const payload = {
        ...form,
        startTime: form.dateRange[0],
        endTime: form.dateRange[1]
      }
      if (isEdit.value) {
        await request({ url: `/admin/coupons/${form.id}`, method: 'PUT', data: payload })
      } else {
        await request({ url: '/admin/coupons', method: 'POST', data: payload })
      }
      ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
      formVisible.value = false
      loadData()
    } catch {
      // ignore
    } finally {
      submitLoading.value = false
    }
  })
}

function onRecords(row: Coupon) {
  ElMessage.info(`查看「${row.name}」的领取记录（功能开发中）`)
}

async function onStop(row: Coupon) {
  try {
    await ElMessageBox.confirm(`确定要停止优惠券「${row.name}」吗？`, '提示', { type: 'warning' })
    await request({ url: `/admin/coupons/${row.id}/stop`, method: 'POST' })
    ElMessage.success('已停止')
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-coupon {
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
.ml-8 {
  margin-left: 8px;
  color: #999;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
