<template>
  <div class="merchant-login">
    <div class="login-box">
      <div class="logo">
        <van-icon name="shop-o" size="48" color="#FF6B35" />
        <h1>味真足商家</h1>
        <p>登录管理店铺</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="手机号/用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
        <div class="actions">
          <el-button link @click="goRegister">商家入驻</el-button>
          <el-button link @click="goUser">用户端</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { login as loginApi } from '@/api/merchant/auth.api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  account: '',
  password: ''
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ]
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await loginApi(form)
      userStore.token = res.token
      userStore.refreshToken = res.refreshToken
      userStore.userType = 2
      userStore.userInfo = {
        id: res.merchantId,
        nickname: res.name,
        avatar: res.logo
      }
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/merchant/dashboard'
      router.replace(redirect)
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  })
}

function goRegister() {
  router.push('/merchant/register')
}
function goUser() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.merchant-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  .login-box {
    width: 400px;
    padding: 40px 32px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  .logo {
    text-align: center;
    margin-bottom: 32px;
    h1 {
      margin: 12px 0 4px;
      font-size: 24px;
      color: #ff6b35;
    }
    p {
      margin: 0;
      color: #999;
      font-size: 13px;
    }
  }
  .actions {
    display: flex;
    justify-content: space-between;
  }
}
</style>
