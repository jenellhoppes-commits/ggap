<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { NButton, NCard, NDataTable, NInput, NSelect, NTag, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { DEFAULT_TABLE_PAGINATION, withTableSorters } from '../../../utils/tableSort'

interface RepairRow {
  job_id: string
  round_id: string
  player_id: string
  type: 'Provider 補單' | 'Callback 重送'
  reason: string
  last_error: string
  retry_count: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  updated_at: string
}

const message = useMessage()
const keyword = ref('')
const type = ref<string | null>(null)

const rows: RepairRow[] = [
  { job_id: 'RP-0001', round_id: 'R-20260708-8811', player_id: 'P-TWD-10001', type: 'Callback 重送', reason: '商戶 Callback timeout', last_error: 'HTTP 504 Gateway Timeout', retry_count: 2, status: 'pending', updated_at: '2026/7/8 13:50:00' },
  { job_id: 'RP-0002', round_id: 'R-20260708-8812', player_id: 'P-IDR-10022', type: 'Provider 補單', reason: 'Provider 回傳延遲', last_error: '-', retry_count: 1, status: 'success', updated_at: '2026/7/8 12:44:18' },
  { job_id: 'RP-0003', round_id: 'R-20260708-8813', player_id: 'P-PHP-10018', type: 'Callback 重送', reason: '商戶回應 500', last_error: 'HTTP 500 Internal Server Error', retry_count: 5, status: 'failed', updated_at: '2026/7/8 11:20:33' },
  { job_id: 'RP-0004', round_id: 'R-20260708-8814', player_id: 'P-VND-10044', type: 'Provider 補單', reason: '缺少 Win 回合', last_error: 'Provider tx not found', retry_count: 0, status: 'processing', updated_at: '2026/7/8 10:10:08' }
]

const filteredRows = computed(() => rows.filter((row) => {
  const text = `${row.job_id} ${row.round_id} ${row.player_id} ${row.reason} ${row.last_error}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase())) && (!type.value || row.type === type.value)
}))

const handleRetry = (row: RepairRow) => {
  message.info(`演示：已送出 ${row.job_id} 重送任務。`)
}

const columns: DataTableColumns<RepairRow> = [
  { title: '任務 ID', key: 'job_id', width: 120, render: row => h('span', { class: 'font-mono text-cyan-300' }, row.job_id) },
  { title: 'Round ID', key: 'round_id', width: 150, render: row => h('span', { class: 'font-mono' }, row.round_id) },
  { title: '會員 ID', key: 'player_id', width: 130, render: row => h('span', { class: 'font-mono' }, row.player_id) },
  { title: '類型', key: 'type', width: 130, render: row => h(NTag, { type: row.type === 'Provider 補單' ? 'info' : 'warning', size: 'small', bordered: false }, { default: () => row.type }) },
  { title: '原因', key: 'reason', minWidth: 160 },
  { title: '最後錯誤', key: 'last_error', minWidth: 210, ellipsis: { tooltip: true } },
  { title: '重試次數', key: 'retry_count', width: 105, align: 'right' },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    render: row => {
      const typeMap = { pending: 'warning', processing: 'info', success: 'success', failed: 'error' } as const
      const labelMap = { pending: '待處理', processing: '處理中', success: '成功', failed: '失敗' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '更新時間', key: 'updated_at', width: 170 },
  {
    title: '操作',
    key: 'actions',
    width: 170,
    fixed: 'right',
    render: row => h('div', { class: 'flex flex-wrap gap-2' }, [
      h(NButton, { size: 'small', secondary: true, disabled: row.status === 'success', onClick: () => handleRetry(row) }, { default: () => '重送' }),
      h(NButton, { size: 'small', secondary: true }, { default: () => 'Payload' })
    ])
  }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">補單 / 重送</h1>
      <p class="mt-2 text-sm text-gray-500">商戶追蹤 Provider 補單、商戶 Callback 重送、HTTP 狀態與重試紀錄。</p>
    </header>

    <n-card>
      <div class="mb-4 grid gap-3 md:grid-cols-[minmax(260px,1fr)_180px_auto]">
        <n-input v-model:value="keyword" clearable placeholder="搜尋任務 ID / Round ID / 會員 / 錯誤訊息" />
        <n-select v-model:value="type" clearable placeholder="任務類型" :options="[{ label: 'Provider 補單', value: 'Provider 補單' }, { label: 'Callback 重送', value: 'Callback 重送' }]" />
        <n-button tertiary @click="keyword = ''; type = null">重置</n-button>
      </div>
      <n-data-table :columns="withTableSorters(columns)" :data="filteredRows" :pagination="DEFAULT_TABLE_PAGINATION" :scroll-x="1320" striped />
    </n-card>
  </div>
</template>
