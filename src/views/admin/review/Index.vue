<template>
  <div class="admin-review">
    <h2 class="page-title">评价管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="商家/用户/订单号"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="评分">
          <el-select v-model="query.rating" placeholder="全部评分" clearable style="width: 140px">
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="显示中" :value="1" />
            <el-option label="已隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无评价数据"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="用户" min-width="120">
          <template #default="{ row }">
            <div>{{ row.userNickname }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="商家" min-width="140" />
        <el-table-column label="评分" width="160" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column label="评价内容" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.content">{{ row.content }}</span>
            <span v-else class="sub">未填写</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <template v-if="row.images && row.images.length">
              <el-image
                v-for="(img, i) in row.images.slice(0, 3)"
                :key="i"
                :src="img"
                :preview-src-list="row.images"
                :initial-index="i"
                preview-teleported
                style="width: 30px; height: 30px; margin-right: 4px"
                fit="cover"
              />
            </template>
            <span v-else class="sub">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '显示中' : '已隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评价时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              size="small"
              link
              type="warning"
              @click="onToggle(row, 0)"
            >隐藏</el-button>
            <el-button
              v-else
              size="small"
              link
              type="success"
              @click="onToggle(row, 1)"
            >显示</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/api/request'
import { formatDate } from '@/utils/format'

interface Review {
  id: number
  orderNo: string
  userId: number
  userNickname: string
  merchantId: number
  merchantName: string
  rating: number
  content: string
  images: string[]
  status: number
  createdAt: string
}

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  rating: undefined as number | undefined,
  status: undefined as number | undefined
})

const list = ref<Review[]>([])
const total = ref(0)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await request<{ records: Review[]; total: number }>({
      url: '/admin/reviews',
      method: 'GET',
      params: query
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // 兜底数据
    list.value = [
      {
        id: 1, orderNo: 'OD202406170001', userId: 1, userNickname: '张三',
        merchantId: 1, merchantName: '味真足总店', rating: 5,
        content: '菜品新鲜，配送很快，好评！', images: [],
        status: 1, createdAt: '2024-06-17 12:30:00'
      },
      {
        id: 2, orderNo: 'OD202406170002', userId: 2, userNickname: '李四',
        merchantId: 2, merchantName: '老王烧烤', rating: 2,
        content: '配送太慢了，等了一个多小时', images: [],
        status: 1, createdAt: '2024-06-17 13:00:00'
      },
      {
        id: 3, orderNo: 'OD202406170003', userId: 3, userNickname: '王五',
        merchantId: 3, merchantName: '甜心奶茶', rating: 4,
        content: '奶茶不错，就是糖放多了点', images: [],
        status: 0, createdAt: '2024-06-17 14:00:00'
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
  query.rating = undefined
  query.status = undefined
  query.current = 1
  loadData()
}

async function onToggle(row: Review, status: number) {
  const action = status === 1 ? '显示' : '隐藏'
  try {
    await ElMessageBox.confirm(`确定要${action}该评价吗？`, '提示', { type: 'warning' })
    await request({
      url: `/admin/reviews/${row.id}/status`,
      method: 'PUT',
      params: { status }
    })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // cancel or error
  }
}

async function onDelete(row: Review) {
  try {
    await ElMessageBox.confirm('确定要删除该评价吗？该操作不可恢复', '删除确认', {
      type: 'warning'
    })
    await request({ url: `/admin/reviews/${row.id}`, method: 'DELETE' })
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-review {
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
.sub {
  color: #999;
  font-size: 12px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
