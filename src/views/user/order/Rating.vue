<template>
  <div class="rating-page">
    <AppHeader title="评价" show-back />

    <div v-if="loading" class="loading-wrap">
      <van-loading type="spinner" color="#FF6B35" />
    </div>

    <template v-else-if="order">
      <!-- 商家信息 -->
      <div class="merchant-card">
        <van-image :src="order.merchantLogo" width="40" height="40" radius="6" fit="cover" />
        <span class="name">{{ order.merchantName }}</span>
      </div>

      <!-- 总体评分 -->
      <div class="rate-card">
        <h3 class="card-title">总体评分</h3>
        <van-rate
          v-model="form.rating"
          :size="32"
          color="#FF6B35"
          void-color="#eee"
          allow-half
        />
        <p class="rate-text">{{ ratingText }}</p>
      </div>

      <!-- 分项评分 -->
      <van-cell-group inset title="分项评分">
        <van-cell title="口味">
          <template #right-icon>
            <van-rate v-model="form.tasteRating" :size="18" color="#FF6B35" allow-half />
          </template>
        </van-cell>
        <van-cell title="服务">
          <template #right-icon>
            <van-rate v-model="form.serviceRating" :size="18" color="#FF6B35" allow-half />
          </template>
        </van-cell>
        <van-cell title="配送">
          <template #right-icon>
            <van-rate v-model="form.deliveryRating" :size="18" color="#FF6B35" allow-half />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 评价内容 -->
      <div class="content-card">
        <h3 class="card-title">评价内容</h3>
        <van-field
          v-model="form.content"
          type="textarea"
          placeholder="请写下您的用餐感受，给其他用户参考吧～"
          rows="4"
          maxlength="500"
          show-word-limit
          autosize
        />
        <div class="quick-tags">
          <van-tag
            v-for="t in quickTags"
            :key="t"
            :plain="!selectedTags.includes(t)"
            round
            :color="selectedTags.includes(t) ? '#FF6B35' : '#fff5ed'"
            :text-color="selectedTags.includes(t) ? '#fff' : '#FF6B35'"
            size="medium"
            @click="toggleTag(t)"
          >{{ t }}</van-tag>
        </div>
      </div>

      <!-- 图片上传 -->
      <div class="image-card">
        <h3 class="card-title">上传图片（最多6张）</h3>
        <van-uploader
          v-model="fileList"
          multiple
          :max-count="6"
          :max-size="5 * 1024 * 1024"
          :after-read="onAfterRead"
          @oversize="onOversize"
        />
      </div>

      <!-- 匿名 -->
      <van-cell-group inset>
        <van-cell title="匿名评价">
          <template #right-icon>
            <van-switch v-model="anonymous" size="22" active-color="#FF6B35" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 提交 -->
      <div class="bottom-bar">
        <van-button
          type="primary"
          round
          block
          :loading="submitting"
          :disabled="form.rating === 0 || !form.content"
          @click="onSubmit"
        >提交评价</van-button>
      </div>
    </template>

    <EmptyState v-else description="订单不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import type { UploaderFileListItem } from 'vant'
import AppHeader from '@/components/common/AppHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { getOrderDetail, type OrderVO } from '@/api/user/order.api'
import { createReview } from '@/api/user/review.api'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const order = ref<OrderVO | null>(null)
const loading = ref(true)
const submitting = ref(false)
const anonymous = ref(false)
const fileList = ref<UploaderFileListItem[]>([])
const imageUrls = ref<string[]>([])

const form = reactive({
  rating: 5,
  content: '',
  tasteRating: 5,
  serviceRating: 5,
  deliveryRating: 5
})

const quickTags = ['味道不错', '分量足', '包装精美', '配送快', '服务态度好', '环境干净', '性价比高', '会回购']
const selectedTags = ref<string[]>([])

const ratingText = computed(() => {
  const r = form.rating
  if (r >= 5) return '非常满意，强烈推荐'
  if (r >= 4) return '满意'
  if (r >= 3) return '一般'
  if (r >= 2) return '较差'
  return '非常差'
})

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
  // 同步到 content
  if (selectedTags.value.length) {
    form.content = form.content.replace(/^[\s\S]*?(?=\n|$)/, '').trim()
  }
}

function onAfterRead(file: UploaderFileListItem | UploaderFileListItem[]) {
  const files = Array.isArray(file) ? file : [file]
  files.forEach(f => {
    // 这里实际项目中应上传到服务器，这里用 base64 占位
    if (f.content) imageUrls.value.push(f.content)
  })
}

function onOversize() {
  showFailToast('图片大小不能超过 5MB')
}

async function loadOrder() {
  loading.value = true
  try {
    order.value = await getOrderDetail(orderId)
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (form.rating === 0) {
    showFailToast('请选择评分')
    return
  }
  if (!form.content.trim()) {
    showFailToast('请填写评价内容')
    return
  }
  submitting.value = true
  try {
    const content = selectedTags.value.length
      ? `[${selectedTags.value.join('、')}] ${form.content}`
      : form.content
    await createReview({
      orderId,
      rating: form.rating,
      content,
      images: imageUrls.value,
      tasteRating: form.tasteRating,
      serviceRating: form.serviceRating,
      deliveryRating: form.deliveryRating
    })
    showSuccessToast('评价成功')
    setTimeout(() => router.replace(`/user/order/${orderId}`), 500)
  } catch (e: any) {
    showFailToast(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadOrder)
</script>

<style scoped lang="scss">
.rating-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.merchant-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 10px;
  .name {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }
}
.rate-card {
  background: #fff;
  padding: 20px 16px;
  text-align: center;
  margin-bottom: 10px;
  .card-title {
    margin: 0 0 12px;
    font-size: 14px;
    color: #666;
    font-weight: normal;
  }
  .rate-text {
    margin: 12px 0 0;
    font-size: 13px;
    color: #ff6b35;
  }
}
.content-card,
.image-card {
  background: #fff;
  margin: 10px 12px;
  padding: 12px;
  border-radius: 8px;
  .card-title {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 99;
  .van-button {
    height: 44px;
  }
}
</style>
