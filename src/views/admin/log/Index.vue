<template>
  <div class="admin-log">
    <h2 class="page-title">操作日志</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="操作人">
          <el-input
            v-model="query.keyword"
            placeholder="用户名/昵称"
            clearable
            style="width: 200px"
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="query.module" placeholder="全部模块" clearable style="width: 160px">
            <el-option label="用户管理" value="user" />
            <el-option label="商家管理" value="merchant" />
            <el-option label="订单管理" value="order" />
            <el-option label="退款管理" value="refund" />
            <el-option label="财务管理" value="finance" />
            <el-option label="系统设置" value="system" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="query.action" placeholder="全部" clearable style="width: 140px">
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="审核" value="audit" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无操作日志"
      >
        <el-table-column prop="username" label="操作人" width="140">
          <template #default="{ row }">
            <div>{{ row.nickname || row.username }}</div>
            <div class="sub">{{ row.username }}</div>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getModuleText(row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small" effect="plain">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="240" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column label="耗时" width="100" align="right">
          <template #default="{ row }">{{ row.cost }}ms</template>
        </el-table-column>
        <el-table-column label="操作时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="640px" destroy-on-close>
      <el-descriptions v-if="current" :column="2" border>
        <el-descriptions-item label="操作人">{{ current.nickname || current.username }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ current.username }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ getModuleText(current.module) }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getActionText(current.action) }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ current.ip }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ current.cost }}ms</el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">{{ formatDate(current.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ current.description }}</el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ current.method }} {{ current.url }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre class="code-block">{{ current.params }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2">
          <pre class="code-block">{{ current.response }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { request } from '@/api/request'
import { formatDate } from '@/utils/format'

interface LogItem {
  id: number
  username: string
  nickname: string
  module: string
  action: string
  description: string
  ip: string
  cost: number
  method: string
  url: string
  params: string
  response: string
  createdAt: string
}

const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  current: 1,
  size: 20,
  keyword: '',
  module: undefined as string | undefined,
  action: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

const list = ref<LogItem[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const current = ref<LogItem | null>(null)

function getModuleText(module: string) {
  const map: Record<string, string> = {
    user: '用户管理',
    merchant: '商家管理',
    order: '订单管理',
    refund: '退款管理',
    finance: '财务管理',
    system: '系统设置',
    other: '其他'
  }
  return map[module] || module
}

function getActionType(action: string) {
  const map: Record<string, string> = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    audit: 'warning',
    login: 'info',
    logout: 'info'
  }
  return map[action] || 'info'
}

function getActionText(action: string) {
  const map: Record<string, string> = {
    create: '新增',
    update: '修改',
    delete: '删除',
    audit: '审核',
    login: '登录',
    logout: '登出'
  }
  return map[action] || action
}

async function loadData() {
  loading.value = true
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      query.startDate = dateRange.value[0]
      query.endDate = dateRange.value[1]
    } else {
      query.startDate = undefined
      query.endDate = undefined
    }
    const res = await request<{ records: LogItem[]; total: number }>({
      url: '/admin/logs',
      method: 'GET',
      params: query
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // 兜底数据
    list.value = [
      {
        id: 1, username: 'admin', nickname: '超级管理员', module: 'user', action: 'update',
        description: '禁用用户「张三」', ip: '192.168.1.100', cost: 35, method: 'PUT',
        url: '/admin/users/123/status', params: '{"status":0}', response: '{"code":200}',
        createdAt: '2024-06-17 10:30:00'
      },
      {
        id: 2, username: 'operator01', nickname: '运营小王', module: 'merchant', action: 'audit',
        description: '审核通过商家「味真足总店」', ip: '192.168.1.101', cost: 52, method: 'POST',
        url: '/admin/merchants/456/audit', params: '{"approved":true}', response: '{"code":200}',
        createdAt: '2024-06-17 11:00:00'
      },
      {
        id: 3, username: 'admin', nickname: '超级管理员', module: 'refund', action: 'audit',
        description: '审核通过退款单 RF202406170001，金额 ¥58.00', ip: '192.168.1.100', cost: 48,
        method: 'POST', url: '/admin/refunds/789/audit', params: '{"approved":true}',
        response: '{"code":200}', createdAt: '2024-06-17 14:20:00'
      },
      {
        id: 4, username: 'admin', nickname: '超级管理员', module: 'system', action: 'update',
        description: '修改平台抽成比例为 15%', ip: '192.168.1.100', cost: 28, method: 'PUT',
        url: '/admin/system/basic', params: '{"commissionRate":15}', response: '{"code":200}',
        createdAt: '2024-06-17 15:00:00'
      },
      {
        id: 5, username: 'admin', nickname: '超级管理员', module: 'other', action: 'login',
        description: '管理员登录', ip: '192.168.1.100', cost: 120, method: 'POST',
        url: '/admin/auth/login', params: '{"username":"admin"}', response: '{"code":200}',
        createdAt: '2024-06-17 09:00:00'
      }
    ]
    total.value = list.value.length
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
  query.module = undefined
  query.action = undefined
  dateRange.value = null
  query.current = 1
  loadData()
}

function onDetail(row: LogItem) {
  current.value = row
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.admin-log {
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
.sub {
  color: #999;
  font-size: 12px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.code-block {
  margin: 0;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
