<template>
  <div class="admin-user">
    <h2 class="page-title">用户管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="昵称/手机号"
            clearable
            style="width: 220px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无用户数据"
      >
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.nickname?.[0] || 'U' }}
              </el-avatar>
              <div class="info">
                <div class="name">{{ row.nickname }}</div>
                <div class="phone">{{ maskPhone(row.phone) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100" align="center" />
        <el-table-column label="消费金额" width="120" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.statusDesc || (row.status === 1 ? '正常' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="最后登录" width="170">
          <template #default="{ row }">{{ formatDate(row.lastLoginAt) || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              size="small"
              link
              type="danger"
              @click="onToggleStatus(row, 0)"
            >禁用</el-button>
            <el-button
              v-else
              size="small"
              link
              type="success"
              @click="onToggleStatus(row, 1)"
            >启用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, updateUserStatus, type AdminUserVO } from '@/api/admin/manage.api'
import { formatMoney, formatDate, maskPhone } from '@/utils/format'

const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: undefined as number | undefined
})

const list = ref<AdminUserVO[]>([])
const total = ref(0)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({
      current: query.current,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status
    })
    list.value = res.records || []
    total.value = res.total || 0
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
  query.keyword = ''
  query.status = undefined
  query.current = 1
  loadData()
}

async function onToggleStatus(row: AdminUserVO, status: number) {
  const action = status === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户「${row.nickname}」吗？`, '提示', {
      type: 'warning'
    })
    await updateUserStatus(row.id, status)
    ElMessage.success(`${action}成功`)
    loadData()
  } catch {
    // cancel or error
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-user {
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
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  .info {
    .name {
      color: #333;
      font-size: 14px;
    }
    .phone {
      color: #999;
      font-size: 12px;
    }
  }
}
.money {
  color: #ff6b35;
  font-weight: 600;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
