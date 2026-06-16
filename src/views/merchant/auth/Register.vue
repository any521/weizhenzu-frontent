<template>
  <div class="merchant-register">
    <div class="register-box">
      <div class="logo">
        <van-icon name="shop-o" size="48" color="#FF6B35" />
        <h1>商家入驻</h1>
        <p>填写信息，开通店铺</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="6-20位" show-password />
        </el-form-item>
        <el-form-item label="主营类目" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择" style="width: 100%">
            <el-option label="美食" :value="1" />
            <el-option label="甜品" :value="2" />
            <el-option label="饮品" :value="3" />
            <el-option label="超市" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
        <el-form-item label="营业执照编号" prop="businessLicense">
          <el-input v-model="form.businessLicense" placeholder="请输入营业执照编号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit" style="width: 100%">
            提交申请
          </el-button>
        </el-form-item>
        <el-button link @click="goLogin">已有账号，去登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { register } from '@/api/merchant/auth.api'
import { phonePattern } from '@/utils/validator'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  name: '',
  phone: '',
  password: '',
  categoryId: undefined as number | undefined,
  address: '',
  longitude: 116.397428,
  latitude: 39.90923,
  contactName: '',
  contactPhone: '',
  businessLicense: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: phonePattern, message: '手机号格式错误', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择类目', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: phonePattern, message: '手机号格式错误', trigger: 'blur' }
  ],
  businessLicense: [{ required: true, message: '请输入营业执照编号', trigger: 'blur' }]
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await register(form)
      ElMessage.success('入驻申请已提交，请等待审核')
      router.push('/merchant/login')
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  })
}

function goLogin() {
  router.push('/merchant/login')
}
</script>

<style scoped lang="scss">
.merchant-register {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  padding: 40px 16px;
  display: flex;
  justify-content: center;
  .register-box {
    width: 500px;
    max-width: 100%;
    padding: 32px;
    background: #fff;
    border-radius: 12px;
  }
  .logo {
    text-align: center;
    margin-bottom: 24px;
    h1 {
      margin: 12px 0 4px;
      font-size: 22px;
      color: #ff6b35;
    }
    p {
      margin: 0;
      color: #999;
      font-size: 13px;
    }
  }
}
</style>
