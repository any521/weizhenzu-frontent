<template>
  <div class="rider-login">
    <div class="logo">
      <van-icon name="logistics" size="60" color="#FF6B35" />
      <h1>味真足骑手</h1>
      <p>登录开始接单</p>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: phonePattern, message: '手机号格式错误' }
          ]"
        />
        <van-field
          v-model="form.password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>

      <div class="submit-btn">
        <van-button block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>

      <div class="other-entry">
        <span @click="goUser">用户端</span>
        <span @click="goMerchant">商家端</span>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useRiderStore } from '@/stores/rider'
import { login as loginApi } from '@/api/rider/auth.api'
import { phonePattern } from '@/utils/validator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const riderStore = useRiderStore()

const loading = ref(false)
const form = reactive({
  phone: '',
  password: ''
})

async function onSubmit() {
  loading.value = true
  try {
    const res = await loginApi(form)
    userStore.token = res.token
    userStore.refreshToken = res.refreshToken
    userStore.userType = 3
    userStore.userInfo = {
      id: res.riderId,
      nickname: res.name,
      avatar: res.avatar
    }
    riderStore.setRiderInfo({
      id: res.riderId,
      name: res.name,
      phone: res.phone,
      avatar: res.avatar,
      status: 1
    })
    showSuccessToast('登录成功')
    const redirect = (route.query.redirect as string) || '/rider/hall'
    router.replace(redirect)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function goUser() {
  router.push('/login')
}
function goMerchant() {
  router.push('/merchant/login')
}
</script>

<style scoped lang="scss">
.rider-login {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5ed 0%, #fff 30%);
  padding: 60px 16px;
}
.logo {
  text-align: center;
  margin-bottom: 40px;
  h1 {
    margin: 12px 0 4px;
    font-size: 28px;
    color: #ff6b35;
  }
  p {
    margin: 0;
    color: #999;
    font-size: 13px;
  }
}
.submit-btn {
  padding: 20px 16px 0;
}
.other-entry {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  color: #666;
  font-size: 13px;
  span {
    cursor: pointer;
    &:active {
      color: #ff6b35;
    }
  }
}
</style>
