<template>
  <div class="admin-login">
    <div class="login-box">
      <div class="logo">
        <van-icon name="shop-o" size="48" color="#FF6B35" />
        <h1>味真足管理后台</h1>
        <p>管理员登录</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
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
import { useAdminStore } from '@/stores/admin'
import { login as loginApi } from '@/api/admin/auth.api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const adminStore = useAdminStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
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
      userStore.userType = 4
      userStore.userInfo = {
        id: res.adminId,
        nickname: res.nickname,
        avatar: res.avatar
      }
      adminStore.setAdminInfo({
        id: res.adminId,
        username: res.username,
        nickname: res.nickname,
        avatar: res.avatar,
        roles: res.roles,
        permissions: res.permissions
      })
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/admin/dashboard'
      router.replace(redirect)
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  })
}

function goUser() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #003a70 100%);
  .login-box {
    width: 400px;
    padding: 40px 32px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  .logo {
    text-align: center;
    margin-bottom: 32px;
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
  .actions {
    text-align: center;
  }
}
</style>
