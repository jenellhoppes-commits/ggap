<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NIcon,
  NInput,
  NSelect,
  NStatistic,
  NTag,
  useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutlined, VisibilityOutlined } from '@vicons/material'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

type AuditAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'APPROVE' | 'EXPORT' | 'SECURITY' | 'SYSTEM'
type AuditLevel = 'info' | 'warning' | 'critical'

interface AuditRow {
  id: string
  time: string
  operator: string
  action: AuditAction
  level: AuditLevel
  center: string
  target_type: string
  target_id: string
  ip: string
  trace_id: string
  details: Record<string, unknown>
}

const keyword = ref('')
const message = useMessage()
const actionFilter = ref<AuditAction | null>(null)
const levelFilter = ref<AuditLevel | null>(null)
const range = ref<[number, number] | null>(null)
const showDetail = ref(false)
const currentRow = ref<AuditRow | null>(null)

const rows = ref<AuditRow[]>([
  {
    id: 'AUD-20260707-0001',
    time: '2026-07-07T09:22:00+08:00',
    operator: 'admin',
    action: 'LOGIN',
    level: 'info',
    center: '系統管理',
    target_type: 'STAFF',
    target_id: 'admin',
    ip: '203.0.113.10',
    trace_id: 'trace-login-admin',
    details: { result: 'success', mfa: true, user_agent: 'Chrome / Windows' }
  },
  {
    id: 'AUD-20260707-0002',
    time: '2026-07-07T01:42:00+08:00',
    operator: 'finance01',
    action: 'APPROVE',
    level: 'warning',
    center: '財務中心',
    target_type: 'AGENT_INVOICE',
    target_id: 'AINV-202607-SEA',
    ip: '203.0.113.10',
    trace_id: 'trace-sea-confirm',
    details: { amount: 71342.8, currency: 'USDT', approval: 'confirmed' }
  },
  {
    id: 'AUD-20260707-0003',
    time: '2026-07-07T00:18:00+08:00',
    operator: 'Finance Manager',
    action: 'APPROVE',
    level: 'critical',
    center: '財務中心',
    target_type: 'EXCHANGE_RATE',
    target_id: 'FX-20260707-VND',
    ip: '203.0.113.10',
    trace_id: 'trace-fx-vnd-confirm',
    details: { base_rate: 26320, variation: '4.86%', reason: 'manual confirm abnormal FX rate' }
  },
  {
    id: 'AUD-20260707-0004',
    time: '2026-07-06T18:30:00+08:00',
    operator: 'admin',
    action: 'UPDATE',
    level: 'warning',
    center: '系統管理',
    target_type: 'SYSTEM_SETTING',
    target_id: 'SECURITY',
    ip: '203.0.113.10',
    trace_id: 'trace-system-security',
    details: { mfa_required: true, password_expire_days: 90, session_timeout_minutes: 30 }
  },
  {
    id: 'AUD-20260706-0005',
    time: '2026-07-06T14:20:00+08:00',
    operator: 'ops02',
    action: 'CREATE',
    level: 'info',
    center: '交易中心',
    target_type: 'REPAIR_JOB',
    target_id: 'RP-20260706-000032',
    ip: '198.51.100.20',
    trace_id: 'trace-pp-mismatch',
    details: { reason: 'Amount Mismatch', wallet_mode: 'transfer', status: 'processing' }
  },
  {
    id: 'AUD-20260707-0006',
    time: '2026-07-07T10:42:00+08:00',
    operator: 'System',
    action: 'SECURITY',
    level: 'critical',
    center: '品質中心',
    target_type: 'MONITORING_ALERT',
    target_id: 'ALERT-CB-001',
    ip: '127.0.0.1',
    trace_id: 'trace-cb-timeout-op1001',
    details: {
      source_module: 'Callback Service',
      metric: 'Timeout Rate',
      current_value: '18.6%',
      threshold: '5%',
      affected_merchant: 'OP-1001',
      action: 'trigger_alert'
    }
  },
  {
    id: 'AUD-20260707-0007',
    time: '2026-07-07T10:45:00+08:00',
    operator: 'admin',
    action: 'UPDATE',
    level: 'warning',
    center: '品質中心',
    target_type: 'RISK_RULE',
    target_id: 'RISK-API-001',
    ip: '203.0.113.10',
    trace_id: 'trace-risk-api-update',
    details: {
      before: { threshold: '30 筆', action: '告警通知' },
      after: { threshold: '20 筆', action: '限制 API' },
      reason: 'Callback Timeout 命中筆數升高',
      two_factor_verified: true
    }
  }
])

const actionOptions = [
  { label: '登入', value: 'LOGIN' },
  { label: '新增', value: 'CREATE' },
  { label: '修改', value: 'UPDATE' },
  { label: '審核', value: 'APPROVE' },
  { label: '匯出', value: 'EXPORT' },
  { label: '安全', value: 'SECURITY' },
  { label: '系統', value: 'SYSTEM' }
]

const levelOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' }
]

const actionMeta: Record<AuditAction, { label: string; type: 'success' | 'info' | 'warning' | 'error' }> = {
  LOGIN: { label: '登入', type: 'success' },
  CREATE: { label: '新增', type: 'info' },
  UPDATE: { label: '修改', type: 'warning' },
  APPROVE: { label: '審核', type: 'warning' },
  EXPORT: { label: '匯出', type: 'info' },
  SECURITY: { label: '安全', type: 'error' },
  SYSTEM: { label: '系統', type: 'info' }
}

const levelMeta: Record<AuditLevel, { label: string; type: 'success' | 'warning' | 'error' }> = {
  info: { label: 'Info', type: 'success' },
  warning: { label: 'Warning', type: 'warning' },
  critical: { label: 'Critical', type: 'error' }
}

const formatDateTime = (value: string) => new Date(value).toLocaleString()

const filteredRows = computed(() => rows.value.filter((row) => {
  const text = keyword.value.trim().toLowerCase()
  const matchesKeyword = !text
    || row.operator.toLowerCase().includes(text)
    || row.target_id.toLowerCase().includes(text)
    || row.trace_id.toLowerCase().includes(text)
    || row.center.toLowerCase().includes(text)
  const matchesAction = !actionFilter.value || row.action === actionFilter.value
  const matchesLevel = !levelFilter.value || row.level === levelFilter.value
  const matchesRange = !range.value || (new Date(row.time).getTime() >= range.value[0] && new Date(row.time).getTime() <= range.value[1])
  return matchesKeyword && matchesAction && matchesLevel && matchesRange
}))

const summary = computed(() => ({
  total: filteredRows.value.length,
  critical: filteredRows.value.filter(row => row.level === 'critical').length,
  finance: filteredRows.value.filter(row => row.center === '財務中心').length,
  system: filteredRows.value.filter(row => row.center === '系統管理').length,
  quality: filteredRows.value.filter(row => row.center === '品質中心').length
}))

const openDetail = (row: AuditRow) => {
  currentRow.value = row
  showDetail.value = true
}

const resetFilters = () => {
  keyword.value = ''
  actionFilter.value = null
  levelFilter.value = null
  range.value = null
}

const exportLogs = () => {
  message.success('已匯出操作紀錄')
}

const columns: DataTableColumns<AuditRow> = [
  { title: '時間', key: 'time', width: 180, fixed: 'left', render: row => formatDateTime(row.time) },
  { title: '操作人', key: 'operator', width: 130 },
  { title: '中心', key: 'center', width: 120 },
  { title: '動作', key: 'action', width: 100, render: row => h(NTag, { type: actionMeta[row.action].type, bordered: false, size: 'small' }, { default: () => actionMeta[row.action].label }) },
  { title: '等級', key: 'level', width: 100, render: row => h(NTag, { type: levelMeta[row.level].type, bordered: false, size: 'small' }, { default: () => levelMeta[row.level].label }) },
  { title: '對象', key: 'target_id', minWidth: 220, render: row => h('div', [h('div', { class: 'font-mono text-xs' }, row.target_id), h('div', { class: 'text-xs text-gray-500' }, row.target_type)]) },
  { title: 'IP', key: 'ip', width: 140, render: row => h('span', { class: 'font-mono text-xs' }, row.ip) },
  { title: 'Trace ID', key: 'trace_id', width: 190, render: row => h('span', { class: 'font-mono text-xs' }, row.trace_id) },
  { title: '操作', key: 'actions', width: 100, fixed: 'right', render: row => h(NButton, { size: 'small', secondary: true, onClick: () => openDetail(row) }, { icon: () => h(VisibilityOutlined), default: () => '查看' }) }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">操作紀錄</h1>
        <p class="mt-1 text-sm text-gray-500">
          查詢登入、新增、修改、審核、匯出、安全事件與系統操作，保留 Trace ID 便於後端追蹤。
        </p>
      </div>
      <n-button type="primary" secondary @click="exportLogs">匯出紀錄</n-button>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="紀錄總數" :value="summary.total" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="Critical" :value="summary.critical" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="財務中心" :value="summary.finance" /></div>
      <div class="rounded border border-white/10 bg-[#202026] p-4"><n-statistic label="品質中心" :value="summary.quality" /></div>
    </div>

    <div class="rounded border border-white/10 bg-[#202026] p-4">
      <div class="grid gap-3 xl:grid-cols-12">
        <n-input v-model:value="keyword" clearable placeholder="搜尋操作人 / 對象 / Trace ID / 中心" class="xl:col-span-4">
          <template #prefix><n-icon :component="SearchOutlined" /></template>
        </n-input>
        <n-date-picker v-model:value="range" type="datetimerange" clearable class="xl:col-span-3" />
        <n-select v-model:value="actionFilter" clearable placeholder="動作" :options="actionOptions" class="xl:col-span-2" />
        <n-select v-model:value="levelFilter" clearable placeholder="等級" :options="levelOptions" class="xl:col-span-2" />
        <n-button secondary class="xl:col-span-1" @click="resetFilters">重置</n-button>
      </div>
    </div>

    <n-data-table :columns="withTableSorters(columns)" :data="filteredRows" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="1380" />

    <n-drawer v-model:show="showDetail" width="min(760px, 100vw)">
      <n-drawer-content closable>
        <template #header>
          <div v-if="currentRow" class="flex items-center gap-3">
            <span class="font-mono font-semibold">{{ currentRow.id }}</span>
            <n-tag :type="levelMeta[currentRow.level].type" :bordered="false">{{ levelMeta[currentRow.level].label }}</n-tag>
          </div>
        </template>
        <template v-if="currentRow">
          <n-descriptions bordered :column="2" label-placement="left">
            <n-descriptions-item label="時間">{{ formatDateTime(currentRow.time) }}</n-descriptions-item>
            <n-descriptions-item label="操作人">{{ currentRow.operator }}</n-descriptions-item>
            <n-descriptions-item label="中心">{{ currentRow.center }}</n-descriptions-item>
            <n-descriptions-item label="動作">{{ actionMeta[currentRow.action].label }}</n-descriptions-item>
            <n-descriptions-item label="對象">{{ currentRow.target_type }} / {{ currentRow.target_id }}</n-descriptions-item>
            <n-descriptions-item label="IP">{{ currentRow.ip }}</n-descriptions-item>
            <n-descriptions-item label="Trace ID" :span="2">{{ currentRow.trace_id }}</n-descriptions-item>
          </n-descriptions>
          <div class="mt-5">
            <div class="mb-2 text-sm text-gray-500">操作內容</div>
            <pre class="audit-json"><code>{{ JSON.stringify(currentRow.details, null, 2) }}</code></pre>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.audit-json {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 6px;
  background: #101014;
  padding: 12px;
  color: #d6deeb;
  font-size: 12px;
  line-height: 1.65;
}
</style>
