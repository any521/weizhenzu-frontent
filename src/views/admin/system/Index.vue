<template>
  <div class="admin-system">
    <h2 class="page-title">系统设置</h2>

    <el-tabs v-model="activeTab">
      <!-- 基础设置 -->
      <el-tab-pane label="基础设置" name="basic">
        <el-card shadow="never">
          <el-form
            ref="basicFormRef"
            :model="basicForm"
            :rules="basicRules"
            label-width="140px"
            style="max-width: 600px"
          >
            <el-form-item label="平台抽成比例(%)" prop="commissionRate">
              <el-input-number v-model="basicForm.commissionRate" :min="0" :max="50" :precision="1" />
              <span class="ml-8">商家每单抽成比例</span>
            </el-form-item>
            <el-form-item label="基础配送费(元)" prop="baseDeliveryFee">
              <el-input-number v-model="basicForm.baseDeliveryFee" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="免配送费门槛" prop="freeDeliveryThreshold">
              <el-input-number v-model="basicForm.freeDeliveryThreshold" :min="0" :precision="2" />
              <span class="ml-8">订单满此金额免配送费</span>
            </el-form-item>
            <el-form-item label="超距加价(元/km)" prop="extraFeePerKm">
              <el-input-number v-model="basicForm.extraFeePerKm" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item label="超距起算(km)" prop="extraFeeBaseKm">
              <el-input-number v-model="basicForm.extraFeeBaseKm" :min="0" :precision="1" />
            </el-form-item>
            <el-form-item label="订单自动取消(分钟)" prop="autoCancelMinutes">
              <el-input-number v-model="basicForm.autoCancelMinutes" :min="1" :max="60" />
              <span class="ml-8">未支付订单自动取消时间</span>
            </el-form-item>
            <el-form-item label="自动确认收货(小时)" prop="autoConfirmHours">
              <el-input-number v-model="basicForm.autoConfirmHours" :min="1" :max="168" />
            </el-form-item>
            <el-form-item label="平台服务热线" prop="servicePhone">
              <el-input v-model="basicForm.servicePhone" placeholder="请输入服务热线" />
            </el-form-item>
            <el-form-item label="平台公告">
              <el-input
                v-model="basicForm.announcement"
                type="textarea"
                :rows="3"
                placeholder="用户端首页公告"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="basicLoading" @click="onSaveBasic">保存设置</el-button>
              <el-button @click="onLoadBasic">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 角色权限管理 -->
      <el-tab-pane label="角色权限" name="role">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" :icon="Plus" @click="onAddRole">新增角色</el-button>
            </div>
          </template>
          <el-table :data="roleList" stripe style="width: 100%" empty-text="暂无角色">
            <el-table-column prop="name" label="角色名称" width="160" />
            <el-table-column prop="code" label="角色编码" width="160" />
            <el-table-column prop="desc" label="描述" min-width="200" />
            <el-table-column prop="userCount" label="用户数" width="100" align="center" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="onPermission(row)">权限配置</el-button>
                <el-button size="small" link type="primary" @click="onEditRole(row)">编辑</el-button>
                <el-button
                  v-if="row.code !== 'super_admin'"
                  size="small"
                  link
                  type="danger"
                  @click="onDeleteRole(row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 管理员账号 -->
      <el-tab-pane label="管理员账号" name="admin">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>管理员列表</span>
              <el-button type="primary" :icon="Plus" @click="onAddAdmin">新增管理员</el-button>
            </div>
          </template>
          <el-table :data="adminList" stripe style="width: 100%" empty-text="暂无管理员">
            <el-table-column prop="username" label="用户名" width="160" />
            <el-table-column prop="nickname" label="昵称" width="160" />
            <el-table-column prop="roleName" label="角色" width="160" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后登录" width="170">
              <template #default="{ row }">{{ formatDate(row.lastLoginAt) || '-' }}</template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="onEditAdmin(row)">编辑</el-button>
                <el-button size="small" link type="warning" @click="onResetPwd(row)">重置密码</el-button>
                <el-button
                  v-if="row.status === 1"
                  size="small"
                  link
                  type="danger"
                  @click="onToggleAdmin(row, 0)"
                >禁用</el-button>
                <el-button
                  v-else
                  size="small"
                  link
                  type="success"
                  @click="onToggleAdmin(row, 1)"
                >启用</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 角色 新增/编辑 弹窗 -->
    <el-dialog v-model="roleVisible" :title="roleTitle" width="500px" destroy-on-close>
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="90px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" :disabled="isEditRole" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.desc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="roleForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" :loading="roleLoading" @click="onSaveRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog v-model="permVisible" title="权限配置" width="560px" destroy-on-close>
      <div v-loading="permLoading">
        <el-tree
          ref="treeRef"
          :data="permTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="code"
          show-checkbox
          default-expand-all
          :default-checked-keys="checkedKeys"
        />
      </div>
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" :loading="permLoading" @click="onSavePermission">保存</el-button>
      </template>
    </el-dialog>

    <!-- 管理员 新增/编辑 弹窗 -->
    <el-dialog v-model="adminVisible" :title="adminTitle" width="500px" destroy-on-close>
      <el-form ref="adminFormRef" :model="adminForm" :rules="adminRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入用户名" :disabled="isEditAdmin" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="adminForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="adminForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="r in roleList"
              :key="r.id"
              :label="r.name"
              :value="r.id"
              :disabled="r.status !== 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEditAdmin" label="密码" prop="password">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="adminForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminVisible = false">取消</el-button>
        <el-button type="primary" :loading="adminLoading" @click="onSaveAdmin">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { request } from '@/api/request'
import { formatDate } from '@/utils/format'

const activeTab = ref('basic')

// ============ 基础设置 ============
const basicFormRef = ref<FormInstance>()
const basicLoading = ref(false)
const basicForm = reactive({
  commissionRate: 15,
  baseDeliveryFee: 3,
  freeDeliveryThreshold: 20,
  extraFeePerKm: 1,
  extraFeeBaseKm: 3,
  autoCancelMinutes: 15,
  autoConfirmHours: 24,
  servicePhone: '400-888-8888',
  announcement: ''
})
const basicRules: FormRules = {
  commissionRate: [{ required: true, message: '请输入抽成比例', trigger: 'blur' }],
  baseDeliveryFee: [{ required: true, message: '请输入配送费', trigger: 'blur' }]
}

async function onLoadBasic() {
  try {
    const res = await request({ url: '/admin/system/basic', method: 'GET' })
    Object.assign(basicForm, res)
  } catch {
    // ignore
  }
}

async function onSaveBasic() {
  if (!basicFormRef.value) return
  await basicFormRef.value.validate(async (valid) => {
    if (!valid) return
    basicLoading.value = true
    try {
      await request({ url: '/admin/system/basic', method: 'PUT', data: basicForm })
      ElMessage.success('保存成功')
    } catch {
      // ignore
    } finally {
      basicLoading.value = false
    }
  })
}

// ============ 角色管理 ============
interface Role {
  id: number
  name: string
  code: string
  desc: string
  status: number
  userCount: number
  createdAt: string
}

const roleList = ref<Role[]>([])
const roleVisible = ref(false)
const roleFormRef = ref<FormInstance>()
const roleLoading = ref(false)
const isEditRole = ref(false)
const roleForm = reactive({
  id: 0,
  name: '',
  code: '',
  desc: '',
  status: 1
})
const roleRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}
const roleTitle = computed(() => (isEditRole.value ? '编辑角色' : '新增角色'))

async function loadRoles() {
  try {
    const res = await request<Role[]>({ url: '/admin/system/roles', method: 'GET' })
    roleList.value = res || []
  } catch {
    roleList.value = [
      { id: 1, name: '超级管理员', code: 'super_admin', desc: '拥有所有权限', status: 1, userCount: 1, createdAt: '2024-01-01 10:00:00' },
      { id: 2, name: '运营', code: 'operator', desc: '日常运营管理', status: 1, userCount: 3, createdAt: '2024-01-01 10:00:00' },
      { id: 3, name: '客服', code: 'service', desc: '客服处理', status: 1, userCount: 5, createdAt: '2024-01-01 10:00:00' },
      { id: 4, name: '财务', code: 'finance', desc: '财务管理', status: 1, userCount: 2, createdAt: '2024-01-01 10:00:00' }
    ]
  }
}

function onAddRole() {
  isEditRole.value = false
  roleForm.id = 0
  roleForm.name = ''
  roleForm.code = ''
  roleForm.desc = ''
  roleForm.status = 1
  roleVisible.value = true
}

function onEditRole(row: Role) {
  isEditRole.value = true
  roleForm.id = row.id
  roleForm.name = row.name
  roleForm.code = row.code
  roleForm.desc = row.desc
  roleForm.status = row.status
  roleVisible.value = true
}

async function onSaveRole() {
  if (!roleFormRef.value) return
  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return
    roleLoading.value = true
    try {
      if (isEditRole.value) {
        await request({ url: `/admin/system/roles/${roleForm.id}`, method: 'PUT', data: roleForm })
      } else {
        await request({ url: '/admin/system/roles', method: 'POST', data: roleForm })
      }
      ElMessage.success('保存成功')
      roleVisible.value = false
      loadRoles()
    } catch {
      // ignore
    } finally {
      roleLoading.value = false
    }
  })
}

async function onDeleteRole(row: Role) {
  try {
    await ElMessageBox.confirm(`确定要删除角色「${row.name}」吗？`, '提示', { type: 'warning' })
    await request({ url: `/admin/system/roles/${row.id}`, method: 'DELETE' })
    ElMessage.success('删除成功')
    loadRoles()
  } catch {
    // cancel or error
  }
}

// ============ 权限配置 ============
const permVisible = ref(false)
const permLoading = ref(false)
const treeRef = ref<any>()
const checkedKeys = ref<string[]>([])
const currentRoleId = ref(0)
const permTree = ref<any[]>([
  {
    name: '用户管理', code: 'user', children: [
      { name: '查看用户', code: 'user:view' },
      { name: '启用/禁用', code: 'user:status' }
    ]
  },
  {
    name: '商家管理', code: 'merchant', children: [
      { name: '查看商家', code: 'merchant:view' },
      { name: '商家审核', code: 'merchant:audit' },
      { name: '启用/禁用', code: 'merchant:status' }
    ]
  },
  {
    name: '订单管理', code: 'order', children: [
      { name: '查看订单', code: 'order:view' },
      { name: '关闭订单', code: 'order:close' }
    ]
  },
  {
    name: '退款管理', code: 'refund', children: [
      { name: '查看退款', code: 'refund:view' },
      { name: '审核退款', code: 'refund:audit' }
    ]
  },
  {
    name: '财务管理', code: 'finance', children: [
      { name: '查看财务', code: 'finance:view' },
      { name: '商家结算', code: 'finance:settle' }
    ]
  },
  {
    name: '系统设置', code: 'system', children: [
      { name: '基础设置', code: 'system:basic' },
      { name: '角色管理', code: 'system:role' },
      { name: '管理员管理', code: 'system:admin' }
    ]
  }
])

async function onPermission(row: Role) {
  currentRoleId.value = row.id
  permVisible.value = true
  permLoading.value = true
  try {
    const res = await request<string[]>({
      url: `/admin/system/roles/${row.id}/permissions`,
      method: 'GET'
    })
    checkedKeys.value = res || []
  } catch {
    checkedKeys.value = []
  } finally {
    permLoading.value = false
  }
}

async function onSavePermission() {
  const keys = treeRef.value?.getCheckedKeys() || []
  const halfKeys = treeRef.value?.getHalfCheckedKeys() || []
  permLoading.value = true
  try {
    await request({
      url: `/admin/system/roles/${currentRoleId.value}/permissions`,
      method: 'PUT',
      data: { permissions: [...keys, ...halfKeys] }
    })
    ElMessage.success('保存成功')
    permVisible.value = false
  } catch {
    // ignore
  } finally {
    permLoading.value = false
  }
}

// ============ 管理员账号 ============
interface Admin {
  id: number
  username: string
  nickname: string
  roleId: number
  roleName: string
  status: number
  lastLoginAt: string
  createdAt: string
}

const adminList = ref<Admin[]>([])
const adminVisible = ref(false)
const adminFormRef = ref<FormInstance>()
const adminLoading = ref(false)
const isEditAdmin = ref(false)
const adminForm = reactive({
  id: 0,
  username: '',
  nickname: '',
  roleId: undefined as number | undefined,
  password: '',
  status: 1
})
const adminRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ]
}
const adminTitle = computed(() => (isEditAdmin.value ? '编辑管理员' : '新增管理员'))

async function loadAdmins() {
  try {
    const res = await request<Admin[]>({ url: '/admin/system/admins', method: 'GET' })
    adminList.value = res || []
  } catch {
    adminList.value = [
      { id: 1, username: 'admin', nickname: '超级管理员', roleId: 1, roleName: '超级管理员', status: 1, lastLoginAt: '2024-06-17 09:00:00', createdAt: '2024-01-01 10:00:00' },
      { id: 2, username: 'operator01', nickname: '运营小王', roleId: 2, roleName: '运营', status: 1, lastLoginAt: '2024-06-17 08:30:00', createdAt: '2024-02-01 10:00:00' },
      { id: 3, username: 'service01', nickname: '客服小李', roleId: 3, roleName: '客服', status: 0, lastLoginAt: '2024-06-15 17:00:00', createdAt: '2024-03-01 10:00:00' }
    ]
  }
}

function onAddAdmin() {
  isEditAdmin.value = false
  adminForm.id = 0
  adminForm.username = ''
  adminForm.nickname = ''
  adminForm.roleId = undefined
  adminForm.password = ''
  adminForm.status = 1
  adminVisible.value = true
}

function onEditAdmin(row: Admin) {
  isEditAdmin.value = true
  adminForm.id = row.id
  adminForm.username = row.username
  adminForm.nickname = row.nickname
  adminForm.roleId = row.roleId
  adminForm.password = ''
  adminForm.status = row.status
  adminVisible.value = true
}

async function onSaveAdmin() {
  if (!adminFormRef.value) return
  await adminFormRef.value.validate(async (valid) => {
    if (!valid) return
    adminLoading.value = true
    try {
      if (isEditAdmin.value) {
        await request({ url: `/admin/system/admins/${adminForm.id}`, method: 'PUT', data: adminForm })
      } else {
        await request({ url: '/admin/system/admins', method: 'POST', data: adminForm })
      }
      ElMessage.success('保存成功')
      adminVisible.value = false
      loadAdmins()
    } catch {
      // ignore
    } finally {
      adminLoading.value = false
    }
  })
}

async function onResetPwd(row: Admin) {
  try {
    await ElMessageBox.confirm(`确认重置「${row.nickname}」的密码为默认密码？`, '重置密码', {
      type: 'warning'
    })
    await request({ url: `/admin/system/admins/${row.id}/reset-password`, method: 'POST' })
    ElMessage.success('密码已重置')
  } catch {
    // cancel or error
  }
}

async function onToggleAdmin(row: Admin, status: number) {
  const action = status === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}管理员「${row.nickname}」吗？`, '提示', {
      type: 'warning'
    })
    await request({
      url: `/admin/system/admins/${row.id}/status`,
      method: 'PUT',
      params: { status }
    })
    ElMessage.success(`${action}成功`)
    loadAdmins()
  } catch {
    // cancel or error
  }
}

onMounted(() => {
  onLoadBasic()
  loadRoles()
  loadAdmins()
})
</script>

<style scoped lang="scss">
.admin-system {
  padding: 16px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ml-8 {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}
</style>
