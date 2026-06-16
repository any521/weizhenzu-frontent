<template>
  <div class="dish-edit">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑菜品' : '新增菜品' }}</h2>
      <el-button :icon="ArrowLeft" @click="onBack">返回</el-button>
    </div>

    <el-form
      ref="formRef"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="max-width: 800px"
    >
      <!-- 基本信息 -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">基本信息</span></template>
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜品名称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 240px">
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入菜品描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签">
          <div class="tags-input">
            <el-tag
              v-for="(tag, i) in form.tags"
              :key="i"
              closable
              @close="form.tags!.splice(i, 1)"
              style="margin-right: 6px"
            >{{ tag }}</el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              style="width: 100px"
              @keyup.enter="addTag"
              @blur="addTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
          </div>
        </el-form-item>
      </el-card>

      <!-- 价格库存 -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">价格与库存</span></template>
        <el-form-item label="售价" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="0.5"
            controls-position="right"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number
            v-model="form.originalPrice"
            :min="0"
            :precision="2"
            :step="0.5"
            controls-position="right"
          />
          <span class="unit">元（划线价，可选）</span>
        </el-form-item>
        <el-form-item label="包装费" prop="boxPrice">
          <el-input-number
            v-model="form.boxPrice"
            :min="0"
            :precision="1"
            :step="0.5"
            controls-position="right"
          />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="10" controls-position="right" />
          <span class="unit">份</span>
        </el-form-item>
      </el-card>

      <!-- 规格设置 -->
      <el-card shadow="never" class="form-card">
        <template #header>
          <div class="card-header-flex">
            <span class="card-title">规格设置</span>
            <el-button type="primary" size="small" :icon="Plus" @click="addSpec">添加规格</el-button>
          </div>
        </template>
        <el-table v-if="form.specs && form.specs.length" :data="form.specs" border size="small">
          <el-table-column label="规格名称" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.name" placeholder="如：大份/小份" />
            </template>
          </el-table-column>
          <el-table-column label="加价（元）" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.price" :min="0" :precision="2" :step="0.5" controls-position="right" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="库存" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.stock" :min="0" :step="10" controls-position="right" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button size="small" link type="danger" @click="form.specs!.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无规格，可添加大份/小份等" :image-size="60" />
      </el-card>

      <!-- 图片上传 -->
      <el-card shadow="never" class="form-card">
        <template #header><span class="card-title">菜品图片</span></template>
        <el-form-item label="主图">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleMainImageUpload"
            accept="image/*"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸 750x750，大小不超过 5MB</div>
        </el-form-item>
        <el-form-item label="详情图">
          <el-upload
            class="images-uploader"
            list-type="picture-card"
            :file-list="imageFileList"
            :before-upload="beforeUpload"
            :http-request="handleImageUpload"
            :on-remove="onRemoveImage"
            accept="image/*"
            :limit="6"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传 6 张</div>
        </el-form-item>
      </el-card>

      <!-- 操作 -->
      <div class="form-actions">
        <el-button @click="onBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">
          {{ isEdit ? '保存修改' : '创建菜品' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadRequestOptions } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import {
  getDishDetail,
  createDish,
  updateDish,
  getCategories,
  type MerchantDishVO,
  type DishCategoryVO,
  type MerchantDishDTO
} from '@/api/merchant/dish.api'

const route = useRoute()
const router = useRouter()

const dishId = computed(() => (route.params.id ? Number(route.params.id) : 0))
const isEdit = computed(() => dishId.value > 0)

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const categories = ref<DishCategoryVO[]>([])

const form = reactive<MerchantDishDTO>({
  categoryId: undefined as any,
  name: '',
  description: '',
  image: '',
  images: [],
  price: 0,
  originalPrice: undefined,
  boxPrice: 0,
  stock: 99,
  tags: [],
  specs: []
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  boxPrice: [{ required: true, message: '请输入包装费', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

// 标签输入
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<any>()

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function addTag() {
  const v = tagInputValue.value.trim()
  if (v && !form.tags!.includes(v)) {
    form.tags!.push(v)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

// 规格管理
function addSpec() {
  form.specs!.push({ name: '', price: 0, stock: 0 })
}

// 图片上传
const imageFileList = ref<any[]>([])

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

async function handleMainImageUpload(options: UploadRequestOptions) {
  // 实际项目中应上传到服务器，这里用 FileReader 转 base64 占位
  const file = options.file as File
  const reader = new FileReader()
  reader.onload = (e) => {
    form.image = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleImageUpload(options: UploadRequestOptions) {
  const file = options.file as File
  const reader = new FileReader()
  reader.onload = (e) => {
    const url = e.target?.result as string
    form.images!.push(url)
    imageFileList.value.push({ name: file.name, url })
  }
  reader.readAsDataURL(file)
}

function onRemoveImage(file: any) {
  const idx = imageFileList.value.findIndex((f) => f.url === file.url)
  if (idx > -1) {
    imageFileList.value.splice(idx, 1)
    form.images!.splice(idx, 1)
  }
}

async function loadData() {
  loading.value = true
  try {
    const [cats] = await Promise.all([getCategories()])
    categories.value = cats
    if (isEdit.value) {
      const detail = await getDishDetail(dishId.value)
      form.categoryId = detail.categoryId
      form.name = detail.name
      form.description = detail.description
      form.image = detail.image
      form.images = detail.specs ? [] : (detail as any).images || []
      form.price = detail.price
      form.originalPrice = detail.originalPrice
      form.boxPrice = detail.boxPrice
      form.stock = detail.stock
      form.tags = detail.tags || []
      form.specs = (detail.specs || []).map((s) => ({
        name: s.name,
        price: s.price,
        stock: s.stock
      }))
      // 还原详情图列表
      if (form.images && form.images.length) {
        imageFileList.value = form.images.map((url, i) => ({ name: `image-${i}`, url }))
      }
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!form.image) {
      ElMessage.warning('请上传菜品主图')
      return
    }
    submitting.value = true
    try {
      const payload: MerchantDishDTO = {
        ...form,
        specs: (form.specs || []).filter((s) => s.name)
      }
      if (isEdit.value) {
        await updateDish(dishId.value, payload)
        ElMessage.success('修改成功')
      } else {
        await createDish(payload)
        ElMessage.success('创建成功')
      }
      router.push('/merchant/dishes')
    } catch {
      // ignore
    } finally {
      submitting.value = false
    }
  })
}

function onBack() {
  router.back()
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.dish-edit {
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
.form-card {
  margin-bottom: 16px;
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  .card-header-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.unit {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}
.tags-input {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.upload-tip {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      border-color: #ff6b35;
    }
  }
  .avatar {
    width: 120px;
    height: 120px;
    object-fit: cover;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }
}
.images-uploader {
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
