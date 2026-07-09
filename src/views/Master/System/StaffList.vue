<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  NAlert,
  NButton,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NStatistic,
  NSwitch,
  NTag,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { EditOutlined, LockResetOutlined, SearchOutlined, VisibilityOutlined } from '@vicons/material'
import { withTableSorters } from '../../../utils/tableSort'

type StaffStatus = 'active' | 'disabled' | 'locked'

interface StaffRow {
  id: number
  username: string
  realname: string
  email: string
  role: string
  role_id: string
  status: StaffStatus
  departments: string[]
  login_mfa: boolean
  ip_restriction: boolean
  last_login: string
  created_at: string
  remarks: string
  logs: Array<{ action: string; operator: string; time: string; trace_id: string }>
}

const message = useMessage()
const keyword = ref('')
const statusFilter = ref<StaffStatus | null>(null)
const roleFilter = ref<string | null>(null)
const showEditor = ref(false)
const showDetail = ref(false)
const currentRow = ref<StaffRow | null>(null)
const editorMode = ref<'create' | 'edit'>('create')
const form = ref({
  id: 0,
  username: '',
  realname: '',
  email: '',
  role_id: 'ROLE-OPS',
  status: 'active' as StaffStatus,
  login_mfa: true,
  ip_restriction: false,
  remarks: ''
})

const rows = ref<StaffRow[]>([
  {
    id: 1,
    username: 'admin',
    realname: '系統管理員',
    email: 'admin@ggap.local',
    role: 'Super Administrator',
    role_id: 'ROLE-SUPER',
    status: 'active',
    departments: ['系統管理', '財務中心'],
    login_mfa: true,
    ip_restriction: true,
    last_login: '2026-07-07T09:22:00+08:00',
    created_at: '2026-01-02T10:00:00+08:00',
    remarks: '最高權限帳號',
    logs: [
      { action: '登入成功', operator: 'admin', time: '2026-07-07T09:22:00+08:00', trace_id: 'trace-login-admin' },
      { action: '修改系統設定', operator: 'admin', time: '2026-07-06T18:30:00+08:00', trace_id: 'trace-system-setting' }
    ]
  },
  {
    id: 2,
    username: 'finance01',
    realname: 'Finance Operator',
    email: 'finance01@ggap.local',
    role: 'Finance Manager',
    role_id: 'ROLE-FINANCE',
    status: 'active',
    departments: ['財務中心'],
    login_mfa: true,
    ip_restriction: true,
    last_login: '2026-07-07T08:50:00+08:00',
    created_at: '2026-03-12T11:20:00+08:00',
    remarks: '可管理代理帳務與供應商帳務',
    logs: [
      { action: '確認代理應收帳單', operator: 'finance01', time: '2026-07-07T01:42:00+08:00', trace_id: 'trace-sea-confirm' }
    ]
  },
  {
    id: 3,
    username: 'ops02',
    realname: 'Ops Specialist',
    email: 'ops02@ggap.local',
    role: 'Operations',
    role_id: 'ROLE-OPS',
    status: 'active',
    departments: ['商務管理', '內容管理', '交易中心'],
    login_mfa: false,
    ip_restriction: false,
    last_login: '2026-07-06T22:14:00+08:00',
    created_at: '2026-04-18T15:00:00+08:00',
    remarks: '日常營運帳號',
    logs: [
      { action: '建立補單工單', operator: 'ops02', time: '2026-07-07T10:08:00+08:00', trace_id: 'trace-repair-create' }
    ]
  },
  {
    id: 4,
    username: 'auditor',
    realname: 'Audit Viewer',
    email: 'audit@ggap.local',
    role: 'Audit Readonly',
    role_id: 'ROLE-AUDIT',
    status: 'locked',
    departments: ['品質中心', '系統管理'],
    login_mfa: true,
    ip_restriction: true,
    last_login: '2026-07-01T14:22:00+08:00',
    created_at: '2026-05-09T09:30:00+08:00',
    remarks: '連續登入失敗後鎖定',
    logs: [
      { action: '登入失敗次數過高，自動鎖定', operator: 'System', time: '2026-07-07T02:20:00+08:00', trace_id: 'trace-lock-audit' }
    ]
  }
])

const roleOptions = [
  { label: 'Super Administrator', value: 'ROLE-SUPER' },
  { label: 'Finance Manager', value: 'ROLE-FINANCE' },
  { label: 'Operations', value: 'ROLE-OPS' },
  { label: 'Audit Readonly', value: 'ROLE-AUDIT' }
]
const statusOptions = [
  { label: '啟用', value: 'active' },
  { label: '停用', value: 'disabled' },
  { label: '鎖定', value: 'locked' }
]
const statusMeta: Record<StaffStatus, { label: string; type: 'success' | 'warning' | 'error' }> = {
  active: { label: '啟用', type: 'success' },
  disabled: { label: '停用', type: 'warning' },
  locked: { label: '鎖定', type: 'error' }
}

const formatDateTime = (value: string) => new Date(value).toLocaleString()
const roleName = (roleId: string) => roleOptions.find(option => option.value === roleId)?.label || roleId

const filteredRows = computed(() => rows.value.filter((row) => {
  const text = keyword.value.trim().toLowerCase()
  const matchesKeyword = !text
    || row.username.toLowerCase().includes(text)
    || row.realname.toLowerCase().includes(text)
    || row.email.toLowerCase().includes(text)
  const matchesStatus = !statusFilter.value || row.status === statusFilter.value
  const matchesRole = !roleFilter.value || row.role_id === roleFilter.value
  return matchesKeyword && matchesStatus && matchesRole
}))

const summary = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter(row => row.status === 'active').length,
  locked: rows.value.filter(row => row.status === 'locked').length,
  mfa: rows.value.filter(row => row.login_mfa).length
}))

const openDetail = (row: StaffRow) => {
  currentRow.value = row
  showDetail.value = true
}
const openCreate = () => {
  editorMode.value = 'create'
  form.value = {
    id: 0,
    username: '',
    realname: '',
    email: '',
    role_id: 'ROLE-OPS',
    status: 'active',
    login_mfa: true,
    ip_restriction: false,
    remarks: ''
  }
  showEditor.value = true
}
const openEdit = (row: StaffRow) => {
  editorMode.value = 'edit'
  form.value = {
    id: row.id,
    username: row.username,
    realname: row.realname,
    email: row.email,
    role_id: row.role_id,
    status: row.status,
    login_mfa: row.login_mfa,
    ip_restriction: row.ip_restriction,
    remarks: row.remarks
  }
  showEditor.value = true
}

const saveStaff = () => {
  if (!form.value.username || !form.value.realname || !form.value.email) {
    message.warning('請填寫帳號、姓名與 Email')
    return
  }
  if (editorMode.value === 'create') {
    const next: StaffRow = {
      id: Date.now(),
      username: form.value.username,
      realname: form.value.realname,
      email: form.value.email,
      role: roleName(form.value.role_id),
      role_id: form.value.role_id,
      status: form.value.status,
      departments: ['系統管理'],
      login_mfa: form.value.login_mfa,
      ip_restriction: form.value.ip_restriction,
      last_login: '-',
      created_at: new Date().toISOString(),
      remarks: form.value.remarks || '新建人員，等待首次登入',
      logs: [{ action: '新增後台人員', operator: 'admin', time: new Date().toISOString(), trace_id: `trace-staff-${Date.now()}` }]
    }
    rows.value.unshift(next)
    currentRow.value = next
    message.success('人員已建立')
  } else {
    const row = rows.value.find(item => item.id === form.value.id)
    if (row) {
      row.realname = form.value.realname
      row.email = form.value.email
      row.role_id = form.value.role_id
      row.role = roleName(form.value.role_id)
      row.status = form.value.status
      row.login_mfa = form.value.login_mfa
      row.ip_restriction = form.value.ip_restriction
      row.remarks = form.value.remarks
      row.logs.unshift({ action: '修改人員資料', operator: 'admin', time: new Date().toISOString(), trace_id: `trace-staff-update-${Date.now()}` })
      message.success('人員已更新')
    }
  }
  showEditor.value = false
}

const resetPassword = (row: StaffRow) => {
  row.logs.unshift({ action: '重置登入密碼', operator: 'admin', time: new Date().toISOString(), trace_id: `trace-pwd-${Date.now()}` })
  message.success(`${row.username} 已重置密碼，將於下次登入變更`)
}

const toggleStatus = (row: StaffRow) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  row.logs.unshift({ action: row.status === 'active' ? '啟用人員' : '停用人員', operator: 'admin', time: new Date().toISOString(), trace_id: `trace-status-${Date.now()}` })
  message.success(`${row.username}：${statusMeta[row.status].label}`)
}

const resetFilters = () => {
  keyword.value = ''
  statusFilter.value = null
  roleFilter.value = null
}

const columns: DataTableColumns<StaffRow> = [
  { title: '帳號', key: 'username', width: 180, fixed: 'left', render: row => h('button', { class: 'font-mono text-cyan-500 hover:text-cyan-400', onClick: () => openDetail(row) }, row.username) },
  { title: '姓名', key: 'realname', width: 170 },
  { title: 'Email', key: 'email', minWidth: 220 },
  { title: '角色', key: 'role', width: 180, render: row => h(NTag, { type: row.role_id === 'ROLE-SUPER' ? 'error' : 'info', bordered: false, size: 'small' }, { default: () => row.role }) },
  { title: '狀態', key: 'status', width: 100, render: row => h(NTag, { type: statusMeta[row.status].type, bordered: false, size: 'small' }, { default: () => statusMeta[row.status].label }) },
  { title: 'MFA', key: 'login_mfa', width: 90, render: row => row.login_mfa ? '啟用' : '未啟用' },
  { title: 'IP 限制', key: 'ip_restriction', width: 100, render: row => row.ip_restriction ? '啟用' : '未啟用' },
  { title: '最後登入', key: 'last_login', width: 180, render: row => row.last_login === '-' ? '-' : formatDateTime(row.last_login) },
  {
    title: '操作',
    key: 'actions',
    width: 300,
    fixed: 'right',
    render: row => h(NSpace, { size: 6, wrap: false }, {
      default: () => [
        h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { icon: () => h(VisibilityOutlined), default: () => '查看' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => openEdit(row) }, { icon: () => h(EditOutlined), default: () => '編輯' }),
        h(NButton, { size: 'small', secondary: true, onClick: () => resetPassword(row) }, { icon: () => h(LockResetOutlined), default: () => '重置' }),
        h(NButton, { size: 'small', type: row.status === 'active' ? 'warning' : 'primary', secondary: true, onClick: () => toggleStatus(row) }, { default: () => row.status === 'active' ? '停用' : '啟用' })
      ]
    })
  }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">人員與權限</h1>
        <p class="mt-1 text-sm text-gray-500">
          管理後台人員、角色、MFA、IP 限制、登入狀態與操作紀錄。
        </p>
      </div>
      <n-button type="primary" @click="openCreate">新增人員</n-button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="人員總數" :value="summary.total" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="啟用帳號" :value="summary.active" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="鎖定帳號" :value="summary.locked" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="已啟用 MFA" :value="summary.mfa" /></div>
    </div>

    <n-alert type="info" :show-icon="false">
      人員權限建議由角色統一控管，重要操作需 MFA 與操作紀錄；後續三入口登入可沿用同一套身分與角色模型。
    </n-alert>

    <div class="rounded border border-white/10 bg-[#202026] p-4">
      <div class="grid gap-3 xl:grid-cols-12">
        <n-input v-model:value="keyword" clearable placeholder="搜尋帳號 / 姓名 / Email" class="xl:col-span-4">
          <template #prefix><n-icon :component="SearchOutlined" /></template>
        </n-input>
        <n-select v-model:value="roleFilter" clearable placeholder="角色" :options="roleOptions" class="xl:col-span-2" />
        <n-select v-model:value="statusFilter" clearable placeholder="狀態" :options="statusOptions" class="xl:col-span-2" />
        <n-button secondary class="xl:col-span-1" @click="resetFilters">重置</n-button>
      </div>
    </div>

    <n-data-table :columns="withTableSorters(columns)" :data="filteredRows" :pagination="{ pageSize: 10 }" :scroll-x="1500" />

    <n-modal v-model:show="showEditor" preset="card" :title="editorMode === 'create' ? '新增人員' : '編輯人員'" style="width: min(640px, 92vw);">
      <n-form label-placement="left" label-width="110">
        <n-form-item label="帳號"><n-input v-model:value="form.username" :disabled="editorMode === 'edit'" /></n-form-item>
        <n-form-item label="姓名"><n-input v-model:value="form.realname" /></n-form-item>
        <n-form-item label="Email"><n-input v-model:value="form.email" /></n-form-item>
        <n-form-item label="角色"><n-select v-model:value="form.role_id" :options="roleOptions" /></n-form-item>
        <n-form-item label="狀態"><n-select v-model:value="form.status" :options="statusOptions" /></n-form-item>
        <n-form-item label="MFA">
          <n-switch v-model:value="form.login_mfa">
            <template #checked>啟用</template>
            <template #unchecked>未啟用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="IP 限制">
          <n-switch v-model:value="form.ip_restriction">
            <template #checked>啟用</template>
            <template #unchecked>未啟用</template>
          </n-switch>
        </n-form-item>
        <n-form-item label="備註"><n-input v-model:value="form.remarks" type="textarea" /></n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showEditor = false">取消</n-button>
          <n-button type="primary" @click="saveStaff">儲存</n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="showDetail" width="min(860px, 100vw)">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex items-center gap-3">
            <span class="font-semibold">{{ currentRow.realname }}</span>
            <n-tag :bordered="false">{{ currentRow.username }}</n-tag>
            <n-tag :type="statusMeta[currentRow.status].type" :bordered="false">{{ statusMeta[currentRow.status].label }}</n-tag>
          </div>
        </template>
        <template v-if="currentRow">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="帳號">{{ currentRow.username }}</n-descriptions-item>
            <n-descriptions-item label="姓名">{{ currentRow.realname }}</n-descriptions-item>
            <n-descriptions-item label="Email">{{ currentRow.email }}</n-descriptions-item>
            <n-descriptions-item label="角色">{{ currentRow.role }}</n-descriptions-item>
            <n-descriptions-item label="MFA">{{ currentRow.login_mfa ? '啟用' : '未啟用' }}</n-descriptions-item>
            <n-descriptions-item label="IP 限制">{{ currentRow.ip_restriction ? '啟用' : '未啟用' }}</n-descriptions-item>
            <n-descriptions-item label="最後登入">{{ currentRow.last_login === '-' ? '-' : formatDateTime(currentRow.last_login) }}</n-descriptions-item>
            <n-descriptions-item label="建立時間">{{ formatDateTime(currentRow.created_at) }}</n-descriptions-item>
            <n-descriptions-item label="部門" :span="2">
              <n-space size="small">
                <n-tag v-for="department in currentRow.departments" :key="department" size="small" :bordered="false">{{ department }}</n-tag>
              </n-space>
            </n-descriptions-item>
            <n-descriptions-item label="備註" :span="2">{{ currentRow.remarks }}</n-descriptions-item>
          </n-descriptions>
          <h3 class="mt-6 mb-3 text-base font-semibold">操作紀錄</h3>
          <n-timeline>
            <n-timeline-item
              v-for="log in currentRow.logs"
              :key="log.trace_id"
              type="success"
              :title="log.action"
              :content="`${log.operator} / ${log.trace_id}`"
              :time="formatDateTime(log.time)"
            />
          </n-timeline>
        </template>
        <template #footer>
          <div v-if="currentRow" class="flex justify-end gap-2">
            <n-button secondary @click="resetPassword(currentRow)">重置密碼</n-button>
            <n-button type="primary" secondary @click="openEdit(currentRow)">編輯人員</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>
