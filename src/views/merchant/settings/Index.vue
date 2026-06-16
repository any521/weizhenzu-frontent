<template>
  <div class="settings-page">
    <h2 class="page-title">店铺设置</h2>

    <el-tabs v-model="activeTab" tab-position="left" class="settings-tabs">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-card shadow="never" v-loading="loading">
          <template #header><span class="card-title">基本信息</span></template>
          <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="120px" style="max-width: 640px">
            <el-form-item label="店铺Logo">
              <el-upload
                class="logo-uploader"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleLogoUpload"
                accept="image/*"
              >
                <img v-if="basicForm.logo" :src="basicForm.logo" class="logo" />
                <el-icon v-else class="uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="店铺封面">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :before-upload="beforeUpload"
                :http-request="handleCoverUpload"
                accept="image/*"
              >
                <img v-if="basicForm.coverImage" :src="basicForm.coverImage" class="cover" />
                <el-icon v-else class="uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="店铺名称" prop="name">
              <el-input v-model="basicForm.name" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="basicForm.phone" maxlength="11" />
            </el-form-item>
            <el-form-item label="联系人" prop="contactName">
              <el-input v-model="basicForm.contactName" />
            </el-form-item>
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="basicForm.contactPhone" maxlength="11" />
            </el-form-item>
            <el-form-item label="店铺地址" prop="address">
              <el-input v-model="basicForm.address" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="店铺简介">
              <el-input
                v-model="basicForm.description"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="店铺公告">
              <el-input
                v-model="basicForm.notice"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="onSaveBasic">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 营业时间 -->
      <el-tab-pane label="营业时间" name="hours">
        <el-card shadow="never" v-loading="loading">
          <template #header><span class="card-title">营业时间</span></template>
          <el-form :model="basicForm" label-width="120px" style="max-width: 640px">
            <el-form-item label="营业时间">
              <el-time-picker
                v-model="openTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="开始时间"
                style="width: 140px"
              />
              <span style="margin: 0 8px">至</span>
              <el-time-picker
                v-model="closeTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="结束时间"
                style="width: 140px"
              />
            </el-form-item>
            <el-form-item label="平均配送时长">
              <el-input-number v-model="basicForm.deliveryTime" :min="0" :max="120" :step="5" controls-position="right" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="营业状态">
              <el-switch
                v-model="businessOpen"
                active-text="营业中"
                inactive-text="休息中"
                @change="onToggleBusiness"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="onSaveHours">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 配送设置 -->
      <el-tab-pane label="配送设置" name="delivery">
        <el-card shadow="never" v-loading="loading">
          <template #header><span class="card-title">配送设置</span></template>
          <el-form ref="deliveryFormRef" :model="basicForm" :rules="deliveryRules" label-width="120px" style="max-width: 640px">
            <el-form-item label="配送费" prop="deliveryFee">
              <el-input-number v-model="basicForm.deliveryFee" :min="0" :precision="1" :step="0.5" controls-position="right" />
              <span class="unit">元</span>
            </el-form-item>
            <el-form-item label="包装费" prop="packingFee">
              <el-input-number v-model="basicForm.packingFee" :min="0" :precision="1" :step="0.5" controls-position="right" />
              <span class="unit">元</span>
            </el-form-item>
            <el-form-item label="起送价" prop="minOrderAmount">
              <el-input-number v-model="basicForm.minOrderAmount" :min="0" :precision="1" :step="5" controls-position="right" />
              <span class="unit">元</span>
            </el-form-item>
            <el-form-item label="平均价格">
              <el-input-number v-model="basicForm.avgPrice" :min="0" :precision="1" :step="5" controls-position="right" />
              <span class="unit">元</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="onSaveDelivery">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 修改密码 -->
      <el-tab-pane label="修改密码" name="password">
        <el-card shadow="never">
          <template #header><span class="card-title">修改密码</span></template>
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="120px" style="max-width: 540px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="pwdSaving" @click="onChangePassword">确认修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getProfile,
  updateProfile,
  updatePassword,
  toggleBusinessStatus,
  type MerchantProfileVO
} from '@/api/merchant/auth.api'

const activeTab = ref('basic')
const loading = ref(false)
const saving = ref(false)
const pwdSaving = ref(false)

const basicFormRef = ref<FormInstance>()
const deliveryFormRef = ref<FormInstance>()
const pwdFormRef = ref<FormInstance>()

const basicForm = reactive<Partial<MerchantProfileVO>>({
  name: '',
  logo: '',
  coverImage: '',
  phone: '',
  contactName: '',
  contactPhone: '',
  address: '',
  description: '',
  notice: '',
  avgPrice: 0,
  deliveryFee: 0,
  packingFee: 0,
  minOrderAmount: 0,
  deliveryTime: 30,
  openingHours: ''
})

const businessOpen = ref(false)
const openTime = ref('')
const closeTime = ref('')

const basicRules: FormRules = {
  name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系人电话', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入店铺地址', trigger: 'blur' }]
}

const deliveryRules: FormRules = {
  deliveryFee: [{ required: true, message: '请输入配送费', trigger: 'blur' }],
  packingFee: [{ required: true, message: '请输入包装费', trigger: 'blur' }],
  minOrderAmount: [{ required: true, message: '请输入起送价', trigger: 'blur' }]
}

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (_rule: any, value: string, callback: any) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

async function loadProfile() {
  loading.value = true
  try {
    const profile = await getProfile()
    Object.assign(basicForm, profile)
    businessOpen.value = profile.status === 1
    // 解析营业时间
    if (profile.openingHours) {
      const parts = profile.openingHours.split('-')
      if (parts.length === 2) {
        openTime.value = parts[0].trim()
        closeTime.value = parts[1].trim()
      }
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

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

async function handleLogoUpload(options: UploadRequestOptions) {
  const file = options.file as File
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.logo = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleCoverUpload(options: UploadRequestOptions) {
  const file = options.file as File
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.coverImage = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function onSaveBasic() {
  if (!basicFormRef.value) return
  await basicFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await updateProfile(basicForm)
      ElMessage.success('保存成功')
    } catch {
      // ignore
    } finally {
      saving.value = false
    }
  })
}

async function onSaveHours() {
  if (!openTime.value || !closeTime.value) {
    ElMessage.warning('请选择营业时间')
    return
  }
  saving.value = true
  try {
    basicForm.openingHours = `${openTime.value}-${closeTime.value}`
    await updateProfile({ openingHours: basicForm.openingHours, deliveryTime: basicForm.deliveryTime })
    ElMessage.success('保存成功')
  } catch {
    // ignore
  } finally {
    saving.value = false
  }
}

async function onSaveDelivery() {
  if (!deliveryFormRef.value) return
  await deliveryFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await updateProfile({
        deliveryFee: basicForm.deliveryFee,
        packingFee: basicForm.packingFee,
        minOrderAmount: basicForm.minOrderAmount,
        avgPrice: basicForm.avgPrice
      })
      ElMessage.success('保存成功')
    } catch {
      // ignore
    } finally {
      saving.value = false
    }
  })
}

async function onToggleBusiness(v: any) {
  try {
    await toggleBusinessStatus(v as boolean)
    ElMessage.success(v ? '已开启营业' : '已关闭营业')
  } catch {
    businessOpen.value = !v
  }
}

async function onChangePassword() {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    pwdSaving.value = true
    try {
      await updatePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      ElMessage.success('密码修改成功')
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
    } catch {
      // ignore
    } finally {
      pwdSaving.value = false
    }
  })
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.settings-page {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.settings-tabs {
  min-height: 500px;
  :deep(.el-tabs__header) {
    margin-right: 16px;
  }
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.unit {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}
.logo-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    &:hover {
      border-color: #ff6b35;
    }
  }
  .logo {
    width: 100px;
    height: 100px;
    object-fit: cover;
  }
}
.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 240px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    &:hover {
      border-color: #ff6b35;
    }
  }
  .cover {
    width: 240px;
    height: 120px;
    object-fit: cover;
  }
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
