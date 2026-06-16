<template>
  <div class="merchant-audit">
    <h2 class="page-title">商家审核</h2>

    <!-- 状态筛选 -->
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="待审核" :name="3" />
      <el-tab-pane label="已通过" :name="1" />
      <el-tab-pane label="已拒绝" :name="-1" />
    </el-tabs>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        style="width: 100%"
        empty-text="暂无待审核商家"
      >
        <el-table-column label="商家" min-width="200">
          <template #default="{ row }">
            <div class="merchant-cell">
              <el-avatar :size="40" :src="row.logo" shape="square">
                {{ row.name?.[0] || 'M' }}
              </el-avatar>
              <div class="info">
                <div class="name">{{ row.name }}</div>
                <div class="phone">{{ maskPhone(row.phone) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="类目" width="120" />
        <el-table-column label="联系人" width="140">
          <template #default="{ row }">
            <div>{{ row.contactName }}</div>
            <div class="sub">{{ maskPhone(row.contactPhone) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="营业执照" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.businessLicense"
              :src="row.businessLicense"
              style="width: 50px; height: 36px"
              fit="cover"
              :preview-src-list="[row.businessLicense]"
              preview-teleported
            />
            <span v-else class="sub">未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="onDetail(row)">查看</el-button>
            <template v-if="activeTab === 3">
              <el-button size="small" link type="success" @click="onApprove(row)">通过</el-button>
              <el-button size="small" link type="danger" @click="onReject(row)">拒绝</el-button>
            </template>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="商家详情" width="640px" destroy-on-close>
      <el-descriptions v-if="current" :column="2" border>
        <el-descriptions-item label="商家名称">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="类目">{{ current.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ maskPhone(current.phone) }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ current.contactName }}</el-descriptions-item>
        <el-descriptions-item label="联系手机">{{ maskPhone(current.contactPhone) }}</el-descriptions-item>
        <el-descriptions-item label="评分">★ {{ current.rating?.toFixed(1) || '0.0' }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ current.address }}</el-descriptions-item>
        <el-descriptions-item label="营业执照" :span="2">
          <el-image
            v-if="current.businessLicense"
            :src="current.businessLicense"
            style="width: 200px; height: 140px"
            fit="cover"
            :preview-src-list="[current.businessLicense]"
            preview-teleported
          />
          <span v-else>未上传</span>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">{{ formatDate(current.createdAt) }}</el-descriptions-item>
      </el-descriptions>
      <template v-if="current && activeTab === 3" #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="onApprove(current)">审核通过</el-button>
        <el-button type="danger" @click="onReject(current)">审核拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectVisible" title="审核拒绝" width="460px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-select v-model="rejectForm.reason" placeholder="请选择" style="width: 100%">
            <el-option label="营业执照不清晰" value="营业执照不清晰" />
            <el-option label="信息填写不完整" value="信息填写不完整" />
            <el-option label="类目选择错误" value="类目选择错误" />
            <el-option label="地址异常" value="地址异常" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="rejectForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入详细原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMerchants,
  auditMerchant,
  type AdminMerchantVO
} from '@/api/admin/manage.api'
import { formatDate, maskPhone } from '@/utils/format'

const activeTab = ref(3)
const query = reactive({
  current: 1,
  size: 10
})

const list = ref<AdminMerchantVO[]>([])
const total = ref(0)
const loading = ref(false)

const detailVisible = ref(false)
const current = ref<AdminMerchantVO | null>(null)

const rejectVisible = ref(false)
const rejectForm = reactive({ reason: '', remark: '' })
const rejectId = ref<number>(0)
const actionLoading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await getMerchants({
      current: query.current,
      size: query.size,
      status: activeTab.value
    })
    list.value = res.records || []
    total.value = res.total || 0
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  query.current = 1
  loadData()
}

function onDetail(row: AdminMerchantVO) {
  current.value = row
  detailVisible.value = true
}

async function onApprove(row: AdminMerchantVO) {
  try {
    await ElMessageBox.confirm(`确认通过商家「${row.name}」的审核吗？`, '审核通过', {
      type: 'success'
    })
    await auditMerchant(row.id, { approved: true })
    ElMessage.success('审核通过')
    detailVisible.value = false
    loadData()
  } catch {
    // cancel or error
  }
}

function onReject(row: AdminMerchantVO) {
  rejectId.value = row.id
  rejectForm.reason = ''
  rejectForm.remark = ''
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }
  const reason = rejectForm.remark
    ? `${rejectForm.reason}：${rejectForm.remark}`
    : rejectForm.reason
  actionLoading.value = true
  try {
    await auditMerchant(rejectId.value, { approved: false, reason })
    ElMessage.success('已拒绝')
    rejectVisible.value = false
    detailVisible.value = false
    loadData()
  } catch {
    // ignore
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.merchant-audit {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.merchant-cell {
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
.sub {
  color: #999;
  font-size: 12px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
