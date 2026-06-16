<template>
  <div class="dish-list">
    <div class="page-header">
      <h2 class="page-title">菜品管理</h2>
      <el-button type="primary" :icon="Plus" @click="onAdd">新增菜品</el-button>
    </div>

    <!-- 筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="分类">
          <el-select
            v-model="query.categoryId"
            placeholder="全部分类"
            clearable
            style="width: 160px"
            @change="onSearch"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
            @change="onSearch"
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品名">
          <el-input
            v-model="query.keyword"
            placeholder="请输入菜品名"
            clearable
            style="width: 200px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无菜品"
      >
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              style="width: 60px; height: 60px"
              fit="cover"
              :preview-src-list="[row.image]"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="菜品名称" min-width="160">
          <template #default="{ row }">
            <div class="dish-name">
              <span class="name">{{ row.name }}</span>
              <span class="category">{{ row.categoryName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="140" align="right">
          <template #default="{ row }">
            <div class="price">
              <span class="now">{{ formatMoney(row.price) }}</span>
              <span v-if="row.originalPrice" class="origin">¥{{ row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="boxPrice" label="包装费" width="90" align="right">
          <template #default="{ row }">¥{{ row.boxPrice }}</template>
        </el-table-column>
        <el-table-column label="库存" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'danger'" size="small">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="90" align="center" />
        <el-table-column label="评分" width="90" align="center">
          <template #default="{ row }">
            <span class="rating">★ {{ row.rating.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(v: any) => onToggleStatus(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getDishes,
  getCategories,
  toggleDishStatus,
  deleteDish,
  type MerchantDishVO,
  type DishCategoryVO
} from '@/api/merchant/dish.api'
import { formatMoney } from '@/utils/format'

const router = useRouter()

const categories = ref<DishCategoryVO[]>([])
const list = ref<MerchantDishVO[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

async function loadCategories() {
  try {
    categories.value = await getCategories()
  } catch {
    // ignore
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getDishes({
      current: query.current,
      size: query.size,
      keyword: query.keyword || undefined,
      categoryId: query.categoryId,
      status: query.status
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
  query.categoryId = undefined
  query.status = undefined
  query.current = 1
  loadData()
}

function onAdd() {
  router.push('/merchant/dishes/edit')
}

function onEdit(row: MerchantDishVO) {
  router.push(`/merchant/dishes/edit/${row.id}`)
}

async function onToggleStatus(row: MerchantDishVO, v: any) {
  const newStatus = v ? 1 : 0
  try {
    await toggleDishStatus(row.id, newStatus)
    ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
    row.status = newStatus
  } catch {
    // ignore
  }
}

async function onDelete(row: MerchantDishVO) {
  try {
    await ElMessageBox.confirm(`确认删除菜品「${row.name}」吗？`, '删除菜品', {
      type: 'warning'
    })
    await deleteDish(row.id)
    ElMessage.success('删除成功')
    if (list.value.length === 1 && query.current > 1) {
      query.current--
    }
    loadData()
  } catch {
    // cancel
  }
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<style scoped lang="scss">
.dish-list {
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
  :deep(.el-card__body) {
    padding: 16px 16px 0;
  }
}
.dish-name {
  display: flex;
  flex-direction: column;
  .name {
    color: #333;
    font-size: 14px;
    font-weight: 500;
  }
  .category {
    color: #999;
    font-size: 12px;
    margin-top: 2px;
  }
}
.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  .now {
    color: #ff6b35;
    font-weight: 600;
  }
  .origin {
    color: #ccc;
    font-size: 12px;
    text-decoration: line-through;
  }
}
.rating {
  color: #ff9800;
  font-size: 13px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
