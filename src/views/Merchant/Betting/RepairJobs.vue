<script setup lang="ts">
import { h } from 'vue'
import { NButton, NCard, NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface RepairRow {
  job_id: string
  round_id: string
  player_id: string
  type: '補單' | 'Callback 重送'
  reason: string
  retry_count: number
  status: 'pending' | 'success' | 'failed'
  updated_at: string
}

const rows: RepairRow[] = [
  { job_id: 'RP-0001', round_id: 'R-20260708-8811', player_id: 'P-TWD-10001', type: 'Callback 重送', reason: '商戶 Callback timeout', retry_count: 2, status: 'pending', updated_at: '2026/7/8 13:50:00' },
  { job_id: 'RP-0002', round_id: 'R-20260708-8812', player_id: 'P-IDR-10022', type: '補單', reason: 'Provider 回傳延遲', retry_count: 1, status: 'success', updated_at: '2026/7/8 12:44:18' },
  { job_id: 'RP-0003', round_id: 'R-20260708-8813', player_id: 'P-PHP-10018', type: 'Callback 重送', reason: 'HTTP 500', retry_count: 5, status: 'failed', updated_at: '2026/7/8 11:20:33' }
]

const columns: DataTableColumns<RepairRow> = [
  { title: '任務 ID', key: 'job_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.job_id) },
  { title: 'Round ID', key: 'round_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono' }, row.round_id) },
  { title: '會員 ID', key: 'player_id', sorter: 'default' },
  { title: '類型', key: 'type', width: 130, sorter: 'default' },
  { title: '原因', key: 'reason', sorter: 'default' },
  { title: '重試次數', key: 'retry_count', width: 110, align: 'right', sorter: (a, b) => a.retry_count - b.retry_count },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    sorter: 'default',
    render: (row) => {
      const typeMap = { pending: 'warning', success: 'success', failed: 'error' } as const
      const labelMap = { pending: '待處理', success: '成功', failed: '失敗' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '更新時間', key: 'updated_at', width: 170, sorter: 'default' },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => h(NButton, { size: 'small', secondary: true, disabled: row.status === 'success' }, { default: () => '重送' })
  }
]
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-white">補單 / 重送</h1>
      <p class="mt-2 text-sm text-gray-500">商戶追蹤異常注單、Provider 延遲與 Callback 重送結果。</p>
    </header>

    <n-card>
      <n-data-table :columns="columns" :data="rows" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
