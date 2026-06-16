<template>
  <div class="admin-category">
    <h2 class="page-title">类目管理</h2>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商家类目列表</span>
          <el-button type="primary" :icon="Plus" @click="onAdd">新增类目</el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        :tree-props="{ children: 'children' }"
        stripe
        default-expand-all
        style="width: 100%"
        empty-text="暂无类目数据"
      >
        <el-table-column prop="name" label="类目名称" min-width="200" />
        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.icon"
              :src="row.icon"
              style="width: 32px; height: 32px"
              fit="cover"
            />
            <span v-else class="sub">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantCount" label="商家数" width="100" align="center" />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onAddChild(row)">新增子类</el-button>
            <el-button size="small" link type="primary" @click="onEdit(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="formTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级类目">
          <el-tree-select
            v-model="form.parentId"
            :data="treeOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            placeholder="不选为顶级类目"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类目名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="form.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
import { formatDate } from '@/utils/format'

interface Category {
  id: number
  parentId: number
  name: string
  icon: string
  sort: number
  status: number
  merchantCount: number
  createdAt: string
  children?: Category[]
}

const list = ref<Category[]>([])
const loading = ref(false)

const formVisible = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: 0,
  parentId: undefined as number | undefined,
  name: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }]
}

const formTitle = computed(() => (isEdit.value ? '编辑类目' : '新增类目'))

const treeOptions = computed<Category[]>(() => {
  const root: Category = {
    id: 0,
    parentId: -1,
    name: '顶级类目',
    icon: '',
    sort: 0,
    status: 1,
    merchantCount: 0,
    createdAt: ''
  }
  return [root, ...list.value]
})

async function loadData() {
  loading.value = true
  try {
    const res = await request<Category[]>({
      url: '/admin/categories',
      method: 'GET'
    })
    list.value = res || []
  } catch {
    // 接口未实现时使用兜底数据
    list.value = [
      { id: 1, parentId: 0, name: '美食', icon: '', sort: 1, status: 1, merchantCount: 128, createdAt: '2024-01-01 10:00:00' },
      { id: 2, parentId: 0, name: '甜品饮品', icon: '', sort: 2, status: 1, merchantCount: 56, createdAt: '2024-01-01 10:00:00' },
      { id: 3, parentId: 0, name: '生鲜果蔬', icon: '', sort: 3, status: 1, merchantCount: 32, createdAt: '2024-01-01 10:00:00' },
      { id: 4, parentId: 0, name: '超市便利', icon: '', sort: 4, status: 1, merchantCount: 24, createdAt: '2024-01-01 10:00:00' },
      { id: 5, parentId: 0, name: '医药健康', icon: '', sort: 5, status: 0, merchantCount: 12, createdAt: '2024-01-01 10:00:00' }
    ]
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = 0
  form.parentId = undefined
  form.name = ''
  form.icon = ''
  form.sort = 0
  form.status = 1
}

function onAdd() {
  isEdit.value = false
  resetForm()
  formVisible.value = true
}

function onAddChild(row: Category) {
  isEdit.value = false
  resetForm()
  form.parentId = row.id
  formVisible.value = true
}

function onEdit(row: Category) {
  isEdit.value = true
  form.id = row.id
  form.parentId = row.parentId || undefined
  form.name = row.name
  form.icon = row.icon
  form.sort = row.sort
  form.status = row.status
  formVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await request({
          url: `/admin/categories/${form.id}`,
          method: 'PUT',
          data: form
        })
      } else {
        await request({
          url: '/admin/categories',
          method: 'POST',
          data: form
        })
      }
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      formVisible.value = false
      loadData()
    } catch {
      // ignore
    } finally {
      submitLoading.value = false
    }
  })
}

async function onDelete(row: Category) {
  try {
    await ElMessageBox.confirm(
      `确定要删除类目「${row.name}」吗？该操作不可恢复`,
      '删除确认',
      { type: 'warning' }
    )
    await request({
      url: `/admin/categories/${row.id}`,
      method: 'DELETE'
    })
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-category {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sub {
  color: #999;
}
</style>
