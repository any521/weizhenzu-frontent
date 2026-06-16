<template>
  <div class="promotion-page">
    <div class="page-header">
      <h2 class="page-title">促销管理</h2>
      <el-button type="primary" :icon="Plus" @click="onAdd">新建活动</el-button>
    </div>

    <!-- 状态筛选 -->
    <el-card class="search-card" shadow="never">
      <el-radio-group v-model="statusFilter" @change="onFilterChange">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="active">进行中</el-radio-button>
        <el-radio-button value="pending">未开始</el-radio-button>
        <el-radio-button value="ended">已结束</el-radio-button>
        <el-radio-button value="disabled">已停用</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 活动列表 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="filteredList"
        stripe
        style="width: 100%"
        empty-text="暂无促销活动"
      >
        <el-table-column label="活动名称" min-width="180">
          <template #default="{ row }">
            <div class="promo-name">
              <span class="name">{{ row.name }}</span>
              <el-tag :type="getTypeTag(row.type)" size="small">{{ getTypeText(row.type) }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容" min-width="160">
          <template #default="{ row }">
            <span v-if="row.type === 1">满 {{ formatMoney(row.threshold, false) }} 减 {{ formatMoney(row.discount, false) }}</span>
            <span v-else-if="row.type === 2">{{ row.discount }} 折</span>
            <span v-else>立减 {{ formatMoney(row.discount, false) }} 元</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" min-width="200">
          <template #default="{ row }">
            <div class="time-range">
              <div>{{ formatDate(row.startTime, 'YYYY-MM-DD HH:mm') }}</div>
              <div>至</div>
              <div>{{ formatDate(row.endTime, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row)" size="small">{{ getStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用次数" width="100" align="center">
          <template #default="{ row }">{{ row.usedCount || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status !== 0"
              size="small"
              link
              type="warning"
              @click="onToggle(row, 0)"
            >停用</el-button>
            <el-button
              v-else
              size="small"
              link
              type="success"
              @click="onToggle(row, 1)"
            >启用</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing.id ? '编辑活动' : '新建活动'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editing" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="editing.name" placeholder="如：满50减10" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-radio-group v-model="editing.type">
            <el-radio :value="1">满减</el-radio>
            <el-radio :value="2">折扣</el-radio>
            <el-radio :value="3">立减</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="editing.type === 1" label="满减门槛" prop="threshold">
          <el-input-number v-model="editing.threshold" :min="0" :precision="2" :step="10" controls-position="right" />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item :label="discountLabel" prop="discount">
          <el-input-number
            v-model="editing.discount"
            :min="0"
            :max="editing.type === 2 ? 9.9 : undefined"
            :precision="editing.type === 2 ? 1 : 2"
            :step="editing.type === 2 ? 0.5 : 1"
            controls-position="right"
          />
          <span class="unit">{{ editing.type === 2 ? '折' : '元' }}</span>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="editing.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editing.remark"
            type="textarea"
            :rows="2"
            placeholder="活动说明（可选）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { formatMoney, formatDate } from '@/utils/format'
import dayjs from 'dayjs'

interface Promotion {
  id: number
  name: string
  type: number // 1满减 2折扣 3立减
  threshold: number
  discount: number
  startTime: string
  endTime: string
  status: number // 0停用 1启用
  usedCount: number
  remark: string
}

const list = ref<Promotion[]>([])
const loading = ref(false)
const statusFilter = ref('all')

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const editing = reactive({
  id: 0,
  name: '',
  type: 1,
  threshold: 50,
  discount: 10,
  timeRange: null as [string, string] | null,
  status: 1,
  remark: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  threshold: [{ required: true, message: '请输入门槛金额', trigger: 'blur' }],
  discount: [{ required: true, message: '请输入优惠金额', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
}

const discountLabel = computed(() => {
  if (editing.type === 1) return '减免金额'
  if (editing.type === 2) return '折扣力度'
  return '立减金额'
})

const filteredList = computed(() => {
  if (statusFilter.value === 'all') return list.value
  const now = dayjs()
  return list.value.filter((p) => {
    const start = dayjs(p.startTime)
    const end = dayjs(p.endTime)
    if (statusFilter.value === 'active') {
      return p.status === 1 && now.isAfter(start) && now.isBefore(end)
    }
    if (statusFilter.value === 'pending') {
      return p.status === 1 && now.isBefore(start)
    }
    if (statusFilter.value === 'ended') {
      return now.isAfter(end)
    }
    if (statusFilter.value === 'disabled') {
      return p.status === 0
    }
    return true
  })
})

function getTypeText(type: number) {
  return { 1: '满减', 2: '折扣', 3: '立减' }[type] || '未知'
}

function getTypeTag(type: number): any {
  return { 1: 'warning', 2: 'success', 3: 'primary' }[type] || 'info'
}

function getStatusText(p: Promotion) {
  if (p.status === 0) return '已停用'
  const now = dayjs()
  const start = dayjs(p.startTime)
  const end = dayjs(p.endTime)
  if (now.isBefore(start)) return '未开始'
  if (now.isAfter(end)) return '已结束'
  return '进行中'
}

function getStatusTag(p: Promotion): any {
  if (p.status === 0) return 'info'
  const now = dayjs()
  const start = dayjs(p.startTime)
  const end = dayjs(p.endTime)
  if (now.isBefore(start)) return 'warning'
  if (now.isAfter(end)) return 'info'
  return 'success'
}

async function loadData() {
  loading.value = true
  try {
    // 实际项目中应调用 API，这里使用本地模拟数据
    // const res = await getPromotions()
    // list.value = res
    list.value = mockData()
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function mockData(): Promotion[] {
  const now = dayjs()
  return [
    {
      id: 1,
      name: '满50减10',
      type: 1,
      threshold: 50,
      discount: 10,
      startTime: now.subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: now.add(8, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: 1,
      usedCount: 36,
      remark: '日常满减活动'
    },
    {
      id: 2,
      name: '工作日午餐8折',
      type: 2,
      threshold: 0,
      discount: 8,
      startTime: now.subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: now.add(25, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: 1,
      usedCount: 88,
      remark: '工作日 11:00-13:00'
    },
    {
      id: 3,
      name: '新客立减5元',
      type: 3,
      threshold: 0,
      discount: 5,
      startTime: now.add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: now.add(32, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: 1,
      usedCount: 0,
      remark: '新用户专享'
    },
    {
      id: 4,
      name: '满100减30',
      type: 1,
      threshold: 100,
      discount: 30,
      startTime: now.subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: now.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: 1,
      usedCount: 120,
      remark: '已结束'
    }
  ]
}

function onFilterChange() {
  // 客户端筛选，无需重新请求
}

function onAdd() {
  editing.id = 0
  editing.name = ''
  editing.type = 1
  editing.threshold = 50
  editing.discount = 10
  editing.timeRange = null
  editing.status = 1
  editing.remark = ''
  dialogVisible.value = true
}

function onEdit(row: Promotion) {
  editing.id = row.id
  editing.name = row.name
  editing.type = row.type
  editing.threshold = row.threshold
  editing.discount = row.discount
  editing.timeRange = [row.startTime, row.endTime]
  editing.status = row.status
  editing.remark = row.remark
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!editing.timeRange) return
    submitting.value = true
    try {
      const payload: Promotion = {
        id: editing.id,
        name: editing.name,
        type: editing.type,
        threshold: editing.type === 1 ? editing.threshold : 0,
        discount: editing.discount,
        startTime: editing.timeRange[0],
        endTime: editing.timeRange[1],
        status: editing.status,
        usedCount: 0,
        remark: editing.remark
      }
      // 实际项目中应调用 API
      // if (editing.id) await updatePromotion(editing.id, payload)
      // else await createPromotion(payload)
      if (editing.id) {
        const idx = list.value.findIndex((p) => p.id === editing.id)
        if (idx > -1) list.value[idx] = { ...list.value[idx], ...payload }
      } else {
        payload.id = Date.now()
        list.value.unshift(payload)
      }
      ElMessage.success(editing.id ? '修改成功' : '创建成功')
      dialogVisible.value = false
    } catch {
      // ignore
    } finally {
      submitting.value = false
    }
  })
}

async function onToggle(row: Promotion, status: number) {
  try {
    // await togglePromotionStatus(row.id, status)
    row.status = status
    ElMessage.success(status === 1 ? '已启用' : '已停用')
  } catch {
    // ignore
  }
}

async function onDelete(row: Promotion) {
  try {
    await ElMessageBox.confirm(`确认删除活动「${row.name}」吗？`, '删除活动', { type: 'warning' })
    // await deletePromotion(row.id)
    const idx = list.value.findIndex((p) => p.id === row.id)
    if (idx > -1) list.value.splice(idx, 1)
    ElMessage.success('删除成功')
  } catch {
    // cancel
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.promotion-page {
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
}
.search-card {
  margin-bottom: 12px;
}
.promo-name {
  display: flex;
  align-items: center;
  gap: 8px;
  .name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
}
.time-range {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}
.unit {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}
</style>
