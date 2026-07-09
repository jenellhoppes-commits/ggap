<script setup lang="ts">
import { h } from 'vue'
import { NButton, NCard, NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface CallbackLogRow {
  callback_id: string
  event_type: 'Bet' | 'Win' | 'Refund'
  round_id: string
  player_id: string
  url: string
  http_status: number
  retry_count: number
  status: 'success' | 'failed' | 'retrying'
  last_sent_at: string
}

const rows: CallbackLogRow[] = [
  { callback_id: 'CB-0001', event_type: 'Bet', round_id: 'R-20260708-8811', player_id: 'P-TWD-10001', url: 'https://merchant.example.com/callback', http_status: 200, retry_count: 0, status: 'success', last_sent_at: '2026/7/8 13:41:12' },
  { callback_id: 'CB-0002', event_type: 'Win', round_id: 'R-20260708-8811', player_id: 'P-TWD-10001', url: 'https://merchant.example.com/callback', http_status: 504, retry_count: 2, status: 'retrying', last_sent_at: '2026/7/8 13:43:20' },
  { callback_id: 'CB-0003', event_type: 'Refund', round_id: 'R-20260708-8813', player_id: 'P-PHP-10018', url: 'https://merchant.example.com/callback', http_status: 500, retry_count: 5, status: 'failed', last_sent_at: '2026/7/8 11:21:08' }
]

const columns: DataTableColumns<CallbackLogRow> = [
  { title: 'Callback ID', key: 'callback_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono text-cyan-300' }, row.callback_id) },
  { title: '事件', key: 'event_type', width: 100, sorter: 'default' },
  { title: 'Round ID', key: 'round_id', sorter: 'default', render: (row) => h('span', { class: 'font-mono' }, row.round_id) },
  { title: '會員 ID', key: 'player_id', sorter: 'default' },
  { title: 'URL', key: 'url', ellipsis: { tooltip: true } },
  { title: 'HTTP', key: 'http_status', width: 90, align: 'right', sorter: (a, b) => a.http_status - b.http_status },
  { title: '重試', key: 'retry_count', width: 90, align: 'right', sorter: (a, b) => a.retry_count - b.retry_count },
  {
    title: '狀態',
    key: 'status',
    width: 110,
    sorter: 'default',
    render: (row) => {
      const typeMap = { success: 'success', failed: 'error', retrying: 'warning' } as const
      const labelMap = { success: '成功', failed: '失敗', retrying: '重試中' }
      return h(NTag, { type: typeMap[row.status], size: 'small', bordered: false }, { default: () => labelMap[row.status] })
    }
  },
  { title: '最後送出', key: 'last_sent_at', width: 170, sorter: 'default' },
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
      <h1 class="text-2xl font-bold text-white">Callback 紀錄</h1>
      <p class="mt-2 text-sm text-gray-500">商戶追蹤 Callback 發送結果、HTTP 狀態與重試紀錄。</p>
    </header>

    <n-card>
      <n-data-table :columns="columns" :data="rows" :pagination="{ pageSize: 10 }" striped />
    </n-card>
  </div>
</template>
