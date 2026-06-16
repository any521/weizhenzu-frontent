<template>
  <div class="admin-merchant">
    <h2 class="page-title">商家管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="商家名称">
          <el-input
            v-model="query.name"
            placeholder="请输入商家名称"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="类目">
          <el-select v-model="query.categoryId" placeholder="全部类目" clearable style="width: 160px">
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="营业中" :value="1" />
            <el-option label="休息中" :value="2" />
            <el-option label="禁用" :value="0" />
            <el-option label="待审核" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商家表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无商家数据"
      >
        <el-table-column label="商家" min-width="220">
          <template #default="{ row }">
            <div class="merchant-cell">
              <el-avatar :size="40" :src="row.logo" shape="square">
                {{ row.name?.[0] || 'M' }}
              </el-avatar>
              <div class="info">
                <div class="name">{{ row.name }}</div>
                <div class="phone">{{ maskPhone(row.phone) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="类目" width="120" />
        <el-table-column label="联系人" width="140">
          <template #default="{ row }">
            <div>{{ row.contactName }}</div>
            <div class="sub">{{ maskPhone(row.contactPhone) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="评分" width="90" align="center">
          <template #default="{ row }">
            <span class="rating">★ {{ row.rating?.toFixed(1) || '0.0' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="monthlySales" label="月销" width="90" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.statusDesc || getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入驻时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">详情</el-button>
            <el-button
              v-if="row.status !== 1"
              size="small"
              link
              type="success"
              @click="onToggleStatus(row, 1)"
            >启用</el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              link
              type="warning"
              @click="onToggleStatus(row, 2)"
            >休息</el-button>
            <el-button
              v-if="row.status !== 0"
              size="small"
              link
              type="danger"
              @click="onToggleStatus(row, 0)"
            >禁用</el-button>
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

    <!-- 商家详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商家详情" width="640px" destroy-on-close>
      <el-descriptions v-if="current" :column="2" border>
        <el-descriptions-item label="商家名称">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="类目">{{ current.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ maskPhone(current.phone) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ current.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系手机">{{ maskPhone(current.contactPhone) }}</el-descriptions-item>
        <el-descriptions-item label="评分">★ {{ current.rating?.toFixed(1) || '0.0' }}</el-descriptions-item>
        <el-descriptions-item label="月销量">{{ current.monthlySales }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ current.statusDesc }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ current.address }}</el-descriptions-item>
        <el-descriptions-item label="营业执照" :span="2">
          <el-image
            v-if="current.businessLicense"
            :src="current.businessLicense"
            style="width: 120px; height: 80px"
            fit="cover"
            :preview-src-list="[current.businessLicense]"
            preview-teleported
          />
          <span v-else>未上传</span>
        </el-descriptions-item>
        <el-descriptions-item label="入驻时间" :span="2">{{ formatDate(current.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchants,
  updateMerchantStatus,
  type AdminMerchantVO
} from '@/api/admin/manage.api'
import { formatDate, maskPhone } from '@/utils/format'

const query = reactive({
  current: 1,
  size: 10,
  name: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

const list = ref<AdminMerchantVO[]>([])
const total = ref(0)
const loading = ref(false)

const categories = ref<Array<{ id: number; name: string }>>([])

const detailVisible = ref(false)
const current = ref<AdminMerchantVO | null>(null)

function getStatusType(status: number) {
  const map: Record<number, string> = {
    0: 'danger',
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return map[status] || 'info'
}

function getStatusText(status: number) {
  const map: Record<number, string> = {
    0: '禁用',
    1: '营业中',
    2: '休息中',
    3: '待审核'
  }
  return map[status] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchants({
      current: query.current,
      size: query.size,
      name: query.name || undefined,
      categoryId: query.categoryId,
      status: query.status
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  // 类目列表可从公共接口获取，这里使用静态数据兜底
  categories.value = [
    { id: 1, name: '美食' },
    { id: 2, name: '甜品饮品' },
    { id: 3, name: '生鲜果蔬' },
    { id: 4, name: '鲜花绿植' },
    { id: 5, name: '医药健康' },
    { id: 6, name: '超市便利' }
  ]
}

function onSearch() {
  query.current = 1
  loadData()
}

function onReset() {
  query.name = ''
  query.categoryId = undefined
  query.status = undefined
  query.current = 1
  loadData()
}

function onDetail(row: AdminMerchantVO) {
  current.value = row
  detailVisible.value = true
}

async function onToggleStatus(row: AdminMerchantVO, status: number) {
  const action = status === 1 ? '启用' : status === 2 ? '设为休息' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}商家「${row.name}」吗？`, '提示', {
      type: 'warning'
    })
    await updateMerchantStatus(row.id, status)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<style scoped lang="scss">
.admin-merchant {
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
.merchant-cell {
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
.sub {
  color: #999;
  font-size: 12px;
}
.rating {
  color: #ff9500;
  font-weight: 600;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
