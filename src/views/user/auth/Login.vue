<template>
  <div class="login-page">
    <div class="logo">
      <van-icon name="shop-o" size="60" color="#FF6B35" />
      <h1>味真足</h1>
      <p>足不出户，美味到家</p>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
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
          v-model="code"
          name="code"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
          center
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="countdown > 0 || sending"
              :loading="sending"
              @click.prevent="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-btn">
        <van-button block type="primary" native-type="submit" :loading="loading">
          登录 / 注册
        </van-button>
      </div>
    </van-form>

    <div class="agreement">
      <van-checkbox v-model="agreed" shape="square" icon-size="16">
        我已阅读并同意<span class="link" @click.stop="showAgreement('user')">《用户协议》</span><span class="link" @click.stop="showAgreement('privacy')">《隐私政策》</span>
      </van-checkbox>
    </div>

    <div class="other-entry">
      <p>其他身份登录</p>
      <div class="entries">
        <span class="entry" @click="goMerchant">商家端</span>
        <span class="entry" @click="goRider">骑手端</span>
        <span class="entry" @click="goAdmin">管理后台</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showFailToast, showDialog } from 'vant'
import { useUserStore } from '@/stores/user'
import { sendSmsCode } from '@/api/user/auth.api'
import { phonePattern } from '@/utils/validator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const agreed = ref(false)
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let timer: number | undefined

async function sendCode() {
  if (!phonePattern.test(phone.value)) {
    showFailToast('手机号格式错误')
    return
  }
  sending.value = true
  try {
    await sendSmsCode(phone.value, 'LOGIN')
    showSuccessToast('验证码已发送（开发环境默认 1234）')
    countdown.value = 60
    timer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch {
    // 拦截器已提示
  } finally {
    sending.value = false
  }
}

async function onSubmit() {
  if (!agreed.value) {
    showFailToast('请先同意协议')
    return
  }
  loading.value = true
  try {
    await userStore.login(phone.value, code.value, 1)
    showSuccessToast('登录成功')
    const redirect = (route.query.redirect as string) || '/user/home'
    router.replace(redirect)
  } catch {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function showAgreement(type: 'user' | 'privacy') {
  showDialog({
    title: type === 'user' ? '用户协议' : '隐私政策',
    message: type === 'user' ? '味真足用户协议内容（示例）' : '味真足隐私政策内容（示例）',
    confirmButtonText: '我知道了'
  })
}

function goMerchant() {
  router.push('/merchant/login')
}
function goRider() {
  router.push('/rider/login')
}
function goAdmin() {
  router.push('/admin/login')
}

onUnmounted(() => clearInterval(timer))
</script>

<style scoped lang="scss">
.login-page {
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
.agreement {
  padding: 16px;
  font-size: 12px;
  .link {
    color: #ff6b35;
  }
}
.other-entry {
  margin-top: 40px;
  text-align: center;
  p {
    color: #999;
    font-size: 12px;
    margin-bottom: 12px;
  }
  .entries {
    display: flex;
    justify-content: center;
    gap: 24px;
  }
  .entry {
    color: #666;
    font-size: 13px;
    cursor: pointer;
    &:active {
      color: #ff6b35;
    }
  }
}
</style>
