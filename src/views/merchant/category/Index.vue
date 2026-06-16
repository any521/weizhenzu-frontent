<template>
  <div class="category-page">
    <div class="page-header">
      <h2 class="page-title">分类管理</h2>
      <el-button type="primary" :icon="Plus" @click="onAdd">新增分类</el-button>
    </div>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        row-key="id"
        style="width: 100%"
        empty-text="暂无分类"
      >
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">
            <div class="sort-cell">
              <el-button
                size="small"
                circle
                :icon="ArrowUp"
                :disabled="row.sort === 0"
                @click="onMoveUp(row)"
              />
              <el-button
                size="small"
                circle
                :icon="ArrowDown"
                @click="onMoveDown(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="序号" width="100" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="dishCount" label="菜品数量" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.dishCount || 0 }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing.id ? '编辑分类' : '新增分类'"
      width="460px"
    >
      <el-form ref="formRef" :model="editing" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editing.name" placeholder="请输入分类名称" maxlength="10" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="editing.sort" :min="0" :max="999" controls-position="right" />
          <span class="tip">数字越小越靠前</span>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type DishCategoryVO
} from '@/api/merchant/dish.api'

const list = ref<DishCategoryVO[]>([])
const loading = ref(false)
const submitting = ref(false)

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editing = reactive({
  id: 0,
  name: '',
  sort: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getCategories()
    // 按 sort 升序
    list.value.sort((a, b) => a.sort - b.sort)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onAdd() {
  editing.id = 0
  editing.name = ''
  editing.sort = list.value.length
  dialogVisible.value = true
}

function onEdit(row: DishCategoryVO) {
  editing.id = row.id
  editing.name = row.name
  editing.sort = row.sort
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editing.id) {
        await updateCategory(editing.id, editing.name, editing.sort)
        ElMessage.success('修改成功')
      } else {
        await createCategory(editing.name, editing.sort)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch {
      // ignore
    } finally {
      submitting.value = false
    }
  })
}

async function onDelete(row: DishCategoryVO) {
  try {
    await ElMessageBox.confirm(
      `确认删除分类「${row.name}」吗？该分类下有 ${row.dishCount || 0} 个菜品`,
      '删除分类',
      { type: 'warning' }
    )
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // cancel
  }
}

async function onMoveUp(row: DishCategoryVO) {
  const idx = list.value.findIndex((c) => c.id === row.id)
  if (idx <= 0) return
  const prev = list.value[idx - 1]
  await swapSort(row, prev)
}

async function onMoveDown(row: DishCategoryVO) {
  const idx = list.value.findIndex((c) => c.id === row.id)
  if (idx === -1 || idx >= list.value.length - 1) return
  const next = list.value[idx + 1]
  await swapSort(row, next)
}

async function swapSort(a: DishCategoryVO, b: DishCategoryVO) {
  try {
    const aSort = a.sort
    const bSort = b.sort
    await updateCategory(a.id, a.name, bSort)
    await updateCategory(b.id, b.name, aSort)
    ElMessage.success('排序已更新')
    loadData()
  } catch {
    // ignore
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.category-page {
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
.sort-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.tip {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}
</style>
