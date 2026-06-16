<template>
  <div class="review-page">
    <h2 class="page-title">评价管理</h2>

    <!-- 筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="评分">
          <el-select
            v-model="query.rating"
            placeholder="全部评分"
            clearable
            style="width: 140px"
            @change="onSearch"
          >
            <el-option label="5 星" :value="5" />
            <el-option label="4 星" :value="4" />
            <el-option label="3 星" :value="3" />
            <el-option label="2 星" :value="2" />
            <el-option label="1 星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复状态">
          <el-select
            v-model="query.replied"
            placeholder="全部"
            clearable
            style="width: 140px"
            @change="onSearch"
          >
            <el-option label="已回复" :value="true" />
            <el-option label="未回复" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评价列表 -->
    <el-card shadow="never">
      <div v-loading="loading" class="review-list">
        <el-empty v-if="!loading && list.length === 0" description="暂无评价" />
        <div v-for="r in list" :key="r.id" class="review-item">
          <div class="user-info">
            <el-avatar :size="40" :src="r.userAvatar" />
            <div class="info">
              <div class="name">{{ r.userNickname }}</div>
              <div class="meta">
                <el-rate :model-value="r.rating" disabled size="small" />
                <span class="time">{{ formatDate(r.createdAt) }}</span>
              </div>
            </div>
            <el-tag v-if="r.reply" type="success" size="small">已回复</el-tag>
            <el-tag v-else type="warning" size="small">待回复</el-tag>
          </div>

          <div class="content">{{ r.content }}</div>

          <div v-if="r.images && r.images.length" class="images">
            <el-image
              v-for="(img, i) in r.images"
              :key="i"
              :src="img"
              :preview-src-list="r.images"
              :initial-index="i"
              preview-teleported
              style="width: 80px; height: 80px; margin-right: 6px"
              fit="cover"
            />
          </div>

          <div class="sub-ratings">
            <span>口味 {{ r.tasteRating }}★</span>
            <span>服务 {{ r.serviceRating }}★</span>
          </div>

          <div v-if="r.items && r.items.length" class="dishes">
            <el-tag v-for="d in r.items" :key="d.dishId" size="small" type="info" style="margin-right: 4px">
              {{ d.dishName }}
            </el-tag>
          </div>

          <div v-if="r.reply" class="reply-box">
            <div class="reply-label">商家回复：</div>
            <div class="reply-content">{{ r.reply }}</div>
            <div class="reply-time">{{ formatDate(r.replyTime) }}</div>
          </div>

          <div class="actions">
            <el-button
              v-if="!r.reply"
              size="small"
              type="primary"
              @click="onReply(r)"
            >回复</el-button>
            <el-button
              v-else
              size="small"
              @click="onReply(r)"
            >修改回复</el-button>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 回复弹窗 -->
    <el-dialog v-model="replyVisible" title="回复评价" width="540px">
      <template v-if="current">
        <div class="reply-preview">
          <div class="user">
            <el-avatar :size="32" :src="current.userAvatar" />
            <span>{{ current.userNickname }}</span>
            <el-rate :model-value="current.rating" disabled size="small" />
          </div>
          <div class="content">{{ current.content }}</div>
        </div>
        <el-form label-position="top">
          <el-form-item label="回复内容">
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="请输入回复内容，感谢您的支持..."
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmReply">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getReviews,
  replyReview,
  type MerchantReviewVO
} from '@/api/merchant/review.api'
import { formatDate } from '@/utils/format'

const list = ref<MerchantReviewVO[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  current: 1,
  size: 10,
  rating: undefined as number | undefined,
  replied: undefined as boolean | undefined
})

const replyVisible = ref(false)
const replyContent = ref('')
const current = ref<MerchantReviewVO | null>(null)
const submitting = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getReviews({
      current: query.current,
      size: query.size,
      rating: query.rating,
      replied: query.replied
    })
    list.value = res.records
    total.value = res.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.current = 1
  loadData()
}

function onReset() {
  query.rating = undefined
  query.replied = undefined
  query.current = 1
  loadData()
}

function onReply(r: MerchantReviewVO) {
  current.value = r
  replyContent.value = r.reply || ''
  replyVisible.value = true
}

async function confirmReply() {
  if (!current.value) return
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  submitting.value = true
  try {
    await replyReview(current.value.id, replyContent.value.trim())
    ElMessage.success('回复成功')
    replyVisible.value = false
    loadData()
  } catch {
    // ignore
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.review-page {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.search-card {
  margin-bottom: 12px;
  :deep(.el-card__body) {
    padding: 16px 16px 0;
  }
}
.review-list {
  .review-item {
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  }
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  .info {
    flex: 1;
    .name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      .time {
        color: #999;
        font-size: 12px;
      }
    }
  }
}
.content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
}
.images {
  margin-bottom: 10px;
}
.sub-ratings {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
  margin-bottom: 10px;
}
.dishes {
  margin-bottom: 10px;
}
.reply-box {
  background: #fafafa;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  .reply-label {
    color: #ff6b35;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .reply-content {
    color: #666;
    font-size: 13px;
    line-height: 1.5;
  }
  .reply-time {
    color: #999;
    font-size: 12px;
    margin-top: 6px;
  }
}
.actions {
  text-align: right;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.reply-preview {
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  .user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    color: #333;
  }
  .content {
    color: #666;
    font-size: 13px;
    margin: 0;
  }
}
</style>
